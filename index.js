const DATA_KEY="clients";
const META_KEY="meta";

const ADMIN=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cellix Admin</title>
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<style>
body{font-family:Arial;background:#f4f7fb;color:#172033;padding:20px;margin:0}.box{max-width:1050px;margin:auto;background:#fff;padding:24px;border-radius:22px;box-shadow:0 10px 30px #0001}h1{color:#1677ff}input,button{height:48px;border-radius:10px;border:1px solid #d5dce7;padding:0 12px;margin:5px}input{box-sizing:border-box}button{background:#1677ff;color:#fff;font-weight:800;border:0;padding:0 18px}.top{display:flex;gap:8px;flex-wrap:wrap}.token{flex:1;min-width:200px}.file{flex:2;min-width:220px}.msg{margin:12px 5px;font-weight:700}.ok{color:#16803c}.err{color:#c62828}.search{width:100%;margin:15px 0}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{padding:11px;border-bottom:1px solid #eee;text-align:left}th{font-size:12px;color:#667085}.wa{background:#159447;color:#fff;padding:8px 10px;border-radius:8px;text-decoration:none}.stats{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}.stat{background:#f7f9fc;border-radius:14px;padding:14px;min-width:150px}.n{font-size:23px;font-weight:900;margin-top:4px}
</style></head><body><div class="box"><h1>Cellix</h1><h2>Customer Balance Admin</h2>
<p>Upload the latest Excel report. Existing private links are preserved.</p>
<div class="top"><input id="token" class="token" type="password" placeholder="Admin token"><input id="file" class="file" type="file" accept=".xlsx,.xls,.csv"><button id="upload">Upload & Update</button></div>
<div id="msg" class="msg"></div>
<div class="stats"><div class="stat">Customers<div id="count" class="n">0</div></div><div class="stat">Outstanding<div id="total" class="n">0 LBP</div></div><div class="stat">Paid<div id="paid" class="n">0</div></div></div>
<input id="search" class="search" placeholder="Search name or phone">
<div class="table"><table><thead><tr><th>Name</th><th>Phone</th><th>Balance</th><th>Status</th><th>Private Link</th><th>WhatsApp</th></tr></thead><tbody id="list"></tbody></table></div>
</div>
<script>
const $=x=>document.getElementById(x), money=n=>new Intl.NumberFormat("en-US").format(Number(n)||0)+" LBP";
let DATA=[];
function show(t,ok){$("msg").textContent=t;$("msg").className="msg "+(ok?"ok":"err")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function waPhone(v){let d=String(v??"").replace(/\D/g,"");if(d[0]==="0")d="961"+d.slice(1);else if(!d.startsWith("961"))d="961"+d;return d}
function render(){
 const q=$("search").value.toLowerCase().trim(), a=DATA.filter(c=>(c.name+" "+c.phone).toLowerCase().includes(q));
 $("count").textContent=DATA.length;$("total").textContent=money(DATA.reduce((s,c)=>s+(Number(c.remaining)||0),0));$("paid").textContent=DATA.filter(c=>(Number(c.remaining)||0)===0).length;
 $("list").innerHTML=a.map(c=>{
  const link=location.origin+"/c/"+encodeURIComponent(c.token), bal=Number(c.remaining)||0;
  const text=`إدارة Cellix تشكركم على ثقتكم بنا،

ونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:

الرابط:
${link}

نرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.

كما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:

1- افتحوا الرابط باستخدام Google Chrome.
2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.
3- اضغطوا Install / تثبيت للتأكيد.

لمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686`;
  return `<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${money(bal)}</td><td>${bal===0?"Paid":"Outstanding"}</td><td><a href="${link}" target="_blank">Open link</a></td><td><a class="wa" href="https://wa.me/${waPhone(c.phone)}?text=${encodeURIComponent(text)}" target="_blank">WhatsApp</a></td></tr>`
 }).join("")||"<tr><td colspan='6'>No customers found.</td></tr>"
}
async function load(){
 const r=await fetch("/api/admin/data",{headers:{"x-admin-token":$("token").value}}),d=await r.json();
 if(!d.ok)throw Error(d.error||"Unauthorized");DATA=d.clients||[];render()
}
$("search").oninput=render;
$("upload").onclick=async()=>{
 try{
  const f=$("file").files[0],t=$("token").value.trim();if(!t)throw Error("Enter admin token.");if(!f)throw Error("Select Excel file.");
  show("Reading Excel...",true);const b=await f.arrayBuffer(),w=XLSX.read(b,{type:"array"}),s=w.Sheets[w.SheetNames[0]],rows=XLSX.utils.sheet_to_json(s,{header:1,defval:""});
  if(!rows.length)throw Error("Excel is empty.");
  const h=rows[0].map(v=>String(v).trim().toLowerCase()),find=(...x)=>x.map(v=>h.indexOf(v)).find(i=>i>=0);
  const ni=find("name","client name","customer name"),pi=find("contact number","phone","phone number","contact"),ri=find("remaining balance","remaining","balance due","amount due");
  if(ni==null||pi==null||ri==null)throw Error("Required columns: Name, Contact Number, Remaining Balance.");
  const clients=rows.slice(1).map(r=>({name:String(r[ni]??"").trim(),phone:String(r[pi]??"").trim(),remaining:Number(String(r[ri]??0).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0})).filter(c=>c.name||c.phone);
  if(!clients.length)throw Error("No customers found.");
  const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":t},body:JSON.stringify({clients})}),d=await r.json();
  if(!d.ok)throw Error(d.error||"Upload failed.");show("✓ Upload successful — "+d.count+" customers updated. Private links preserved.",true);$("file").value="";await load();
 }catch(e){show("Upload failed: "+e.message,false)}
};
</script></body></html>`;

const PRIVATE=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cellix — Your Balance</title>
<style>body{margin:0;background:#f4f7fb;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;color:#172033}.card{background:#fff;width:min(430px,100%);padding:28px;border-radius:24px;text-align:center;box-shadow:0 12px 40px #0001}.logo{font-size:42px;font-weight:900;color:#1677ff}.sub{color:#687386;margin:8px 0 28px}.name{font-size:20px;font-weight:800}.label{color:#687386;margin-top:25px}.amount{font-size:36px;font-weight:900;margin:8px}.status{display:inline-block;padding:9px 14px;border-radius:99px;font-weight:800}.paid{background:#e9f8ef;color:#16803c}.out{background:#fff4df;color:#9a6500}.time{font-size:12px;color:#8b95a5;margin-top:22px}</style></head><body><main class="card"><div class="logo">Cellix</div><div class="sub">Your outstanding balance</div><div id="name" class="name"></div><div class="label">Remaining balance</div><div id="amount" class="amount"></div><div id="status"></div><div id="time" class="time"></div></main>
<script>
(async()=>{try{const token=location.pathname.slice(3),r=await fetch("/api/private/"+encodeURIComponent(token)),d=await r.json();if(!d.ok)throw Error();
name.textContent=d.customer.name;amount.textContent=new Intl.NumberFormat("en-US").format(Number(d.customer.remaining)||0)+" LBP";
const paid=(Number(d.customer.remaining)||0)===0;status.innerHTML=paid?'<span class="status paid">✓ Account Paid</span>':'<span class="status out">Outstanding Balance</span>';time.textContent="Checked at: "+d.checkedAt}catch(e){document.querySelector(".card").innerHTML='<div class="logo">Cellix</div><p>Private link not found.</p>'}})();
</script></body></html>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}})}
function normPhone(v){return String(v??"").replace(/\D/g,"")}
function newToken(){return crypto.randomUUID().replace(/-/g,"")+crypto.randomUUID().replace(/-/g,"")}

export default{async fetch(request,env){
 const url=new URL(request.url);

 if(url.pathname==="/admin/upload")return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
 if(url.pathname.startsWith("/c/"))return new Response(PRIVATE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});

 if(url.pathname==="/api/private/"){
  return json({ok:false},404)
 }
 if(url.pathname.startsWith("/api/private/")){
  const t=decodeURIComponent(url.pathname.slice("/api/private/".length)),raw=await env.BALANCES.get(DATA_KEY);if(!raw)return json({ok:false},404);
  let clients;try{clients=JSON.parse(raw)}catch{return json({ok:false},500)}const c=clients.find(x=>x.token===t);if(!c)return json({ok:false},404);
  const checkedAt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date())+" • Lebanon Time (UTC+3)";
  return json({ok:true,customer:{name:c.name,remaining:Number(c.remaining)||0},checkedAt})
 }

 if(url.pathname==="/api/admin/data"){
  if(request.headers.get("x-admin-token")!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);
  const raw=await env.BALANCES.get(DATA_KEY);let clients=[];if(raw)try{clients=JSON.parse(raw)}catch{}
  return json({ok:true,clients})
 }

 if(url.pathname==="/api/upload"&&request.method==="POST"){
  if(request.headers.get("x-admin-token")!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);
  let body;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
  if(!Array.isArray(body.clients)||!body.clients.length)return json({ok:false,error:"No customer data received."},400);
  const raw=await env.BALANCES.get(DATA_KEY);let old=[];if(raw)try{old=JSON.parse(raw)}catch{}
  const oldByPhone=new Map(old.map(c=>[normPhone(c.phone),c])), incoming=new Map(body.clients.map(c=>[normPhone(c.phone),c])), now=new Date().toISOString();

  for(const c of old){
   const p=normPhone(c.phone),n=incoming.get(p);
   c.remaining=n?Number(n.remaining)||0:0;
   if(n&&n.name)c.name=n.name;
   if(n&&n.phone)c.phone=n.phone;
   if(!c.token)c.token=newToken();
   c.updatedAt=now;
  }
  for(const n of body.clients){
   const p=normPhone(n.phone);if(!p||oldByPhone.has(p))continue;
   old.push({name:n.name,phone:n.phone,remaining:Number(n.remaining)||0,token:newToken(),updatedAt:now});
  }
  await env.BALANCES.put(DATA_KEY,JSON.stringify(old));
  await env.BALANCES.put(META_KEY,JSON.stringify({count:old.length,updatedAt:now}));
  return json({ok:true,count:body.clients.length,total:old.length})
 }

 if(url.pathname==="/api/health")return json({ok:true,storage:!!env.BALANCES});
 return Response.redirect(new URL("/admin/upload",request.url).toString(),302);
}};