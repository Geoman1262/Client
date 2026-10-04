import puppeteer from "@cloudflare/puppeteer";

const SMARTFLOW_LOGIN = "https://celllilo.smartflowsystems.net/HO.php";
const MAX_CONTEXTS = 4;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function esc(v = "") {
  return String(v).replace(/[&<>\"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[c]));
}

function tokenOK(request, env) {
  const expected = env.ADMIN_TEST_TOKEN;
  if (!expected) return false;
  const url = new URL(request.url);
  const supplied = request.headers.get("x-admin-token") || url.searchParams.get("token") || "";
  return supplied === expected;
}

async function getSessionIds(endpoint) {
  const sessions = await puppeteer.sessions(endpoint);
  return sessions.map((s) => s.sessionId);
}

async function getReusableBrowser(endpoint) {
  const sessionIds = await getSessionIds(endpoint);
  for (const sessionId of sessionIds) {
    try {
      const browser = await puppeteer.connect(endpoint, sessionId);
      const client = await browser.target().createCDPSession();
      try {
        const { browserContextIds = [] } = await client.send("Target.getBrowserContexts");
        if (browserContextIds.length < MAX_CONTEXTS) return { browser, launched: false };
      } finally {
        await client.detach();
      }
      await browser.disconnect();
    } catch (_) {
      // Session may have expired between listing and connecting.
    }
  }

  // Only launch when there is no reusable session. Keep it alive so the next
  // request can connect to the same Browser Run session instead of launching again.
  const browser = await puppeteer.launch(endpoint, { keep_alive: 600000 });
  return { browser, launched: true };
}

async function withBrowser(env, fn) {
  const { browser, launched } = await getReusableBrowser(env.BROWSER);
  const context = await browser.createBrowserContext();
  try {
    return await fn(browser, context, launched);
  } finally {
    await context.close();
    // IMPORTANT: disconnect, don't close. This keeps the shared browser session alive.
    await browser.disconnect();
  }
}

async function diagnostic(request, env) {
  if (!tokenOK(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.SMARTFLOW_USERNAME || !env.SMARTFLOW_PASSWORD || !env.BROWSER) {
    return json({ error: "Required runtime bindings are missing" }, 500);
  }

  try {
    return await withBrowser(env, async (browser, context, launched) => {
      const page = await context.newPage();
      await page.goto(SMARTFLOW_LOGIN, { waitUntil: "domcontentloaded", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1200));

      const info = await page.evaluate(() => {
        const inputs = [...document.querySelectorAll("input")].map((el) => ({
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          value: el.type === "password" ? "" : el.value,
        }));
        const buttons = [...document.querySelectorAll("button, input[type=submit], input[type=button], a")].slice(0, 80).map((el) => ({
          tag: el.tagName,
          type: el.type || "",
          text: (el.innerText || el.value || "").trim(),
          id: el.id,
          name: el.name,
          href: el.href || "",
        }));
        return {
          url: location.href,
          title: document.title,
          text: (document.body?.innerText || "").slice(0, 12000),
          inputs,
          buttons,
        };
      });

      return json({
        ok: true,
        launched,
        sessionId: browser.sessionId(),
        ...info,
      });
    });
  } catch (e) {
    const message = String(e?.message || e);
    return json({
      ok: false,
      error: message,
      hint: message.includes("429")
        ? "Browser Run rate limit reached. Reuse is enabled; wait for the current session/rate limit before retrying."
        : "Browser Run failed while opening SmartFlow.",
    }, 502);
  }
}

async function smartflowLoginTest(request, env) {
  if (!tokenOK(request, env)) return json({ error: "Unauthorized" }, 401);

  try {
    return await withBrowser(env, async (browser, context, launched) => {
      const page = await context.newPage();
      await page.goto(SMARTFLOW_LOGIN, { waitUntil: "domcontentloaded", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));

      const result = await page.evaluate(({ username }) => {
        const visible = (el) => {
          const s = getComputedStyle(el);
          return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
        };
        const password = [...document.querySelectorAll('input[type="password"]')].find(visible);
        const textInputs = [...document.querySelectorAll('input')].filter((el) => visible(el) && el !== password);
        const user = textInputs.find((el) => /user|login|account|name|email|contact/i.test(`${el.name} ${el.id} ${el.placeholder}`)) || textInputs[0];
        return {
          usernameSelector: user ? { id: user.id, name: user.name, type: user.type, placeholder: user.placeholder } : null,
          passwordSelector: password ? { id: password.id, name: password.name, type: password.type, placeholder: password.placeholder } : null,
          hasUsername: Boolean(user),
          hasPassword: Boolean(password),
          username,
        };
      }, { username: env.SMARTFLOW_USERNAME });

      if (!result.hasUsername || !result.hasPassword) {
        return json({ ok: false, stage: "locate-login-fields", launched, sessionId: browser.sessionId(), ...result }, 422);
      }

      // Do not use CSS.escape() here: Cloudflare Workers do not expose the
      // browser CSS global to Worker-side code. Find the exact DOM elements
      // by their discovered id/name and set their values through ElementHandle.
      const allInputs = await page.$$("input");
      const findInput = async (meta) => {
        for (const handle of allInputs) {
          const props = await handle.evaluate((el) => ({
            id: el.id || "",
            name: el.name || "",
            type: el.type || "",
          }));
          if ((meta.id && props.id === meta.id) || (!meta.id && meta.name && props.name === meta.name)) {
            return handle;
          }
        }
        return null;
      };

      const userHandle = await findInput(result.usernameSelector);
      const passHandle = await findInput(result.passwordSelector);
      if (!userHandle || !passHandle) {
        return json({ ok: false, stage: "resolve-login-fields", launched, sessionId: browser.sessionId() }, 422);
      }

      await userHandle.evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, env.SMARTFLOW_USERNAME);

      await passHandle.evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, env.SMARTFLOW_PASSWORD);

      await userHandle.dispose();
      await passHandle.dispose();
      for (const handle of allInputs) {
        try { await handle.dispose(); } catch (_) {}
      }

      const submit = await page.$('button[type="submit"], input[type="submit"], button, input[type="button"]');
      if (!submit) return json({ ok: false, stage: "locate-login-button", launched, sessionId: browser.sessionId() }, 422);
      await submit.click();
      await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1200));

      const after = await page.evaluate(() => ({
        url: location.href,
        title: document.title,
        text: (document.body?.innerText || "").slice(0, 12000),
        links: [...document.querySelectorAll("a")].slice(0, 100).map((a) => ({ text: (a.innerText || "").trim(), href: a.href })),
      }));

      return json({ ok: true, stage: "after-login", launched, sessionId: browser.sessionId(), ...after });
    });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, 502);
  }
}


