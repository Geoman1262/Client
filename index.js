const DATA_PREFIX="customer:", META_KEY="meta";

const PAGE=`<!doctype html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix — Balance</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(135deg,#eef7ff,#f8fbff);color:#18345d;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:22px}
.card{width:min(500px,100%);background:#fff;border-radius:26px;padding:30px;box-shadow:0 14px 45px rgba(24,52,93,.12)}
.logo{font-size:44px;font-weight:800;color:#1677ed;letter-spacing:-2px}.sub{font-size:18px;color:#47617f;margin:5px 0 28px}
h1{font-size:22px;line-height:1.2;margin:0 0 8px;white-space:nowrap;letter-spacing:-.4px}.hint{color:#64748b;font-size:11px;line-height:1.4}.result{margin-top:22px;padding:22px;border-radius:20px;background:#f2f7ff;border:1px solid #dce9f8;display:none}
.name{font-size:18px;font-weight:800}.phone{font-size:12px;font-weight:500;color:#64748b;margin-top:4px}.label{font-size:13px;color:#64748b;margin-top:12px}.amount{font-size:34px;font-weight:900;color:#d33;margin-top:5px}
.empty{padding:18px;border-radius:16px;background:#f7f8fa;color:#64748b;margin-top:22px}.small{text-align:center;color:#9aa3b2;font-size:12px;margin-top:24px}
</style></head><body><main class="card"><div class="logo">Cellix</div><div class="sub">Check Your Balance</div>
<h1>Your Outstanding Balance</h1><div class="hint">This private link shows the latest balance associated with your account.</div>
<div id="result" class="result"><div class="name" id="name"></div><div class="phone" id="phone"></div><div class="label">Remaining Balance</div><div class="amount" id="amount"></div><div class="label">Last updated</div><div id="updated" style="font-size:15px;font-weight:700;margin-top:5px;color:#18345d"></div></div>
<div id="empty" class="empty" style="display:none">No balance information is available for this link.</div><div class="small">Cellix</div>
</main><script>(async()=>{const out=document.getElementById("result"),empty=document.getElementById("empty");try{
const token=location.pathname.split("/").filter(Boolean).pop()||"";const r=await fetch("/api/customer/"+encodeURIComponent(token),{cache:"no-store"});const d=await r.json();
if(d.ok&&d.customer){document.getElementById("name").textContent=d.customer.name||"Customer";document.getElementById("phone").textContent=d.customer.phone?d.customer.phone:"";document.getElementById("amount").textContent=new Intl.NumberFormat("en-US").format(Number(d.customer.remaining)||0)+" LBP";document.getElementById("updated").textContent=d.customer.updatedAt?new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",dateStyle:"full",timeStyle:"short"}).format(new Date(d.customer.updatedAt)):"";out.style.display="block"}else empty.style.display="block"}catch(e){empty.style.display="block"}})();</script>
</body></html>`;

