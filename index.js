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

const PRIVATE_PAGE = `<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Cellix — My Balance</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{width:min(440px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 12px 40px rgba(20,40,80,.10)}
.logo{font-size:40px;font-weight:800;color:#1677ff}.sub{color:#697386;margin:7px 0 25px}.name{font-size:18px;font-weight:800}
.amount{font-size:34px;font-weight:900;margin-top:10px}.label{font-size:13px;color:#687386;margin-top:22px}
.small{text-align:center;color:#9aa3b2;font-size:12px;margin-top:28px}.err{background:#fff2f2;border:1px solid #f0cccc;color:#b42318;border-radius:14px;padding:16px;margin-top:18px}
</style></head><body><main class="card">
<div class="logo">Cellix</div><div class="sub">Your outstanding balance</div>
<div id="content">Checking your account...</div><div class="small">Cellix</div>
<script>
(async()=>{
 const c=document.getElementById("content");
 try{
   const parts=location.pathname.split("/");
   const token=decodeURIComponent(parts[2]||"").trim();
   if(!token) throw new Error("Invalid private link.");
   const r=await fetch("/api/private?token="+encodeURIComponent(token),{cache:"no-store"});
   const d=await r.json();
   if(d.ok&&d.customer){
     c.innerHTML='<div class="name"></div><div class="label">Remaining balance</div><div class="amount"></div>';
     c.querySelector(".name").textContent=d.customer.name;
     c.querySelector(".amount").textContent=new Intl.NumberFormat("en-US").format(Number(d.customer.remaining)||0)+" LBP";
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
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<style>
body{font-family:Arial;background:#f4f7fb;margin:0;padding:24px;color:#172033}.box{max-width:520px;margin:30px auto;background:#fff;padding:26px;border-radius:22px;box-shadow:0 10px 35px #0001}h1{color:#1677ff}input,button{width:100%;height:50px;margin:8px 0;border-radius:10px;border:1px solid #ccd4df;padding:0 12px;box-sizing:border-box}button{background:#1677ff;color:#fff;font-weight:700;border:0}#msg{margin-top:14px;font-size:14px;white-space:pre-wrap} #links{margin-top:18px;font-size:13px}#links .row{padding:12px 0;border-top:1px solid #e6eaf0}#links a{color:#1677ff;word-break:break-all}</style>
</head><body><div class="box"><h1>Cellix</h1><h2>Upload Customer Balances</h2>
<p>Upload the new Excel file. It will replace the previous customer data.</p>
<input id="token" type="password" placeholder="Admin token">
<input id="file" type="file" accept=".xlsx,.xls,.csv">
<button id="upload">Upload & Replace Data</button><div id="msg"></div><div id="links"></div></div>
<script>
document.getElementById("upload").onclick=async()=>{
 const token=document.getElementById("token").value;
 const f=document.getElementById("file").files[0], msg=document.getElementById("msg");
 if(!token||!f){msg.textContent="Enter the token and select an Excel file.";return;}
 msg.textContent="Reading Excel...";
 try{
  const buf=await f.arrayBuffer();
  const wb=XLSX.read(buf,{type:"array"});
  const ws=wb.Sheets[wb.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
  if(!rows.length) throw new Error("The Excel file is empty.");
  const header=rows[0].map(v=>String(v).trim().toLowerCase());
  const find=(...names)=>{for(const n of names){const i=header.indexOf(n.toLowerCase());if(i>=0)return i;}return -1;};
  const nameI=find("name","client name","customer name");
  const phoneI=find("contact number","phone","phone number","contact");
  const remI=find("remaining balance","remaining","balance due","amount due");
  if(nameI<0||phoneI<0||remI<0) throw new Error("Required columns not found. Need: Name, Contact Number, Remaining Balance.");
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
  if(!clients.length) throw new Error("No customer rows found.");
  msg.textContent="Uploading "+clients.length+" customers...";
  const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":token},body:JSON.stringify({clients})});
  const d=await r.json();
  if(d.ok){msg.textContent="Success. "+d.count+" customers are now active.";const links=document.getElementById("links");links.innerHTML="<h3>Private customer links</h3>"+(d.links||[]).map(x=>'<div class="row"><b>'+x.name+'</b><br><a href="'+x.link+'" target="_blank">'+x.link+'</a></div>').join("");}else msg.textContent="Error: "+(d.error||"Upload failed.");
 }catch(e){msg.textContent="Error: "+e.message;}
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
    if(!env.BALANCES) return json({ok:false,message:"Balance storage is not configured."},500);
    const token=String(url.searchParams.get("token")||"").trim();
    if(!token) return json({ok:false,message:"Invalid private link."},400);
    const raw=await env.BALANCES.get(DATA_KEY);
    if(!raw) return json({ok:false,message:"No customer data has been uploaded yet."},404);
    let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500);}
    const customer=clients.find(c=>String(c.token||"")===token);
    return customer
      ? json({ok:true,customer:{name:customer.name,remaining:customer.remaining}})
      : json({ok:false,message:"This private link is invalid or no longer active."},404);
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
    let tokenMap={};
    const oldMap=await env.BALANCES.get("token_map");
    if(oldMap){try{tokenMap=JSON.parse(oldMap)}catch{}}
    const used=new Set(Object.values(tokenMap));
    const makeToken=()=>{
      let t="";
      do{
        const b=new Uint8Array(16); crypto.getRandomValues(b);
        t=Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");
      }while(used.has(t));
      used.add(t); return t;
    };
    const clients=incoming.map(c=>{
      const key=normalizePhone(c.phone)||normalizeName(c.name);
      if(!tokenMap[key]) tokenMap[key]=makeToken();
      return {...c,token:tokenMap[key]};
    });
    await env.BALANCES.put(DATA_KEY,JSON.stringify(clients));
    await env.BALANCES.put("token_map",JSON.stringify(tokenMap));
    await env.BALANCES.put("meta",JSON.stringify({count:clients.length,updatedAt:new Date().toISOString()}));
    const links=clients.map(c=>({name:c.name,link:new URL("/c/"+c.token,request.url).toString()}));
    return json({ok:true,count:clients.length,links});
  }

  if(url.pathname==="/api/health"){
   return json({ok:true,storage:!!env.BALANCES});
  }

  return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
 }
};