async function smartflowReportDiscovery(request, env) {
  if (!tokenOK(request, env)) return json({ error: "Unauthorized" }, 401);
  if (!env.SMARTFLOW_USERNAME || !env.SMARTFLOW_PASSWORD || !env.BROWSER) {
    return json({ error: "Required runtime bindings are missing" }, 500);
  }

  try {
    return await withBrowser(env, async (browser, context, launched) => {
      const page = await context.newPage();
      await page.goto(SMARTFLOW_LOGIN, { waitUntil: "domcontentloaded", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1000));

      const login = await page.evaluate(() => {
        const visible = (el) => {
          const s = getComputedStyle(el);
          return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
        };
        const password = [...document.querySelectorAll('input[type="password"]')].find(visible);
        const textInputs = [...document.querySelectorAll('input')].filter((el) => visible(el) && el !== password);
        const user = textInputs.find((el) => /user|login|account|name|email|contact/i.test(`${el.name} ${el.id} ${el.placeholder}`)) || textInputs[0];
        return {
          user: user ? { id:user.id, name:user.name, type:user.type } : null,
          password: password ? { id:password.id, name:password.name, type:password.type } : null
        };
      });
      if (!login.user || !login.password) return json({ ok:false, stage:"locate-login-fields", ...login }, 422);

      const inputs = await page.$$("input");
      const findInput = async (meta) => {
        for (const h of inputs) {
          const v = await h.evaluate(el => ({id:el.id||"", name:el.name||""}));
          if ((meta.id && v.id === meta.id) || (!meta.id && meta.name && v.name === meta.name)) return h;
        }
        return null;
      };
      const uh = await findInput(login.user), ph = await findInput(login.password);
      if (!uh || !ph) return json({ok:false, stage:"resolve-login-fields"},422);
      await uh.evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))},env.SMARTFLOW_USERNAME);
      await ph.evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))},env.SMARTFLOW_PASSWORD);
      const submit = await page.$('button[type="submit"],input[type="submit"],button,input[type="button"]');
      if (!submit) return json({ok:false,stage:"locate-login-button"},422);
      await submit.click();
      await page.waitForNavigation({waitUntil:"domcontentloaded",timeout:15000}).catch(()=>{});
      await new Promise(r=>setTimeout(r,1200));

      const before = await page.evaluate(() => ({
        url:location.href,
        title:document.title,
        candidates:[...document.querySelectorAll('a,button,input[type="button"],input[type="submit"],[onclick]')].map((el,i)=>({
          i,tag:el.tagName,text:(el.innerText||el.value||el.getAttribute('title')||'').trim(),id:el.id||'',name:el.name||'',href:el.href||'',onclick:el.getAttribute('onclick')||''
        })).filter(x=>/report/i.test(`${x.text} ${x.id} ${x.name} ${x.href} ${x.onclick}`)).slice(0,50)
      }));

      let clicked = null;
      const handles = await page.$$('a,button,input[type="button"],input[type="submit"],[onclick]');
      for (const h of handles) {
        const meta = await h.evaluate(el=>({text:(el.innerText||el.value||el.getAttribute('title')||'').trim(),href:el.href||'',onclick:el.getAttribute('onclick')||'',id:el.id||''}));
        if (/^report$/i.test(meta.text) || (/report/i.test(meta.text) && !/all services/i.test(meta.text))) {
          clicked = meta;
          try { await h.click(); } catch (_) {}
          break;
        }
      }
      for (const h of handles) { try { await h.dispose(); } catch (_) {} }
      await new Promise(r=>setTimeout(r,1500));

      const after = await page.evaluate(() => ({
        url:location.href,
        title:document.title,
        text:(document.body?.innerText||'').slice(0,16000),
        inputs:[...document.querySelectorAll('input,select,textarea,button')].slice(0,150).map((el,i)=>({
          i,tag:el.tagName,type:el.type||'',id:el.id||'',name:el.name||'',placeholder:el.placeholder||'',value:el.type==='password'?'':el.value||'',text:(el.innerText||el.value||'').trim()
        })),
        forms:[...document.forms].map((f,i)=>({i,id:f.id||'',name:f.name||'',action:f.action||'',method:f.method||''})),
        tables:[...document.querySelectorAll('table')].slice(0,20).map((t,i)=>({i,headers:[...t.querySelectorAll('th')].map(x=>x.innerText.trim()),rows:[...t.querySelectorAll('tr')].slice(0,8).map(r=>[...r.querySelectorAll('th,td')].map(c=>c.innerText.trim()))}))
      }));

      return json({ok:true,stage:"report-discovery",launched,sessionId:browser.sessionId(),before,clicked,after});
    });
  } catch(e) {
    return json({ok:false,error:String(e?.message||e)},502);
  }
}

