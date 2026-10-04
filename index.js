const DATA_KEY = "clients";

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Cellix — Check Your Balance</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{width:min(440px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 12px 40px rgba(20,40,80,.10)}
.logo{font-size:40px;font-weight:800;color:#1677ff;letter-spacing:-1.5px}
.sub{color:#697386;margin:7px 0 25px;font-size:16px}
label{display:block;font-size:13px;font-weight:700;margin:16px 0 7px}
input{width:100%;height:52px;border:1px solid #d9e0ea;border-radius:13px;padding:0 15px;font-size:16px;outline:none}
input:focus{border-color:#1677ff;box-shadow:0 0 0 3px rgba(22,119,255,.10)}
button{width:100%;height:54px;border:0;border-radius:14px;background:#1677ff;color:#fff;font-size:16px;font-weight:800;margin-top:20px;cursor:pointer}
.result{margin-top:22px;border-radius:18px;padding:20px;display:none}
.ok{background:#eef8f1;border:1px solid #ccebd5}
.none{background:#f7f8fa;border:1px solid #e2e6ec}
.name{font-size:16px;font-weight:800}
.amount{font-size:30px;font-weight:900;margin-top:8px}
.note{font-size:13px;color:#687386;margin-top:8px}
.err{color:#c62828;font-size:14px;margin-top:14px;display:none}
.small{text-align:center;color:#9aa3b2;font-size:12px;margin-top:22px}
</style>
</head>
<body>
<main class="card">
<div class="logo">Cellix</div>
<div class="sub">Check your outstanding balance</div>
<label>Phone Number</label>
<input id="phone" inputmode="numeric" autocomplete="tel" placeholder="Enter phone number">
<label>Full Name</label>
<input id="name" autocomplete="name" placeholder="Enter your full name">
<button id="check">Check Balance</button>
<div id="err" class="err"></div>
<section id="result" class="result">
<div id="resultName" class="name"></div>
<div id="resultAmount" class="amount"></div>
<div id="resultNote" class="note"></div>
</section>
<div class="small">Cellix</div>
</main>
<script>
const normPhone=v=>String(v??"").replace(/\\D/g,"");
const normName=v=>String(v??"").trim().toLowerCase().replace(/\\s+/g," ");
const money=n=>new Intl.NumberFormat("en-US").format(Number(n)||0)+" LBP";
document.getElementById("check").onclick=async()=>{
 const phone=normPhone(document.getElementById("phone").value);
 const name=normName(document.getElementById("name").value);
 const err=document.getElementById("err"),box=document.getElementById("result");
 err.style.display="none";box.style.display="none";
 if(!phone||!name){err.textContent="Please enter your phone number and full name.";err.style.display="block";return;}
 const btn=document.getElementById("check"); btn.disabled=true; btn.textContent="Checking...";
 try{
  const r=await fetch("/api/check?phone="+encodeURIComponent(phone)+"&name="+encodeURIComponent(name));
  const d=await r.json();
  if(d.ok&&d.customer){
   box.className="result ok"; box.style.display="block";
   document.getElementById("resultName").textContent=d.customer.name;
   document.getElementById("resultAmount").textContent=money(d.customer.remaining);
   document.getElementById("resultNote").textContent="Remaining balance";
  }else{
   box.className="result none"; box.style.display="block";
   document.getElementById("resultName").textContent="";
   document.getElementById("resultAmount").textContent="No balance found";
   document.getElementById("resultNote").textContent=d.message||"No matching customer was found.";
  }
 }catch(e){err.textContent="Unable to check balance. Please try again.";err.style.display="block";}
 btn.disabled=false;btn.textContent="Check Balance";
};
</script>
</body></html>`;

const PRIVATE_PAGE = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Cellix — My Balance</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:min(440px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 12px 40px rgba(20,40,80,.10)}.logo{font-size:40px;font-weight:800;color:#1677ff}.sub{color:#697386;margin:7px 0 25px}.name{font-size:18px;font-weight:800}.checked{font-size:13px;color:#687386;margin-top:7px}.label{font-size:13px;color:#687386;margin-top:22px}.amount{font-size:34px;font-weight:900;margin-top:8px}.status{display:inline-block;margin-top:14px;padding:8px 12px;border-radius:999px;font-size:13px;font-weight:800}.paid{background:#eaf8ef;color:#167a3b}.due{background:#fff4e5;color:#9a5b00}.small{text-align:center;color:#9aa3b2;font-size:12px;margin-top:28px}.err{background:#fff2f2;border:1px solid #f0cccc;color:#b42318;border-radius:14px;padding:16px;margin-top:18px}</style></head><body><main class="card"><div class="logo">Cellix</div><div class="sub">Your outstanding balance</div><div id="content">Checking your account...</div><div class="small">Cellix</div><script>
(async()=>{
 const c=document.getElementById("content");
 const checkedAt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date());
 try{
  const token=decodeURIComponent(location.pathname.split("/")[2]||"").trim();
  if(!token)throw new Error("Invalid private link.");
  const r=await fetch("/api/private?token="+encodeURIComponent(token),{cache:"no-store"});
  const d=await r.json();
  if(d.ok&&d.customer){
   const amount=Number(d.customer.remaining)||0;
   const paid=amount===0;
   c.innerHTML='<div class="name"></div><div class="checked">Checked at: '+checkedAt+' • Lebanon Time (UTC+3)</div><div class="label">Remaining balance</div><div class="amount"></div><div class="status '+(paid?"paid":"due")+'"></div>';
   c.querySelector(".name").textContent=d.customer.name;
   c.querySelector(".amount").textContent=new Intl.NumberFormat("en-US").format(amount)+" LBP";
   c.querySelector(".status").textContent=paid?"✓ Account Paid":"Outstanding Balance";
  }else{
   c.innerHTML='<div class="err"></div>';
   c.querySelector(".err").textContent=d.message||"This private link is invalid or no longer active.";
  }
 }catch(e){
  c.innerHTML='<div class="err"></div>';
  c.querySelector(".err").textContent=e.message||"Unable to load your balance. Please try again.";
 }
})();
</script></main></body></html>`;
const ADMIN = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix Admin — Upload Excel</title>
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js" onload="window.sheetLoaded=true" onerror="window.sheetLoaded=false"></script>
<style>
body{font-family:Arial;background:#f4f7fb;margin:0;padding:24px;color:#172033}.box{max-width:520px;margin:30px auto;background:#fff;padding:26px;border-radius:22px;box-shadow:0 10px 35px #0001}h1{color:#1677ff}input,button{width:100%;height:50px;margin:8px 0;border-radius:10px;border:1px solid #ccd4df;padding:0 12px;box-sizing:border-box}button{background:#1677ff;color:#fff;font-weight:700;border:0}button:disabled{opacity:.6}#msg{margin-top:14px;font-size:14px;white-space:pre-wrap;line-height:1.5}#links{margin-top:18px;font-size:13px}#links .row{padding:12px 0;border-top:1px solid #e6eaf0}#links a{color:#1677ff;word-break:break-all}.ok{color:#16803c}.bad{color:#c62828}.hint{font-size:12px;color:#697386;margin-top:8px}
</style></head><body><div class="box"><h1>Cellix</h1><h2>Upload Customer Balances</h2>
<p>Upload the new Excel file. Existing private links are kept permanently.</p>
<input id="token" type="password" placeholder="Admin token" autocomplete="off">
<input id="file" type="file" accept=".xlsx,.xls,.csv">
<div id="fileInfo" class="hint">No file selected.</div>
<button id="upload" type="button">Upload & Replace Data</button><div id="msg"></div><div id="links"></div></div>
<script>
const uploadBtn=document.getElementById("upload");
const msg=document.getElementById("msg");
const fileInput=document.getElementById("file");
const fileInfo=document.getElementById("fileInfo");
fileInput.addEventListener("change",()=>{const f=fileInput.files[0];fileInfo.textContent=f?"Selected: "+f.name+" ("+Math.round(f.size/1024)+" KB)":"No file selected.";});
function show(text,cls=""){msg.className=cls;msg.textContent=text;}
async function readError(r){
 try{const d=await r.json();return d.error||d.message||("HTTP "+r.status);}catch{const t=await r.text();return t||("HTTP "+r.status);}
}
uploadBtn.onclick=async()=>{
 const token=document.getElementById("token").value.trim();
 const f=fileInput.files[0];
 document.getElementById("links").innerHTML="";
 if(!token){show("Error: Please enter the admin token.","bad");return;}
 if(!f){show("Error: Please select the Excel file.","bad");return;}
 if(typeof XLSX==="undefined"){
   show("Error: Excel reader did not load. Check your internet connection and try again.","bad");
   return;
 }
 uploadBtn.disabled=true;
 show("Reading Excel...");
 try{
  const buf=await f.arrayBuffer();
  const wb=XLSX.read(buf,{type:"array"});
  if(!wb.SheetNames.length)throw new Error("The Excel file has no sheets.");
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
  if(!rows.length)throw new Error("The Excel file is empty.");
  const header=rows[0].map(v=>String(v).trim().toLowerCase());
  const find=(...names)=>{for(const n of names){const i=header.indexOf(n.toLowerCase());if(i>=0)return i;}return -1;};
  const nameI=find("name","client name","customer name");
  const phoneI=find("contact number","phone","phone number","contact");
  const remI=find("remaining balance","remaining","balance due","amount due");
  if(nameI<0||phoneI<0||remI<0)throw new Error("Required columns not found. Need: Name, Contact Number, Remaining Balance.");
  const clients=[];
  for(let i=1;i<rows.length;i++){
   const name=String(rows[i][nameI]??"").trim();
   const phone=String(rows[i][phoneI]??"").trim();
   let remaining=rows[i][remI];
   if(name||phone){
    remaining=Number(String(remaining??0).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0;
    clients.push({name,phone,remaining});
   }
  }
  if(!clients.length)throw new Error("No customer rows found.");
  show("Uploading "+clients.length+" customers...");
  const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":token},body:JSON.stringify({clients})});
  if(!r.ok){throw new Error(await readError(r));}
  const d=await r.json();
  if(!d.ok)throw new Error(d.error||d.message||"Upload failed.");
  show("Success. "+d.count+" customers updated. "+d.totalCustomers+" customers permanently saved.","ok");
  const links=document.getElementById("links");
  links.innerHTML="<h3>Private customer links</h3>"+(d.links||[]).map(x=>{
   const wa="https://wa.me/"+x.whatsapp+"?text="+encodeURIComponent("إدارة Cellix تشكركم على ثقتكم بنا،\\n\\nونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:\\n\\nالرابط:\\n"+x.link+"\\n\\nنرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.\\n\\nكما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:\\n\\n1- افتحوا الرابط باستخدام Google Chrome.\\n2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.\\n3- اضغطوا Install / تثبيت للتأكيد.\\n\\nلمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686");
   return '<div class="row"><b>'+x.name+'</b> — '+x.status+'<br><a href="'+x.link+'" target="_blank">'+x.link+'</a> <a href="'+wa+'" target="_blank" style="display:inline-block;margin-left:8px;background:#1677ff;color:#fff;padding:7px 10px;border-radius:8px;text-decoration:none">WhatsApp</a></div>';
  }).join("");
 }catch(e){show("Error: "+(e?.message||String(e)),"bad");}
 finally{uploadBtn.disabled=false;}
};
</script></body></html>`;

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
}
function normalizePhone(v){return String(v??"").replace(/\D/g,"");}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}

export default {
 async fetch(request, env){
  const url=new URL(request.url);

  if(url.pathname==="/admin/upload"){
   return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  }

  if(url.pathname.startsWith("/c/") && url.pathname.length>3){
   return new Response(PRIVATE_PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  }

  if(url.pathname==="/api/private"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);
   const token=String(url.searchParams.get("token")||"").trim();
   const raw=await env.BALANCES.get(DATA_KEY);
   if(!token||!raw)return json({ok:false,message:"Invalid private link."},404);
   let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500);}
   const customer=clients.find(c=>String(c.token||"")===token);
   if(!customer)return json({ok:false,message:"This private link is invalid or no longer active."},404);
   return json({ok:true,customer:{name:customer.name,remaining:Number(customer.remaining)||0,status:customer.status||"active"}});
  }

  if(url.pathname==="/api/check"){
   if(!env.BALANCES) return json({ok:false,message:"Balance storage is not configured."},500);
   const phone=normalizePhone(url.searchParams.get("phone"));
   const name=normalizeName(url.searchParams.get("name"));
   if(!phone||!name) return json({ok:false,message:"Missing phone or name."},400);
   const raw=await env.BALANCES.get(DATA_KEY);
   if(!raw) return json({ok:false,message:"No customer data has been uploaded yet."},404);
   let clients=[]; try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500);}
   const customer=clients.find(c=>normalizePhone(c.phone)===phone&&normalizeName(c.name)===name);
   return customer?json({ok:true,customer}):json({ok:false,message:"No matching customer was found."});
  }

  if(url.pathname==="/api/upload" && request.method==="POST"){
   if(!env.BALANCES) return json({ok:false,error:"BALANCES KV binding is missing."},500);
   const token=request.headers.get("x-admin-token")||"";
   if(!env.ADMIN_TEST_TOKEN || token!==env.ADMIN_TEST_TOKEN) return json({ok:false,error:"Unauthorized"},401);
   let body; try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400);}
   if(!Array.isArray(body.clients)||!body.clients.length) return json({ok:false,error:"No customer data received."},400);
   const incoming=body.clients.map(c=>({name:String(c.name??"").trim(),phone:String(c.phone??"").trim(),remaining:Number(c.remaining)||0})).filter(c=>c.name||c.phone);
    let allCustomers=[];
    const oldRaw=await env.BALANCES.get(DATA_KEY);
    if(oldRaw){try{allCustomers=JSON.parse(oldRaw)}catch{}}
    const makeToken=()=>{const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("")};

    // Match an incoming customer by phone OR by name, so formatting changes
    // in the Excel phone column never create a second customer/private link.
    const phoneKey=c=>normalizePhone(c.phone);
    const nameKey=c=>normalizeName(c.name);
    const findExisting=(c)=>{
      const p=phoneKey(c), n=nameKey(c);
      return allCustomers.find(x=>(p && phoneKey(x)===p) || (n && nameKey(x)===n));
    };

    const seenExisting=new Set();
    const updated=[];
    for(const c of incoming){
      const existing=findExisting(c);
      const customer={
        name:c.name||existing?.name||"",
        phone:c.phone||existing?.phone||"",
        remaining:c.remaining,
        token:existing?.token||makeToken(),
        status:c.remaining===0?"zero_balance":"active"
      };
      if(existing){
        const idx=allCustomers.indexOf(existing);
        if(idx>=0) allCustomers[idx]=customer;
        seenExisting.add(existing.token);
      }else{
        allCustomers.push(customer);
      }
      updated.push(customer);
    }

    // Customers missing from the latest Excel remain permanently stored,
    // but their old balance is cleared to 0. Their private link is unchanged.
    for(const c of allCustomers){
      if(!updated.some(u=>u.token===c.token)){
        c.remaining=0;
        c.status="not_in_latest";
      }
    }
    const clients=allCustomers;
    await env.BALANCES.put(DATA_KEY,JSON.stringify(clients));
    await env.BALANCES.put("meta",JSON.stringify({count:clients.length,latestCount:updated.length,updatedAt:new Date().toISOString()}));
    const links=updated.map(c=>({name:c.name,status:c.status,phone:c.phone,whatsapp:(()=>{let p=String(c.phone||"").replace(/\\D/g,"");if(p.startsWith("0"))p="961"+p.slice(1);else if(!p.startsWith("961"))p="961"+p;return p;})(),link:new URL("/c/"+c.token,request.url).toString()}));
    return json({ok:true,count:updated.length,totalCustomers:clients.length,links});
  }

  if(url.pathname==="/api/health"){
   return json({ok:true,storage:!!env.BALANCES});
  }

  return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
 }
};
