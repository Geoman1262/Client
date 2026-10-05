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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix Admin — Dashboard</title>

<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033}.wrap{max-width:1250px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:20px}.logo{font-size:38px;font-weight:900;color:#1677ff}.sub{color:#697386;margin-top:5px}.time{background:#fff;border:1px solid #dfe6ef;border-radius:16px;padding:12px 16px;text-align:right;font-size:13px;color:#697386;box-shadow:0 6px 20px #17325d0d}.time b{display:block;color:#172033;font-size:14px;margin-top:3px}.panel{background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px #17325d0d;margin-bottom:20px}.uploadgrid{display:grid;grid-template-columns:1fr 230px;gap:12px}.filebox{border:2px dashed #cbd8e8;border-radius:16px;padding:16px}.filebox input{width:100%;margin-top:10px}.controls{display:flex;gap:10px;align-items:end}.controls input{height:48px;border:1px solid #ccd6e2;border-radius:11px;padding:0 12px;font-size:15px;width:100%}button{border:0;border-radius:11px;height:48px;padding:0 18px;font-weight:800;cursor:pointer;background:#1677ff;color:#fff;white-space:nowrap}button:disabled{opacity:.55}.btn2{background:#edf4ff;color:#1263d6}.msg{margin-top:12px;font-size:14px;white-space:pre-wrap;line-height:1.5}.ok{color:#16803c}.bad{color:#c62828}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{background:#fff;border-radius:16px;padding:18px;border:1px solid #e1e8f1}.card .k{font-size:13px;color:#697386}.card .v{font-size:25px;font-weight:900;margin-top:8px}.blue{color:#1677ff}.green{color:#16803c}.red{color:#c62828}.muted{color:#697386}.searchrow{display:flex;gap:10px;margin:18px 0 10px}.searchrow input,.searchrow select{height:44px;border:1px solid #ccd6e2;border-radius:10px;padding:0 12px;font-size:14px}.searchrow input{flex:1}.searchrow select{min-width:190px;background:#fff}.tablewrap{overflow:auto;border:1px solid #e2e8f0;border-radius:14px}table{width:100%;border-collapse:collapse;min-width:900px}th,td{padding:11px 12px;border-bottom:1px solid #edf0f4;text-align:left;font-size:13px}th{background:#f8fafc;color:#526075;position:sticky;top:0}td.num{text-align:right}.pill{display:inline-block;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800}.pill.paid{background:#eaf8ef;color:#167a3b}.pill.due{background:#fff0f0;color:#b42318}.pill.missing{background:#eef2f6;color:#667085}.mini{display:inline-block;text-decoration:none;border-radius:8px;padding:7px 9px;background:#1677ff;color:#fff;margin-right:5px}.wa{background:#18a957}.history{margin-top:20px}.history td.plus{color:#c62828;font-weight:800}.history td.minus{color:#16803c;font-weight:800}.empty{text-align:center;color:#7a8494;padding:25px}.hint{font-size:12px;color:#697386;margin-top:8px}.hidden{display:none}@media(max-width:800px){.wrap{padding:14px}.top{display:block}.time{margin-top:12px;text-align:left}.uploadgrid{grid-template-columns:1fr}.cards{grid-template-columns:repeat(2,1fr)}.controls{display:block}.controls button{width:100%;margin-top:8px}.searchrow{display:block}.searchrow input,.searchrow select{width:100%;margin-bottom:8px}}
</style></head><body><div class="wrap">
<div class="top"><div><div class="logo">Cellix</div><h1 style="margin:5px 0 0">Customer Balance Dashboard</h1><div class="sub">Upload the latest Excel and manage private customer links.</div></div><div class="time">Last updated<b id="lastUpdated">—</b></div></div>
<form id="dashboardForm" method="POST" action="/admin/dashboard"></form><div class="panel"><h2 style="margin-top:0">Admin Access</h2><div class="uploadgrid"><div class="filebox"><b>Dashboard</b><div class="hint">Enter the admin token, then press Load Dashboard.</div><button id="loadDashboard" type="submit" form="dashboardForm" class="btn2" style="margin-top:10px">Load Dashboard</button></div><div class="controls"><input id="token" name="token" type="text" placeholder="Admin token" autocomplete="off" form="dashboardForm"><button id="upload" type="button">Upload & Update</button></div></div><div id="msg" class="msg"></div><div id="ready" class="hint" style="margin-top:10px">System ready. Built-in Excel reader ready.</div></div>
<div id="dashboard" class="hidden">
<div class="cards"><div class="card"><div class="k">Total Customers</div><div class="v blue" id="totalCustomers">0</div></div><div class="card"><div class="k">Total Outstanding</div><div class="v red" id="totalOutstanding">0 LBP</div></div><div class="card"><div class="k">Paid</div><div class="v green" id="paidCount">0</div></div><div class="card"><div class="k">Outstanding</div><div class="v red" id="outstandingCount">0</div></div></div>
<div class="panel" style="margin-top:12px"><div style="font-weight:800">Customers not in latest Excel: <span id="missingCount">0</span></div></div>
<div class="panel"><h2 style="margin-top:0">Customers</h2><div class="searchrow"><input id="search" placeholder="Search by name or phone..."><select id="filter"><option value="all">All Customers</option><option value="outstanding">Outstanding Only</option><option value="paid">Paid Only</option><option value="missing">Not in Latest Excel</option></select></div><div class="tablewrap"><table><thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Balance</th><th>Status</th><th>Private Link</th><th>WhatsApp</th></tr></thead><tbody id="customersBody"></tbody></table></div></div>
<div class="panel history"><h2 style="margin-top:0">Recent Changes</h2><div class="hint" style="margin-bottom:10px">Changes from the latest uploads are kept in the system.</div><div class="tablewrap"><table><thead><tr><th>Customer</th><th>Previous</th><th>New</th><th>Difference</th><th>Change</th><th>Time</th></tr></thead><tbody id="historyBody"></tbody></table></div></div>
</div></div>
<script>window.sheetLoaded=true;</script>
<script>
const $=id=>document.getElementById(id);let state={clients:[],history:[]};
async function unzipEntries(buf){
 const a=new Uint8Array(buf), dv=new DataView(buf); const u16=(p)=>dv.getUint16(p,true), u32=(p)=>dv.getUint32(p,true);
 let eocd=-1; for(let p=a.length-22;p>=Math.max(0,a.length-65557);p--){if(u32(p)===0x06054b50){eocd=p;break}}
 if(eocd<0)throw new Error("Invalid XLSX file (ZIP header not found).");
 const count=u16(eocd+10), cdSize=u32(eocd+12), cdOff=u32(eocd+16), out={}; let p=cdOff;
 for(let i=0;i<count;i++){
  if(u32(p)!==0x02014b50)throw new Error("Invalid XLSX central directory.");
  const method=u16(p+10), csize=u32(p+20), nlen=u16(p+28), xlen=u16(p+30), clen=u16(p+32), loff=u32(p+42);
  const name=new TextDecoder().decode(a.slice(p+46,p+46+nlen));
  const lp=loff, ln=u16(lp+26), lx=u16(lp+28), data=a.slice(lp+30+ln+lx,lp+30+ln+lx+csize);
  out[name]=method===0?data:method===8?await inflateRaw(data):null;
  if(!out[name])throw new Error("Unsupported XLSX compression for "+name);
  p+=46+nlen+xlen+clen;
 }
 return out;
}
async function inflateRaw(data){
 if(typeof DecompressionStream==="undefined")throw new Error("This browser cannot read compressed Excel files.");
 const ds=new DecompressionStream("deflate-raw");
 return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
}
function xmlText(bytes){return new TextDecoder("utf-8").decode(bytes)}
function firstText(el){return el?el.textContent||"":""}
async function readXlsx(file){
 if(/\.csv$/i.test(file.name)){
  const text=await file.text(); return text.split(/\r?\n/).filter(x=>x.trim()!=="").map(line=>{let out=[],cur="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'&&line[i+1]==='"'){cur+='"';i++;continue}if(ch==='"'){q=!q;continue}if(ch===','&&!q){out.push(cur);cur=""}else cur+=ch}out.push(cur);return out});
 }
 const entries=await unzipEntries(await file.arrayBuffer());
 const wb=new DOMParser().parseFromString(xmlText(entries["xl/workbook.xml"]),"application/xml");
 const rels=new DOMParser().parseFromString(xmlText(entries["xl/_rels/workbook.xml.rels"]),"application/xml");
 const sheet=wb.getElementsByTagNameNS("*","sheet")[0]; if(!sheet)throw new Error("The Excel file has no sheets.");
 const rid=sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id")||sheet.getAttribute("r:id");
 let target=""; for(const r of rels.getElementsByTagNameNS("*","Relationship")){if(r.getAttribute("Id")===rid){target=r.getAttribute("Target")||"";break}}
 if(!target)target="worksheets/sheet1.xml"; target=target.replace(/^\//,""); if(!target.startsWith("xl/"))target="xl/"+target.replace(/^xl\//,"");
 const shared=[]; if(entries["xl/sharedStrings.xml"]){const sd=new DOMParser().parseFromString(xmlText(entries["xl/sharedStrings.xml"]),"application/xml");for(const si of sd.getElementsByTagNameNS("*","si"))shared.push(firstText(si));}
 const doc=new DOMParser().parseFromString(xmlText(entries[target]),"application/xml");
 const rows=[]; for(const row of doc.getElementsByTagNameNS("*","row")){const arr=[];for(const c of row.getElementsByTagNameNS("*","c")){const ref=c.getAttribute("r")||"A1", m=ref.match(/^([A-Z]+)(\d+)$/i);if(!m)continue;let col=0;for(const ch of m[1].toUpperCase())col=col*26+ch.charCodeAt(0)-64;col--;const type=c.getAttribute("t")||"";let val="";if(type==="inlineStr"){const is=c.getElementsByTagNameNS("*","is")[0];val=firstText(is)}else{const v=c.getElementsByTagNameNS("*","v")[0];val=firstText(v);if(type==="s")val=shared[Number(val)]??"";else if(type==="b")val=val==="1"?"TRUE":"FALSE"}arr[col]=val;}rows[Number(row.getAttribute("r")||rows.length+1)-1]=arr;}return rows;
}

function money(n){return new Intl.NumberFormat("en-US").format(Number(n)||0)+" LBP"}
function esc(v){return String(v??"").replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))}
function adminToken(){return $("token").value.trim()}
function show(text,cls=""){ $("msg").className="msg "+cls;$("msg").textContent=text; }
function localTime(v){if(!v)return "—";return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date(v));}
$("file").addEventListener("change",()=>{const f=$("file").files[0];$("fileInfo").textContent=f?"Selected: "+f.name+" ("+Math.round(f.size/1024)+" KB)":"No file selected.";});
async function api(path,opts={}){opts.headers=Object.assign({},opts.headers||{}, {"x-admin-token":adminToken()});const r=await fetch(path,opts);let d;try{d=await r.json()}catch{throw new Error("Server returned an invalid response (HTTP "+r.status+")")};if(!r.ok||d.ok===false)throw new Error(d.error||d.message||("HTTP "+r.status));return d;}
function render(){const q=$("search").value.trim().toLowerCase();const f=$("filter").value;const all=state.clients;const filtered=all.filter(c=>{const text=(String(c.name||"")+" "+String(c.phone||"")).toLowerCase();if(q&&!text.includes(q))return false;if(f==="outstanding"&&(Number(c.remaining)||0)<=0)return false;if(f==="paid"&&(Number(c.remaining)||0)!==0)return false;if(f==="missing"&&c.status!=="not_in_latest")return false;return true});
$("totalCustomers").textContent=all.length;$("totalOutstanding").textContent=money(all.reduce((s,c)=>s+(Number(c.remaining)||0),0));$("paidCount").textContent=all.filter(c=>(Number(c.remaining)||0)===0).length;$("outstandingCount").textContent=all.filter(c=>(Number(c.remaining)||0)>0).length;$("missingCount").textContent=all.filter(c=>c.status==="not_in_latest").length;
$("customersBody").innerHTML=filtered.map((c,i)=>{const amt=Number(c.remaining)||0;const paid=amt===0;const missing=c.status==="not_in_latest";let p=String(c.phone||"").replace(/\D/g,"");if(p.startsWith("0"))p="961"+p.slice(1);else if(p&&!p.startsWith("961"))p="961"+p;const wa="https://wa.me/"+p+"?text="+encodeURIComponent("إدارة Cellix تشكركم على ثقتكم بنا،\n\nونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:\n\nالرابط:\n"+c.link+"\n\nنرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.\n\nكما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:\n\n1- افتحوا الرابط باستخدام Google Chrome.\n2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.\n3- اضغطوا Install / تثبيت للتأكيد.\n\nلمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686");return '<tr><td>'+(i+1)+'</td><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.phone)+'</td><td class="num">'+money(amt)+'</td><td><span class="pill '+(missing?'missing':paid?'paid':'due')+'">'+(missing?'Not in latest Excel':paid?'✓ Account Paid':'Outstanding Balance')+'</span></td><td><a class="mini" href="'+esc(c.link)+'" target="_blank">Open Link</a></td><td><a class="mini wa" href="'+wa+'" target="_blank">WhatsApp</a></td></tr>'}).join("")||'<tr><td colspan="7" class="empty">No customers match your filter.</td></tr>';
$("historyBody").innerHTML=state.history.map(h=>'<tr><td><b>'+esc(h.name)+'</b></td><td>'+money(h.previous)+'</td><td>'+money(h.current)+'</td><td class="'+(h.diff>0?'plus':h.diff<0?'minus':'')+'">'+(h.diff>0?'+':'')+money(h.diff)+'</td><td>'+esc(h.type)+'</td><td>'+localTime(h.at)+'</td></tr>').join("")||'<tr><td colspan="6" class="empty">No changes recorded yet.</td></tr>';
}
async function loadDashboard(){try{const d=await api("/api/dashboard");state=d;$("dashboard").classList.remove("hidden");$("lastUpdated").textContent=localTime(d.updatedAt);render();return true;}catch(e){show("Dashboard: "+e.message,"bad");return false;}}
$("search").addEventListener("input",render);$("filter").addEventListener("change",render);
$("token").addEventListener("change",()=>{if(adminToken()&&!window.__AUTO_DASHBOARD)loadDashboard()});
if(window.__AUTO_DASHBOARD){$("token").value=window.__AUTO_TOKEN||"";state=window.__AUTO_STATE||state;$("dashboard").classList.remove("hidden");$("lastUpdated").textContent=localTime(state.updatedAt);render();show("Dashboard loaded successfully.","ok");}
$("upload").onclick=async()=>{const f=$("file").files[0];if(!adminToken()){show("Error: Please enter the admin token.","bad");return}if(!f){show("Error: Please select the Excel file.","bad");return}$("upload").disabled=true;show("Reading Excel...");try{const rows=await readXlsx(f);if(!rows.length)throw new Error("The Excel file is empty.");const header=(rows[0]||[]).map(v=>String(v??"").trim().toLowerCase());const find=(...names)=>{for(const n of names){const i=header.indexOf(n.toLowerCase());if(i>=0)return i}return -1};const nameI=find("name","client name","customer name"),phoneI=find("contact number","phone","phone number","contact"),remI=find("remaining balance","remaining","balance due","amount due");if(nameI<0||phoneI<0||remI<0)throw new Error("Required columns not found. Need: Name, Contact Number, Remaining Balance.");const clients=[];for(let i=1;i<rows.length;i++){const name=String(rows[i]?.[nameI]??"").trim(),phone=String(rows[i]?.[phoneI]??"").trim();let remaining=rows[i]?.[remI]??0;if(name||phone){remaining=Number(String(remaining).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0;clients.push({name,phone,remaining})}}if(!clients.length)throw new Error("No customer rows found.");show("Uploading "+clients.length+" customers...");const d=await api("/api/upload",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({clients})});show("Success. "+d.count+" customers updated. Private links preserved.","ok");await loadDashboard();$("file").value="";$("fileInfo").textContent="No file selected.";}catch(e){show("Error: "+(e.message||e),"bad")}finally{$("upload").disabled=false}};
</script></body></html>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});}
function normalizePhone(v){return String(v??"").replace(/\D/g,"");}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}
function waPhone(v){let p=normalizePhone(v);if(p.startsWith("0"))p="961"+p.slice(1);else if(p&&!p.startsWith("961"))p="961"+p;return p;}
function makeToken(){const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");}
function htmlAttr(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/admin/upload")return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  if(url.pathname.startsWith("/c/")&&url.pathname.length>3)return new Response(PRIVATE_PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  if(url.pathname==="/api/private"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const token=String(url.searchParams.get("token")||"").trim();const raw=await env.BALANCES.get(DATA_KEY);if(!token||!raw)return json({ok:false,message:"Invalid private link."},404);let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}const customer=clients.find(c=>String(c.token||"")===token);if(!customer)return json({ok:false,message:"This private link is invalid or no longer active."},404);return json({ok:true,customer:{name:customer.name,remaining:Number(customer.remaining)||0,status:customer.status||"active"}});
  }
  if(url.pathname==="/api/check"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const phone=normalizePhone(url.searchParams.get("phone")),name=normalizeName(url.searchParams.get("name"));if(!phone||!name)return json({ok:false,message:"Missing phone or name."},400);const raw=await env.BALANCES.get(DATA_KEY);if(!raw)return json({ok:false,message:"No customer data has been uploaded yet."},404);let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}const customer=clients.find(c=>normalizePhone(c.phone)===phone&&normalizeName(c.name)===name);return customer?json({ok:true,customer}):json({ok:false,message:"No matching customer was found."});
  }
  if(url.pathname==="/admin/dashboard" && request.method==="POST"){
   const form=await request.formData();
   const token=String(form.get("token")||"").trim();
   if(!env.BALANCES)return new Response("Balance storage is not configured.",{status:500});
   if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN){const badPage=ADMIN.replace('<input id="token" name="token" type="text" placeholder="Admin token" autocomplete="off" form="dashboardForm">','<input id="token" name="token" type="text" placeholder="Admin token" autocomplete="off" form="dashboardForm" value="'+htmlAttr(token)+'">').replace('</head>','<style>.msg{display:block}</style></head>').replace('<div id="msg" class="msg"></div>','<div id="msg" class="msg bad">Invalid admin token.</div>');return new Response(badPage,{status:401,headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});}
   const raw=await env.BALANCES.get(DATA_KEY);let clients=[];if(raw){try{clients=JSON.parse(raw)}catch{return new Response("Stored data is invalid.",{status:500})}}
   const metaRaw=await env.BALANCES.get("meta");let meta={};if(metaRaw){try{meta=JSON.parse(metaRaw)}catch{}}
   const histRaw=await env.BALANCES.get("history");let history=[];if(histRaw){try{history=JSON.parse(histRaw)}catch{}}
   const resultClients=clients.map(c=>({name:c.name||"",phone:c.phone||"",remaining:Number(c.remaining)||0,status:c.status||((Number(c.remaining)||0)===0?"zero_balance":"active"),link:new URL("/c/"+c.token,request.url).toString()}));
   const payload=JSON.stringify({clients:resultClients,history:history.slice(0,100),updatedAt:meta.updatedAt||null}).replace(/</g,"\u003c");
   const page=ADMIN.replace('<script>window.sheetLoaded=true;</script>','<script>window.sheetLoaded=true;window.__AUTO_DASHBOARD=true;window.__AUTO_TOKEN='+JSON.stringify(token)+';window.__AUTO_STATE='+payload+';</script>').replace('<input id="token" name="token" type="text" placeholder="Admin token" autocomplete="off" form="dashboardForm">','<input id="token" name="token" type="text" placeholder="Admin token" autocomplete="off" form="dashboardForm" value="'+htmlAttr(token)+'">');
   return new Response(page,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  }

  if(url.pathname==="/api/dashboard"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const token=request.headers.get("x-admin-token")||"";if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN)return json({ok:false,message:"Unauthorized"},401);const raw=await env.BALANCES.get(DATA_KEY);let clients=[];if(raw){try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}}const metaRaw=await env.BALANCES.get("meta");let meta={};if(metaRaw){try{meta=JSON.parse(metaRaw)}catch{}}const histRaw=await env.BALANCES.get("history");let history=[];if(histRaw){try{history=JSON.parse(histRaw)}catch{}}const resultClients=clients.map(c=>({name:c.name||"",phone:c.phone||"",remaining:Number(c.remaining)||0,status:c.status||((Number(c.remaining)||0)===0?"zero_balance":"active"),link:new URL("/c/"+c.token,request.url).toString()}));return json({ok:true,clients:resultClients,history:history.slice(0,100),updatedAt:meta.updatedAt||null});
  }
  if(url.pathname==="/api/upload"&&request.method==="POST"){
   if(!env.BALANCES)return json({ok:false,error:"BALANCES KV binding is missing."},500);const token=request.headers.get("x-admin-token")||"";if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);let body;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}if(!Array.isArray(body.clients)||!body.clients.length)return json({ok:false,error:"No customer data received."},400);
   const incoming=body.clients.map(c=>({name:String(c.name??"").trim(),phone:String(c.phone??"").trim(),remaining:Number(c.remaining)||0})).filter(c=>c.name||c.phone);
   let allCustomers=[];const oldRaw=await env.BALANCES.get(DATA_KEY);if(oldRaw){try{allCustomers=JSON.parse(oldRaw)}catch{}}
   const oldByToken=new Map(allCustomers.filter(c=>c.token).map(c=>[String(c.token),c]));
   const phoneKey=c=>normalizePhone(c.phone),nameKey=c=>normalizeName(c.name);
   const findExisting=c=>{const p=phoneKey(c),n=nameKey(c);return allCustomers.find(x=>(p&&phoneKey(x)===p)||(n&&nameKey(x)===n));};
   const updated=[];const matchedTokens=new Set();const changes=[];const now=new Date().toISOString();
   for(const c of incoming){const existing=findExisting(c);const customer={name:c.name||existing?.name||"",phone:c.phone||existing?.phone||"",remaining:c.remaining,token:existing?.token||makeToken(),status:c.remaining===0?"zero_balance":"active"};const previous=existing?Number(existing.remaining)||0:0;const type=!existing?"New Customer":(previous===c.remaining?"No Change":(c.remaining===0?"Account Paid":c.remaining>previous?"Balance Increased":"Balance Decreased"));changes.push({name:customer.name,previous,current:c.remaining,diff:c.remaining-previous,type,at:now});if(existing){const idx=allCustomers.indexOf(existing);if(idx>=0)allCustomers[idx]=customer;matchedTokens.add(String(existing.token));}else allCustomers.push(customer);updated.push(customer);}
   for(const c of allCustomers){if(!updated.some(u=>u.token===c.token)){const previous=Number(c.remaining)||0;if(previous!==0)changes.push({name:c.name,previous,current:0,diff:-previous,type:"Not in Latest Excel",at:now});c.remaining=0;c.status="not_in_latest";}}
   const historyRaw=await env.BALANCES.get("history");let history=[];if(historyRaw){try{history=JSON.parse(historyRaw)}catch{}}history=changes.concat(history).slice(0,1000);
   await env.BALANCES.put(DATA_KEY,JSON.stringify(allCustomers));await env.BALANCES.put("history",JSON.stringify(history));await env.BALANCES.put("meta",JSON.stringify({count:allCustomers.length,latestCount:updated.length,updatedAt:now}));
   return json({ok:true,count:updated.length,totalCustomers:allCustomers.length});
  }
  if(url.pathname==="/api/health")return json({ok:true,storage:!!env.BALANCES});
  return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
 }
};