const APP = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cellix – Check Your Balance</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033}.wrap{max-width:520px;margin:0 auto;padding:42px 18px}.brand{font-size:42px;font-weight:800;color:#1677ed;text-align:center}.sub{text-align:center;color:#657086;margin:5px 0 28px}.card{background:#fff;border-radius:24px;padding:24px;box-shadow:0 10px 35px rgba(30,60,100,.08)}h1{font-size:27px;margin:0 0 8px}.hint{color:#68758a;margin-bottom:22px}label{display:block;font-weight:700;margin:14px 0 7px}input{width:100%;padding:15px 16px;border:1px solid #d8dfeb;border-radius:13px;font-size:16px;outline:none}button{width:100%;padding:15px;border:0;border-radius:13px;background:#1677ed;color:#fff;font-size:16px;font-weight:800;margin-top:18px}.result{margin-top:20px;padding:18px;border-radius:16px;background:#f5f8fc;white-space:pre-wrap}.amount{font-size:34px;font-weight:900;color:#1677ed;margin-top:6px}.small{font-size:12px;color:#7a8495;margin-top:18px;text-align:center}
</style></head><body><div class="wrap"><div class="brand">Cellix</div><div class="sub">SmartFlow Balance Check</div><div class="card"><h1>Check Your Balance</h1><div class="hint">Enter your phone number and full name.</div><label>Phone</label><input id="phone" type="tel" autocomplete="tel"><label>Full name</label><input id="name" autocomplete="name"><button id="check">Check Balance</button><div id="result" class="result" style="display:none"></div></div><div class="small">Your information is checked securely.</div></div>
<script>
const result=document.getElementById('result');
document.getElementById('check').onclick=async()=>{const phone=document.getElementById('phone').value.trim();const name=document.getElementById('name').value.trim();if(!phone||!name){result.style.display='block';result.textContent='Please enter your phone and full name.';return}result.style.display='block';result.textContent='Checking…';try{const r=await fetch('/api/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone,name})});const d=await r.json();if(!d.ok){result.textContent=d.message||'Unable to check right now.';return}result.innerHTML=d.hasUnpaid?'<div>Amount owed</div><div class="amount">'+String(d.amount).replace(/[<>]/g,'')+'</div>':'No unpaid balance found.'}catch(e){result.textContent='Unable to connect. Please try again.'}};
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/config-check") {
      return json({
        smartflowUsername: !!env.SMARTFLOW_USERNAME,
        smartflowPassword: !!env.SMARTFLOW_PASSWORD,
        adminTestToken: !!env.ADMIN_TEST_TOKEN,
        browserBinding: !!env.BROWSER,
      });
    }

    if (url.pathname === "/admin/diagnostic") return diagnostic(request, env);
    if (url.pathname === "/admin/smartflow-login-test") return smartflowLoginTest(request, env);
    if (url.pathname === "/admin/report-discovery") {
      if (request.method === "GET" && !tokenOK(request, env)) {
        return new Response(`<!doctype html><html><body style="font-family:Arial;padding:30px"><h2>SmartFlow Report Discovery</h2><p>Enter your admin test token.</p><form method="POST"><input name="token" type="password" style="padding:12px;width:280px"/><button style="padding:12px;margin-left:8px">Run Discovery</button></form></body></html>`, {headers:{"content-type":"text/html;charset=UTF-8"}});
      }
      if (request.method === "POST" && !tokenOK(request, env)) {
        const form = await request.formData().catch(()=>null);
        const supplied = form?.get("token");
        if (!supplied || supplied !== env.ADMIN_TEST_TOKEN) return json({error:"Unauthorized"},401);
        const headers = new Headers(request.headers);
        headers.set("x-admin-token", supplied);
        request = new Request(request.url, {method:"GET", headers});
      }
      return smartflowReportDiscovery(request, env);
    }

    if (url.pathname === "/api/check" && request.method === "POST") {
      // The public lookup is intentionally not enabled yet until SmartFlow's
      // report selectors are confirmed by the diagnostic/login test.
      return json({ ok: false, message: "SmartFlow report mapping is not enabled yet." }, 501);
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    return html(APP);
  },
};
