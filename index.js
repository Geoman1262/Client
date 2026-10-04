const DATA_KEY = "clients";
const META_KEY = "meta";

const ADMIN = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix — Admin</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033;padding:18px}
.wrap{max-width:1100px;margin:auto}.card{background:#fff;border-radius:20px;padding:22px;margin-bottom:18px;box-shadow:0 10px 30px #0000000d}
h1{margin:0;color:#1677ff}.muted{color:#687386}.row{display:flex;gap:10px;flex-wrap:wrap}
input,button{height:48px;border-radius:11px;border:1px solid #d6dde8;padding:0 13px;font-size:15px}
input[type=password]{flex:1;min-width:220px}input[type=file]{flex:2;min-width:240px}
button{background:#1677ff;color:white;border:0;font-weight:800;cursor:pointer;padding:0 20px}
button:disabled{opacity:.6}.msg{margin-top:12px;white-space:pre-wrap}
.ok{color:#16803c}.bad{color:#c62828}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.stat{background:#f7f9fc;border-radius:15px;padding:16px}.num{font-size:25px;font-weight:900;margin-top:5px}
.search{width:100%;margin:8px 0}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{text-align:left;padding:12px;border-bottom:1px solid #edf0f4}th{font-size:12px;color:#687386}
a{color:#1677ff;text-decoration:none;font-weight:700}.wa{background:#159447;padding:9px 12px;border-radius:9px;color:white;display:inline-block}
.badge{padding:5px 9px;border-radius:999px;font-size:12px;font-weight:800}.paid{background:#e9f8ef;color:#16803c}.out{background:#fff4df;color:#9a6500}.zero{background:#eef1f5;color:#667085}
@media(max-width:650px){.stats{grid-template-columns:1fr}.card{padding:16px}}
</style></head><body><div class="wrap">
<div class="card"><h1>Cellix</h1><h2>Customer Balance Admin</h2><p class="muted">Upload the latest Excel report. Customer private links are preserved.</p>
<div class="row"><input id="token" type="password" placeholder="Admin token"><input id="file" type="file" accept=".xlsx,.xls,.csv"><button id="upload">Upload & Update</button></div>
<div id="msg" class="msg"></div></div>

<div class="card"><div class="stats">
<div class="stat">Customers<div id="count" class="num">—</div></div>
<div class="stat">Outstanding<div id="outstanding" class="num">—</div></div>
<div class="stat">Paid<div id="paid" class="num">—</div></div>
</div></div>

<div class="card"><h2>Private Customer Links</h2>
<input id="search" class="search" placeholder="Search by name or phone">
<div class="table"><table><thead><tr><th>Name</th><th>Phone</th><th>Balance</th><th>Status</th><th>Private Link</th><th>WhatsApp</th></tr></thead>
<tbody id="list"></tbody></table></div></div>
</div>
<script>
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-US").format(Number(n)||0)+" LBP";
function token(){return $("token").value.trim();}
function show(s,ok=false){$("msg").textContent=s;$("msg").className="msg "+(ok?"ok":"bad");}
function waPhone(v){let d=String(v??"").replace(/\\D/g,"");if(d.startsWith("0"))d="961"+d.slice(1);else if(!d.startsWith("961"))d="961"+d;return d;}
function waLink(c){
 const base=location.origin+"/c/"+encodeURIComponent(c.token);
 const text=`إدارة Cellix تشكركم على ثقتكم بنا،

ونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:

الرابط:
${base}

نرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.

كما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:

1- افتحوا الرابط باستخدام Google Chrome.
2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.
3- اضغطوا Install / تثبيت للتأكيد.

لمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686`;
 return "https://wa.me/"+waPhone(c.phone)+"?text="+encodeURIComponent(text);
}
let DATA=[];
function render(){
 const q=$("search").value.trim().toLowerCase();
 const rows=DATA.filter(c=>(c.name+" "+c.phone).toLowerCase().includes(q));
 $("list").innerHTML=rows.map(c=>{
   const bal=Number(c.remaining)||0;
   const status=bal===0?'<span class="badge paid">Paid</span>':'<span class="badge out">Outstanding</span>';
   const link=location.origin+"/c/"+encodeURIComponent(c.token);
   return `<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${money(bal)}</td><td>${status}</td><td><a href="${link}" target="_blank">Open private link</a></td><td><a class="wa" href="${waLink(c)}" target="_blank">WhatsApp</a></td></tr>`;
 }).join("")||'<tr><td colspan="6" class="muted">No customers found.</td></tr>';
 $("count").textContent=DATA.length;
 $("outstanding").textContent=money(DATA.reduce((s,c)=>s+(Number(c.remaining)||0),0));
 $("paid").textContent=DATA.filter(c=>(Number(c.remaining)||0)===0).length;
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
async function load(){
 try{const r=await fetch("/api/admin/data",{headers:{"x-admin-token":token()}});const d=await r.json();if(!d.ok)throw Error(d.error||"Unable to load");DATA=d.clients||[];render();}
 catch(e){show(e.message);}
}
$("search").oninput=render;
$("upload").onclick=async()=>{
 const f=$("file").files[0]; if(!token()){show("Enter the admin token.");return;} if(!f){show("Select the Excel file.");return;}
 $("upload").disabled=true;show("Reading Excel...");
 try{
  const buf=await f.arrayBuffer();
  const s=document.createElement("script");
  s.src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
  await new Promise((res,rej)=>{s.onload=res;s.onerror=rej;document.head.appendChild(s)});
  const wb=XLSX.read(buf,{type:"array"}), ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
  if(!rows.length)throw Error("Excel file is empty.");
  const h=rows[0].map(v=>String(v).trim().toLowerCase());
  const find=(...a)=>{for(const n of a){const i=h.indexOf(n);if(i>=0)return i}return -1};
  const ni=find("name","client name","customer name"),pi=find("contact number","phone","phone number","contact"),ri=find("remaining balance","remaining","balance due","amount due");
  if(ni<0||pi<0||ri<0)throw Error("Required columns: Name, Contact Number, Remaining Balance.");
  const clients=[];
  for(let i=1;i<rows.length;i++){
   const name=String(rows[i][ni]??"").trim(),phone=String(rows[i][pi]??"").trim();
   let remaining=Number(String(rows[i][ri]??0).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0;
   if(name||phone)clients.push({name,phone,remaining});
  }
  if(!clients.length)throw Error("No customer rows found.");
  show("Updating "+clients.length+" customers...");
  const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":token()},body:JSON.stringify({clients})});
  const d=await r.json(); if(!d.ok)throw Error(d.error||"Upload failed.");
  show("✓ Upload successful — "+d.count+" customers updated. Private links preserved.",true);
  $("file").value=""; await load();
 }catch(e){show("Upload failed: "+e.message)}finally{$("upload").disabled=false}
};
</script></body></html>`;

const PRIVATE_PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix — Your Balance</title>
<style>
body{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{width:min(460px,100%);background:white;border-radius:25px;padding:28px;box-shadow:0 12px 40px #14285018;text-align:center}
.logo{font-size:42px;font-weight:900;color:#1677ff}.sub{color:#687386;margin:8px 0 24px}
.name{font-size:20px;font-weight:800}.label{color:#687386;margin-top:22px}.amount{font-size:36px;font-weight:900;margin:8px 0 14px}
.status{display:inline-block;padding:9px 15px;border-radius:999px;font-weight:800}.paid{background:#e9f8ef;color:#16803c}.out{background:#fff4df;color:#9a6500}
.time{font-size:12px;color:#8b95a5;margin-top:22px}
</style></head><body><main class="card">
<div class="logo">Cellix</div><div class="sub">Your outstanding balance</div>
<div id="name" class="name"></div><div class="label">Remaining balance</div><div id="amount" class="amount"></div><div id="status"></div><div id="time" class="time"></div>
</main><script>
(async()=>{try{const d=await fetch(location.pathname.replace(/^\\/c\\//,"/api/private/")).then(r=>r.json());
if(!d.ok){document.querySelector("main").innerHTML="<div class='logo'>Cellix</div><p>Private link not found.</p>";return}
document.getElementById("name").textContent=d.customer.name;
document.getElementById("amount").textContent=new Intl.NumberFormat("en-US").format(Number(d.customer.remaining)||0)+" LBP";
const paid=(Number(d.customer.remaining)||0)===0;document.getElementById("status").innerHTML=paid?'<span class="status paid">✓ Account Paid</span>':'<span class="status out">Outstanding Balance</span>';
document.getElementById("time").textContent="Checked at: "+d.checkedAt;
}catch(e){document.querySelector("main").innerHTML="<div class='logo'>Cellix</div><p>Unable to load balance.</p>"}})();
</script></body></html>`;

function json(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
}
function normalizePhone(v){return String(v??"").replace(/\D/g,"");}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}
function token(){return crypto.randomUUID().replace(/-/g,"")+crypto.randomUUID().replace(/-/g,"");}
function safeEqual(a,b){return String(a||"")===String(b||"");}

export default {
 async fetch(request,env){
  const url=new URL(request.url);

  if(url.pathname==="/admin/upload"){
   return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  }

  if(url.pathname.startsWith("/c/")){
   return new Response(PRIVATE_PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  }

  if(url.pathname.startsWith("/api/private/")){
   const t=decodeURIComponent(url.pathname.slice("/api/private/".length));
   if(!t)return json({ok:false},404);
   const raw=await env.BALANCES?.get(DATA_KEY);
   if(!raw)return json({ok:false},404);
   let clients;try{clients=JSON.parse(raw)}catch{return json({ok:false},500)}
   const c=clients.find(x=>x.token===t);
   if(!c)return json({ok:false},404);
   const checkedAt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date())+" • Lebanon Time (UTC+3)";
   return json({ok:true,customer:{name:c.name,remaining:Number(c.remaining)||0},checkedAt});
  }

  if(url.pathname==="/api/admin/data"){
   if(!safeEqual(request.headers.get("x-admin-token"),env.ADMIN_TEST_TOKEN))return json({ok:false,error:"Unauthorized"},401);
   const raw=await env.BALANCES?.get(DATA_KEY);let clients=[];
   if(raw){try{clients=JSON.parse(raw)}catch{}}
   return json({ok:true,clients});
  }

  if(url.pathname==="/api/upload"&&request.method==="POST"){
   if(!safeEqual(request.headers.get("x-admin-token"),env.ADMIN_TEST_TOKEN))return json({ok:false,error:"Unauthorized"},401);
   let body;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
   if(!Array.isArray(body.clients)||!body.clients.length)return json({ok:false,error:"No customer data received."},400);

   const oldRaw=await env.BALANCES?.get(DATA_KEY);
   let old=[];if(oldRaw){try{old=JSON.parse(oldRaw)}catch{}}
   const byPhone=new Map(old.map(c=>[normalizePhone(c.phone),c]));
   const incoming=new Map(body.clients.map(c=>[normalizePhone(c.phone),c]));
   const now=new Date().toISOString();

   // Keep every existing customer permanently. Customers missing from the latest Excel become 0.
   for(const c of old){
    const p=normalizePhone(c.phone);const n=incoming.get(p);
    c.remaining=n?Number(n.remaining)||0:0;
    if(n&&n.name)c.name=String(n.name).trim();
    c.phone=n?String(n.phone).trim():c.phone;
    if(!c.token)c.token=token();
    c.updatedAt=now;
   }
   for(const c of body.clients){
    const p=normalizePhone(c.phone);if(!p)continue;
    if(byPhone.has(p))continue;
    old.push({name:String(c.name||"").trim(),phone:String(c.phone||"").trim(),remaining:Number(c.remaining)||0,token:token(),updatedAt:now});
   }
   const clients=old.filter(c=>c.name||c.phone);
   await env.BALANCES.put(DATA_KEY,JSON.stringify(clients));
   await env.BALANCES.put(META_KEY,JSON.stringify({count:clients.length,updatedAt:now}));
   return json({ok:true,count:body.clients.length,total:clients.length});
  }

  if(url.pathname==="/api/health")return json({ok:true,storage:!!env.BALANCES});

  // Keep the old public lookup available for compatibility, but direct customers should use private links.
  if(url.pathname==="/api/check"){
   const raw=await env.BALANCES?.get(DATA_KEY);if(!raw)return json({ok:false,message:"No customer data has been uploaded yet."},404);
   let clients;try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}
   const p=normalizePhone(url.searchParams.get("phone")),n=normalizeName(url.searchParams.get("name"));
   const c=clients.find(x=>normalizePhone(x.phone)===p&&normalizeName(x.name)===n);
   return c?json({ok:true,customer:c}):json({ok:false,message:"No matching customer was found."});
  }

  return Response.redirect(new URL("/admin/upload",request.url).toString(),302);
 }
};