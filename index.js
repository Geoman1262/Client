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
<title>Cellix Admin — Dashboard</title>
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<style>
body{font-family:Arial,sans-serif;background:#f4f7fb;margin:0;padding:18px;color:#172033}.wrap{max-width:1200px;margin:auto}.top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.logo{font-size:40px;font-weight:900;color:#1677ff}.sub{color:#697386;margin:4px 0 18px}.time,.panel,.card{background:#fff;border-radius:18px;box-shadow:0 8px 28px #0000000d}.time{padding:14px 18px;color:#697386}.time b{display:block;color:#172033;margin-top:4px}.panel{padding:20px;margin:14px 0}.upload{display:grid;grid-template-columns:1fr 260px;gap:12px}.filebox{border:2px dashed #cbd8e8;border-radius:15px;padding:16px}.filebox input{width:100%;margin-top:12px}.controls input,.controls button{width:100%;height:50px;border-radius:10px;box-sizing:border-box}.controls input{border:1px solid #ccd4df;padding:0 12px;margin-bottom:8px}.controls button{border:0;background:#1677ff;color:#fff;font-weight:800}.controls button:disabled{opacity:.6}.msg{margin-top:12px;white-space:pre-wrap;line-height:1.5}.ok{color:#16803c}.bad{color:#c62828}.hint{font-size:12px;color:#697386;margin-top:8px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.card{padding:16px}.k{font-size:13px;color:#697386}.v{font-size:25px;font-weight:900;margin-top:7px}.blue{color:#1677ff}.green{color:#16803c}.red{color:#c62828}.search{display:flex;gap:10px;margin-bottom:12px}.search input,.search select{height:44px;border:1px solid #ccd4df;border-radius:10px;padding:0 12px;box-sizing:border-box}.search input{flex:1}.search select{min-width:190px}.table{overflow:auto;border:1px solid #e2e8f0;border-radius:12px}table{border-collapse:collapse;width:100%;min-width:850px}th,td{padding:10px;border-bottom:1px solid #edf0f4;text-align:left;font-size:13px}th{background:#f8fafc}.pill{padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800}.paid{background:#eaf8ef;color:#167a3b}.due{background:#fff0f0;color:#b42318}.missing{background:#eef2f6;color:#667085}.btn{display:inline-block;text-decoration:none;background:#1677ff;color:#fff;padding:7px 9px;border-radius:8px;margin-right:5px}.wa{background:#18a957}.empty{text-align:center;color:#7a8494;padding:22px}@media(max-width:800px){.top{display:block}.time{margin-top:10px}.upload{grid-template-columns:1fr}.cards{grid-template-columns:repeat(2,1fr)}.search{display:block}.search input,.search select{width:100%;margin-bottom:8px}}
</style></head><body><div class="wrap">
<div class="top"><div><div class="logo">Cellix</div><h1 style="margin:4px 0">Customer Balance Dashboard</h1><div class="sub">Upload the latest Excel and manage private customer links.</div></div><div class="time">Last updated<b id="lastUpdated">—</b></div></div>
<div class="panel"><h2 style="margin-top:0">Update Customer Balances</h2><div class="upload"><div class="filebox"><b>Choose Excel File</b><input id="file" type="file" accept=".xlsx,.xls,.csv"><div id="fileInfo" class="hint">No file selected.</div></div><div class="controls"><input id="token" type="password" placeholder="Admin token" autocomplete="off"><button id="upload" type="button">Upload & Update</button></div></div><div id="msg" class="msg"></div></div>
<div id="dashboard" style="display:none"><div class="cards"><div class="card"><div class="k">Total Customers</div><div class="v blue" id="total">0</div></div><div class="card"><div class="k">Total Outstanding</div><div class="v red" id="sum">0 LBP</div></div><div class="card"><div class="k">Paid</div><div class="v green" id="paid">0</div></div><div class="card"><div class="k">Outstanding</div><div class="v red" id="due">0</div></div></div>
<div class="panel"><b>Customers not in latest Excel: <span id="missing">0</span></b></div>
<div class="panel"><h2 style="margin-top:0">Customers</h2><div class="search"><input id="q" placeholder="Search by name or phone"><select id="filter"><option value="all">All Customers</option><option value="due">Outstanding Only</option><option value="paid">Paid Only</option><option value="missing">Not in Latest Excel</option></select></div><div class="table"><table><thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Balance</th><th>Status</th><th>Private Link</th><th>WhatsApp</th></tr></thead><tbody id="customers"></tbody></table></div></div>
<div class="panel"><h2 style="margin-top:0">Recent Changes</h2><div class="table"><table><thead><tr><th>Customer</th><th>Previous</th><th>New</th><th>Difference</th><th>Change</th><th>Time</th></tr></thead><tbody id="changes"></tbody></table></div></div></div></div>
<script>
var uploadBtn=document.getElementById('upload'), msg=document.getElementById('msg'), fileInput=document.getElementById('file'), fileInfo=document.getElementById('fileInfo');
fileInput.addEventListener('change',function(){var f=fileInput.files[0];fileInfo.textContent=f?'Selected: '+f.name+' ('+Math.round(f.size/1024)+' KB)':'No file selected.';});
function show(t,c){msg.className='msg '+(c||'');msg.textContent=t;}
function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'&#92;'}[m];});}
function money(n){return new Intl.NumberFormat('en-US').format(Number(n)||0)+' LBP';}
function lt(v){if(!v)return '—';try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Beirut',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(v));}catch(e){return v;}}
function token(){return document.getElementById('token').value.trim();}
function loadDashboard(){fetch('/api/dashboard',{headers:{'x-admin-token':token()}}).then(function(r){return r.json().then(function(d){if(!r.ok||!d.ok)throw new Error(d.error||d.message||('HTTP '+r.status));return d;});}).then(render).catch(function(e){show('Dashboard: '+e.message,'bad');});}
function render(d){document.getElementById('dashboard').style.display='block';document.getElementById('lastUpdated').textContent=lt(d.updatedAt);document.getElementById('total').textContent=d.clients.length;document.getElementById('sum').textContent=money(d.clients.reduce(function(a,c){return a+(Number(c.remaining)||0);},0));document.getElementById('paid').textContent=d.clients.filter(function(c){return (Number(c.remaining)||0)===0;}).length;document.getElementById('due').textContent=d.clients.filter(function(c){return (Number(c.remaining)||0)>0;}).length;document.getElementById('missing').textContent=d.clients.filter(function(c){return c.status==='not_in_latest';}).length;window.cellixData=d;draw();}
function draw(){var d=window.cellixData||{clients:[],history:[]},q=document.getElementById('q').value.toLowerCase(),f=document.getElementById('filter').value;var a=d.clients.filter(function(c){var s=(c.name+' '+c.phone).toLowerCase(),n=Number(c.remaining)||0;if(q&&s.indexOf(q)<0)return false;if(f==='due'&&n<=0)return false;if(f==='paid'&&n!==0)return false;if(f==='missing'&&c.status!=='not_in_latest')return false;return true;});document.getElementById('customers').innerHTML=a.map(function(c,i){var n=Number(c.remaining)||0,miss=c.status==='not_in_latest',paid=n===0,p=String(c.phone||'').replace(/\D/g,'');if(p.charAt(0)==='0')p='961'+p.slice(1);else if(p&&p.indexOf('961')!==0)p='961'+p;var wa='https://wa.me/'+p+'?text='+encodeURIComponent('إدارة Cellix تشكركم على ثقتكم بنا،\n\nونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:\n\nالرابط:\n'+c.link+'\n\nنرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.\n\nكما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:\n\n1- افتحوا الرابط باستخدام Google Chrome.\n2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.\n3- اضغطوا Install / تثبيت للتأكيد.\n\nلمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686');return '<tr><td>'+ (i+1) +'</td><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.phone)+'</td><td>'+money(n)+'</td><td><span class="pill '+(miss?'missing':paid?'paid':'due')+'">'+(miss?'Not in latest Excel':paid?'✓ Account Paid':'Outstanding Balance')+'</span></td><td><a class="btn" href="'+esc(c.link)+'" target="_blank">Open Link</a></td><td><a class="btn wa" href="'+wa+'" target="_blank">WhatsApp</a></td></tr>';}).join('')||'<tr><td colspan="7" class="empty">No customers match your filter.</td></tr>';document.getElementById('changes').innerHTML=d.history.map(function(h){var dif=Number(h.diff)||0;return '<tr><td><b>'+esc(h.name)+'</b></td><td>'+money(h.previous)+'</td><td>'+money(h.current)+'</td><td>'+ (dif>0?'+':'') +money(dif)+'</td><td>'+esc(h.type)+'</td><td>'+lt(h.at)+'</td></tr>';}).join('')||'<tr><td colspan="6" class="empty">No changes recorded yet.</td></tr>';}
document.getElementById('q').addEventListener('input',draw);document.getElementById('filter').addEventListener('change',draw);
uploadBtn.onclick=async function(){var tokenValue=token(),f=fileInput.files[0];if(!tokenValue){show('Error: Please enter the admin token.','bad');return;}if(!f){show('Error: Please select the Excel file.','bad');return;}if(typeof XLSX==='undefined'){show('Error: Excel reader did not load. Check your internet connection and try again.','bad');return;}uploadBtn.disabled=true;show('Reading Excel...');try{var buf=await f.arrayBuffer(),wb=XLSX.read(buf,{type:'array'});if(!wb.SheetNames.length)throw new Error('The Excel file has no sheets.');var rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''});if(!rows.length)throw new Error('The Excel file is empty.');var header=rows[0].map(function(v){return String(v).trim().toLowerCase();});function find(){for(var a=0;a<arguments.length;a++){var i=header.indexOf(arguments[a].toLowerCase());if(i>=0)return i;}return -1;}var ni=find('name','client name','customer name'),pi=find('contact number','phone','phone number','contact'),ri=find('remaining balance','remaining','balance due','amount due');if(ni<0||pi<0||ri<0)throw new Error('Required columns not found. Need: Name, Contact Number, Remaining Balance.');var clients=[];for(var i=1;i<rows.length;i++){var name=String(rows[i][ni]==null?'':rows[i][ni]).trim(),phone=String(rows[i][pi]==null?'':rows[i][pi]).trim(),rem=rows[i][ri];if(name||phone){rem=Number(String(rem==null?0:rem).replace(/,/g,'').replace(/[^0-9.-]/g,''))||0;clients.push({name:name,phone:phone,remaining:rem});}}if(!clients.length)throw new Error('No customer rows found.');show('Uploading '+clients.length+' customers...');var r=await fetch('/api/upload',{method:'POST',headers:{'content-type':'application/json','x-admin-token':tokenValue},body:JSON.stringify({clients:clients})});var d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||d.message||('HTTP '+r.status));show('Success. '+d.count+' customers updated.','ok');await new Promise(function(x){setTimeout(x,150);});loadDashboard();fileInput.value='';fileInfo.textContent='No file selected.';}catch(e){show('Error: '+(e&&e.message?e.message:String(e)),'bad');}finally{uploadBtn.disabled=false;}};
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
