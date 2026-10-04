const DATA_KEY = "clients";

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;min-height:100vh;padding:20px}
.wrap{max-width:460px;margin:0 auto}.card{background:#fff;border-radius:24px;padding:26px;box-shadow:0 12px 40px rgba(20,40,80,.1);margin:18px 0}
.logo{font-size:40px;font-weight:800;color:#1677ff;letter-spacing:-1.5px}.sub{color:#697386;margin:6px 0 22px}
label{display:block;font-size:13px;font-weight:700;margin:15px 0 7px}
input{width:100%;height:52px;border:1px solid #d9e0ea;border-radius:13px;padding:0 15px;font-size:16px;outline:none}
button{width:100%;height:52px;border:0;border-radius:13px;background:#1677ff;color:#fff;font-size:16px;font-weight:800;margin-top:18px}
.result{margin-top:18px;border-radius:17px;padding:18px;display:none}.ok{background:#eef8f1;border:1px solid #ccebd5}.none{background:#f7f8fa;border:1px solid #e2e6ec}
.name{font-weight:800}.amount{font-size:30px;font-weight:900;margin-top:7px}.note{font-size:13px;color:#687386;margin-top:6px}
.err{color:#c62828;font-size:14px;margin-top:12px;display:none}.divider{height:1px;background:#e7ebf0;margin:26px 0}
.adminTitle{font-weight:800}.muted{color:#697386;font-size:13px;line-height:1.5}
.adminBox{display:none;margin-top:16px}.danger{background:#f6f8fb;color:#172033;border:1px solid #d9e0ea}
.status{margin-top:12px;font-size:14px;white-space:pre-wrap}
</style></head>
<body><div class="wrap">
<div class="card">
<div class="logo">Cellix</div><div class="sub">Check your outstanding balance</div>
<label>Phone Number</label><input id="phone" inputmode="numeric" placeholder="Enter phone number">
<label>Full Name</label><input id="name" autocomplete="name" placeholder="Enter your full name">
<button id="check">Check Balance</button><div id="err" class="err"></div>
<section id="result" class="result"><div id="resultName" class="name"></div><div id="resultAmount" class="amount"></div><div id="resultNote" class="note"></div></section>
</div>

<div class="card">
<div class="adminTitle">Admin</div><div class="muted">For updating customer balances with a new Excel file.</div>
<button class="danger" id="adminLogin">Admin Login</button>
<div id="adminBox" class="adminBox">
<label>Admin Token</label><input id="token" type="password" placeholder="Admin token">
<label>Excel File</label><input id="file" type="file" accept=".xlsx,.xls,.csv">
<button id="upload">Upload & Replace Data</button>
<div id="status" class="status"></div>
</div>
</div>
</div>
<script>
const normPhone=v=>String(v??"").replace(/\\D/g,"");
const normName=v=>String(v??"").trim().toLowerCase().replace(/\\s+/g," ");
const money=n=>new Intl.NumberFormat("en-US").format(Number(n)||0)+" LBP";

document.getElementById("check").onclick=async()=>{
 const phone=normPhone(phoneEl.value),name=normName(nameEl.value),err=document.getElementById("err"),box=document.getElementById("result");
 err.style.display="none";box.style.display="none";
 if(!phone||!name){err.textContent="Please enter your phone number and full name.";err.style.display="block";return;}
 const b=document.getElementById("check");b.disabled=true;b.textContent="Checking...";
 try{const r=await fetch("/api/check?phone="+encodeURIComponent(phone)+"&name="+encodeURIComponent(name));const d=await r.json();
 box.style.display="block";box.className="result "+(d.ok?"ok":"none");
 resultName.textContent=d.ok?d.customer.name:"";resultAmount.textContent=d.ok?money(d.customer.remaining):"No balance found";resultNote.textContent=d.ok?"Remaining balance":(d.message||"No matching customer was found.");
 }catch(e){err.textContent="Unable to check balance. Please try again.";err.style.display="block";}
 b.disabled=false;b.textContent="Check Balance";
};
const phoneEl=document.getElementById("phone"),nameEl=document.getElementById("name"),resultName=document.getElementById("resultName"),resultAmount=document.getElementById("resultAmount"),resultNote=document.getElementById("resultNote");
document.getElementById("adminLogin").onclick=()=>{const b=document.getElementById("adminBox");b.style.display=b.style.display==="block"?"none":"block";};
document.getElementById("upload").onclick=async()=>{
 const token=document.getElementById("token").value,f=document.getElementById("file").files[0],status=document.getElementById("status");
 if(!token||!f){status.textContent="Enter the Admin Token and choose an Excel file.";return;}
 status.textContent="Uploading...";
 try{
  const r=await fetch("/api/upload",{method:"POST",headers:{"content-type":"application/json","x-admin-token":token},body:await f.arrayBuffer()});
  const d=await r.json();status.textContent=d.ok?"Success. "+d.count+" customers are now active.":("Error: "+(d.error||"Upload failed."));
 }catch(e){status.textContent="Error: "+e.message;}
};
</script></body></html>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});}
function normalizePhone(v){return String(v??"").replace(/\D/g,"");}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}

export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==="/api/check"){
  if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);
  const phone=normalizePhone(url.searchParams.get("phone")),name=normalizeName(url.searchParams.get("name"));
  const raw=await env.BALANCES.get(DATA_KEY); if(!raw)return json({ok:false,message:"No customer data has been uploaded yet."},404);
  const clients=JSON.parse(raw); const customer=clients.find(c=>normalizePhone(c.phone)===phone&&normalizeName(c.name)===name);
  return customer?json({ok:true,customer}):json({ok:false,message:"No matching customer was found."});
 }
 if(url.pathname==="/api/upload"&&request.method==="POST"){
  if(!env.BALANCES)return json({ok:false,error:"BALANCES KV binding is missing."},500);
  if((request.headers.get("x-admin-token")||"")!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);
  const buf=await request.arrayBuffer();
  // Excel parsing is done client-side in the prior upload page. This endpoint expects JSON.
  // Keep compatibility with the existing admin page by accepting JSON if sent.
  try{
   const text=new TextDecoder().decode(buf); const body=JSON.parse(text);
   const clients=Array.isArray(body.clients)?body.clients:[]; if(!clients.length)return json({ok:false,error:"No customer data received."},400);
   await env.BALANCES.put(DATA_KEY,JSON.stringify(clients)); return json({ok:true,count:clients.length});
  }catch{return json({ok:false,error:"Upload format error. Use the existing Excel upload page."},400);}
 }
 return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
}};