const ADMIN=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix Admin — Upload Balances</title><script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<style>
*{box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:20px;color:#172033}.box{max-width:700px;margin:15px auto;background:#fff;padding:26px;border-radius:24px;box-shadow:0 10px 35px #0001}
h1{color:#1677ff;margin:0}.sub{color:#64748b;margin:6px 0 22px}input,button{width:100%;height:50px;margin:8px 0;border-radius:11px;border:1px solid #ccd4df;padding:0 13px;font-size:15px}button{background:#1677ff;color:#fff;font-weight:800;border:0;cursor:pointer}
#msg{margin-top:14px;white-space:pre-wrap;font-size:14px}#links{margin-top:22px;display:none}.link{padding:14px;border:1px solid #e1e7ef;border-radius:12px;margin:8px 0;word-break:break-all;background:#fafcff}.link b{display:block;margin-bottom:7px}
.direct{display:block;color:#1677ff;text-decoration:underline;font-size:14px}.actions{display:flex;gap:8px;margin-top:11px}.actions a{flex:1;text-align:center;padding:11px 8px;border-radius:10px;text-decoration:none;font-weight:800}.wa{background:#1fa855;color:#fff}.open{background:#1677ff;color:#fff}.note{font-size:13px;color:#64748b;margin-top:8px}
</style></head><body><div class="box"><h1>Cellix</h1><div class="sub">Upload Customer Balances</div>
<p>Upload a new Excel file. The previous Test customer data will be replaced.</p><input id="token" type="password" placeholder="Admin token"><input id="file" type="file" accept=".xlsx,.xls,.csv">
<button id="upload">Upload & Replace Data</button><div id="msg"></div><div id="links"><h3>Private Customer Links</h3><div id="linkList"></div></div></div>
<script>
const msg=document.getElementById("msg"),links=document.getElementById("links"),list=document.getElementById("linkList");
document.getElementById("upload").onclick=async()=>{const token=document.getElementById("token").value.trim(),f=document.getElementById("file").files[0];links.style.display="none";list.innerHTML="";
if(!token||!f){msg.textContent="Enter the admin token and select an Excel file.";return}try{msg.textContent="Reading Excel...";const buf=await f.arrayBuffer(),wb=XLSX.read(buf,{type:"array"}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
if(!rows.length)throw new Error("The Excel file is empty.");const header=rows[0].map(v=>String(v).trim().toLowerCase());
const find=(...names)=>{for(const n of names){const i=header.indexOf(n);if(i>=0)return i}return -1};
const nameI=find("name","client name","customer name"),phoneI=find("contact number","phone","phone number","contact"),remI=find("remaining balance","remaining","balance due","amount due");
if(nameI<0||phoneI<0||remI<0)throw new Error("Required columns: Name, Contact Number, Remaining Balance.");
const clients=[];for(let i=1;i<rows.length;i++){const name=String(rows[i][nameI]??"").trim(),phone=String(rows[i][phoneI]??"").trim();const remaining=Number(String(rows[i][remI]??0).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0;if(name||phone)clients.push({name,phone,remaining})}
if(!clients.length)throw new Error("No customer rows found.");msg.textContent="Uploading "+clients.length+" customers...";
const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":token},body:JSON.stringify({clients})}),d=await r.json();
if(!r.ok||!d.ok)throw new Error(d.error||"Upload failed.");msg.textContent="Success. "+d.count+" customers are stored (including closed accounts at 0 balance).";links.style.display="block";
d.links.forEach(x=>{const div=document.createElement("div");div.className="link";const b=document.createElement("b");b.textContent=x.name+(x.phone?" — "+x.phone:"");
const a=document.createElement("a");a.className="direct";a.href=x.url;a.target="_blank";a.rel="noopener";a.textContent=x.url;
const actions=document.createElement("div");actions.className="actions";const wa=document.createElement("a");wa.className="wa";wa.href=x.whatsapp;wa.target="_blank";wa.rel="noopener";wa.textContent="WhatsApp";
const open=document.createElement("a");open.className="open";open.href=x.url;open.target="_blank";open.rel="noopener";open.textContent="Open Link";
const n=document.createElement("div");n.className="note";n.textContent="Private link";actions.append(wa,open);div.append(b,a,actions,n);list.appendChild(div)})}catch(e){msg.textContent="Error: "+e.message}};
</script></body></html>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}})}
function normalizePhone(v){return String(v??"").replace(/\D/g,"")}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ")}
async function tokenForCustomer(phone,name){const key=normalizePhone(phone)+"|"+normalizeName(name),hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key));return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,32)}
function whatsappPhone(phone){let p=normalizePhone(phone);if(p.startsWith("00"))p=p.slice(2);if(p.startsWith("961"))return p;if(p.startsWith("0"))return "961"+p.slice(1);return p}
function whatsappMessage(link){return `إدارة Cellix تشكركم على ثقتكم بنا،

ونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:

الرابط: ${link}

نرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.

كما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:

1- افتحوا الرابط باستخدام Google Chrome.
2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.
3- اضغطوا Install / تثبيت للتأكيد.

لمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686`}
export default{async fetch(request,env){const url=new URL(request.url);
if(request.method==="GET"&&url.pathname==="/")return new Response(`<meta http-equiv="refresh" content="0;url=/admin/upload">`,{headers:{"content-type":"text/html;charset=UTF-8"}});
if(request.method==="GET"&&url.pathname==="/admin/upload")return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
if(request.method==="GET"&&url.pathname.startsWith("/c/"))return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
if(request.method==="GET"&&url.pathname.startsWith("/api/customer/")){const token=decodeURIComponent(url.pathname.slice(14)),raw=await env.BALANCES.get(DATA_PREFIX+token);if(!raw)return json({ok:false,error:"Customer link not found"},404);try{return json({ok:true,customer:JSON.parse(raw)})}catch{return json({ok:false,error:"Stored data is invalid"},500)}}
if(request.method==="POST"&&url.pathname==="/api/upload"){if(!env.BALANCES)return json({ok:false,error:"BALANCES KV binding is missing."},500);if((request.headers.get("x-admin-token")||"")!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);
let body;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}if(!Array.isArray(body.clients)||!body.clients.length)return json({ok:false,error:"No customer data received."},400);
const clients=body.clients.map(c=>({name:String(c.name??"").trim(),phone:String(c.phone??"").trim(),remaining:Number(c.remaining)||0})).filter(c=>c.name||c.phone);if(!clients.length)return json({ok:false,error:"No valid customer rows."},400);
const previous=[];let prevCursor;do{const page=await env.BALANCES.list({prefix:DATA_PREFIX,cursor:prevCursor});if(page.keys.length){const vals=await Promise.all(page.keys.map(k=>env.BALANCES.get(k.name)));for(let i=0;i<page.keys.length;i++){if(vals[i]){try{const customer=JSON.parse(vals[i]);previous.push({key:page.keys[i].name,customer})}catch{}}}}prevCursor=page.list_complete?undefined:page.cursor}while(prevCursor);
const oldByPhone=new Map();for(const item of previous){const p=normalizePhone(item.customer.phone);if(p)oldByPhone.set(p,item)}
const currentPhones=new Set();for(const c of clients){const p=normalizePhone(c.phone);if(p)currentPhones.add(p)}
const merged=[];const now=new Date().toISOString();
// Keep the original token forever. A customer's private link must NOT change when the Excel file changes.
for(const c of clients){
  const p=normalizePhone(c.phone);
  const old=oldByPhone.get(p);
  const name=c.name||old?.customer?.name||"Customer";
  const phone=c.phone||old?.customer?.phone||"";
  const token=old?.customer?.token||await tokenForCustomer(phone,name);
  merged.push({name,phone,remaining:c.remaining,token,updatedAt:now,isClosed:false});
}
// Customers missing from the new Excel are closed accounts: keep their old record/link and set balance to 0.
for(const item of previous){
  const old=item.customer,p=normalizePhone(old.phone);
  if(p&&currentPhones.has(p))continue;
  const name=old.name||"Customer",phone=old.phone||"",token=old.token||await tokenForCustomer(phone,name);
  merged.push({name,phone,remaining:0,token,updatedAt:now,isClosed:true});
}
const links=[];
for(let i=0;i<merged.length;i+=50){
  await Promise.all(merged.slice(i,i+50).map(async c=>{
    const link=`${url.origin}/c/${c.token}`;
    const customer={name:c.name,phone:c.phone,remaining:c.remaining,token:c.token,updatedAt:c.updatedAt,isClosed:c.isClosed};
    const wa=`https://wa.me/${whatsappPhone(c.phone)}?text=${encodeURIComponent(whatsappMessage(link))}`;
    await env.BALANCES.put(DATA_PREFIX+c.token,JSON.stringify(customer));
    links.push({name:c.name,phone:c.phone,url:link,whatsapp:wa,isClosed:c.isClosed});
  }));
}
await env.BALANCES.put(META_KEY,JSON.stringify({count:merged.length,activeCount:clients.length,closedCount:merged.length-clients.length,updatedAt:now}));
return json({ok:true,count:merged.length,activeCount:clients.length,closedCount:merged.length-clients.length,links})}
if(request.method==="GET"&&url.pathname==="/api/health")return json({ok:true,storage:!!env.BALANCES});
return new Response("Not found",{status:404})}};