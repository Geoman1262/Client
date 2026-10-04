import puppeteer from "@cloudflare/puppeteer";

const SMARTFLOW_LOGIN = "https://celllilo.smartflowsystems.net/HO.php";

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix — Check Your Balance</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(135deg,#eef7ff,#f8fbff);color:#18345d}
.wrap{max-width:520px;margin:0 auto;padding:28px 18px 40px}
.brand{font-size:42px;font-weight:800;color:#1677ed;margin:10px 0 2px}
.sub{font-size:19px;color:#47617f;margin-bottom:26px}
.card{background:#fff;border-radius:24px;padding:24px;box-shadow:0 12px 35px #18345d18}
h1{font-size:27px;margin:0 0 8px}.hint{color:#64748b;line-height:1.5}
label{display:block;font-weight:700;margin:18px 0 7px}
input{width:100%;padding:15px 16px;border:1px solid #d5dfeb;border-radius:13px;font-size:16px;outline:none}
input:focus{border-color:#1677ed;box-shadow:0 0 0 3px #1677ed18}
button{width:100%;margin-top:22px;padding:16px;border:0;border-radius:13px;background:#1677ed;color:#fff;font-size:17px;font-weight:700;cursor:pointer}
button:disabled{opacity:.6}
#result{display:none;margin-top:20px}
.total{padding:20px;border-radius:18px;background:#fff0f0;text-align:center}
.total small{display:block;color:#d33;font-weight:700}.total strong{display:block;color:#d33;font-size:31px;margin-top:5px}
.item{display:flex;justify-content:space-between;gap:12px;padding:15px 0;border-bottom:1px solid #edf1f5}
.item:last-child{border-bottom:0}.service{font-weight:700}.date{font-size:13px;color:#64748b;margin-top:4px}.amount{font-weight:800;color:#d33;white-space:nowrap}
.msg{padding:15px;border-radius:14px;background:#f2f7ff;color:#45627e}
</style>
</head>
<body>
<div class="wrap">
  <div class="brand">Cellix</div>
  <div class="sub">Check Your Balance</div>
  <div class="card">
    <h1>Check Your Unpaid Balance</h1>
    <div class="hint">Enter your phone number and full name to see your latest unpaid amount.</div>

    <label>Phone Number</label>
    <input id="phone" inputmode="tel" placeholder="03 123 456">

    <label>Full Name</label>
    <input id="name" autocomplete="name" placeholder="Full Name">

    <button id="check" onclick="checkBalance()">Check My Balance</button>
    <div id="result"></div>
  </div>
</div>
<script>
async function checkBalance(){
  const phone=document.getElementById('phone').value.trim();
  const name=document.getElementById('name').value.trim();
  const btn=document.getElementById('check');
  const out=document.getElementById('result');
  if(!phone||!name){out.style.display='block';out.innerHTML='<div class="msg">Please enter your phone number and full name.</div>';return}
  btn.disabled=true;btn.textContent='Checking...';out.style.display='block';
  out.innerHTML='<div class="msg">Please wait while we check your account.</div>';
  try{
    const r=await fetch('/api/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({phone,name})});
    const d=await r.json();
    if(!r.ok) throw new Error(d.error||'Unable to check balance');
    if(!d.unpaid?.length){
      out.innerHTML='<div class="msg">No unpaid amount was found.</div>';
    }else{
      const rows=d.unpaid.map(x=>'<div class="item"><div><div class="service">'+escapeHtml(x.service)+'</div><div class="date">'+escapeHtml(x.date)+'</div></div><div class="amount">'+escapeHtml(x.amount)+'</div></div>').join('');
      out.innerHTML='<div class="total"><small>Total Amount Due</small><strong>'+escapeHtml(d.totalRemaining)+'</strong></div><div class="card" style="margin-top:14px;padding:18px"><b>Unpaid Transactions</b>'+rows+'</div>';
    }
  }catch(e){out.innerHTML='<div class="msg">'+escapeHtml(e.message)+'</div>'}
  finally{btn.disabled=false;btn.textContent='Check My Balance'}
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
</script>
</body>
</html>`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function getLoginInputs(page) {
  return await page.evaluate(() => [...document.querySelectorAll("input")].map((el, i) => ({
    index: i,
    type: el.type,
    name: el.name,
    id: el.id,
    placeholder: el.placeholder,
    autocomplete: el.autocomplete
  })));
}

async function smartflowLogin(page, env) {
  await page.goto(SMARTFLOW_LOGIN, { waitUntil: "domcontentloaded", timeout: 30000 });

  const inputs = await getLoginInputs(page);
  const passwordIndex = inputs.findIndex(x => x.type === "password");
  if (passwordIndex < 0) {
    throw new Error("SmartFlow login password field was not found.");
  }

  const userCandidates = inputs.filter((x, i) =>
    i !== passwordIndex && ["text", "email", ""].includes(x.type)
  );
  if (!userCandidates.length) {
    throw new Error("SmartFlow username field was not found.");
  }

  const user = userCandidates[0];
  const pass = inputs[passwordIndex];

  const userSelector = user.id ? `#${CSS.escape(user.id)}` :
    user.name ? `input[name="${CSS.escape(user.name)}"]` :
    `input:nth-of-type(${user.index + 1})`;

  const passSelector = pass.id ? `#${CSS.escape(pass.id)}` :
    pass.name ? `input[name="${CSS.escape(pass.name)}"]` :
    `input[type="password"]`;

  await page.locator(userSelector).fill(env.SMARTFLOW_USERNAME);
  await page.locator(passSelector).fill(env.SMARTFLOW_PASSWORD);

  const buttons = await page.evaluate(() => [...document.querySelectorAll("button,input[type=submit]")].map((el,i)=>({
    i, text:(el.innerText||el.value||"").trim(), type:el.type
  })));

  const loginButton = buttons.find(b => /login|log in|sign in|submit/i.test(b.text));
  if (loginButton) {
    await page.evaluate((i) => {
      const els=[...document.querySelectorAll("button,input[type=submit]")];
      els[i]?.click();
    }, loginButton.i);
  } else {
    await page.locator("input[type=password]").press("Enter");
  }

  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
}

async function diagnostic(env) {
  if (!env.SMARTFLOW_USERNAME || !env.SMARTFLOW_PASSWORD) {
    throw new Error("Set SMARTFLOW_USERNAME and SMARTFLOW_PASSWORD as Cloudflare secrets first.");
  }

  const browser = await puppeteer.launch(env.BROWSER, {
    guardrails: { allowedDomains: ["celllilo.smartflowsystems.net", "*.smartflowsystems.net"] }
  });

  try {
    const page = await browser.newPage();
    await smartflowLogin(page, env);

    const result = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      text: document.body?.innerText?.slice(0, 7000) || "",
      links: [...document.querySelectorAll("a")].slice(0, 80).map(a => ({
        text:(a.innerText||"").trim(),
        href:a.href
      })).filter(x => x.text || x.href),
      buttons: [...document.querySelectorAll("button,input[type=submit]")].map(x => ({
        text:(x.innerText||x.value||"").trim()
      }))
    }));

    return result;
  } finally {
    await browser.close();
  }
}

async function checkClient(env, name, phone) {
  // V1 intentionally stops after the connection/login test.
  // Once the diagnostic response identifies the real Report URL and fields,
  // this function will be completed with the exact SmartFlow search workflow.
  throw new Error("SmartFlow connection is ready, but the Report page selectors have not been mapped yet.");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, project: "cellix-smartflow-balance", version: "1.0.0" });
    }

    if (request.method === "GET" && url.pathname === "/admin/diagnostic") {
      if (!env.ADMIN_TEST_TOKEN || request.headers.get("x-admin-token") !== env.ADMIN_TEST_TOKEN) {
        return json({ error: "Unauthorized" }, 401);
      }
      try {
        return json(await diagnostic(env));
      } catch (e) {
        return json({ error: e?.message || String(e) }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/check") {
      try {
        const body = await request.json();
        const name = String(body?.name || "").trim();
        const phone = String(body?.phone || "").trim();
        if (!name || !phone) return json({ error: "Name and phone are required." }, 400);
        const data = await checkClient(env, name, phone);
        return json(data);
      } catch (e) {
        return json({ error: e?.message || String(e) }, 500);
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
