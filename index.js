const DATA_KEY = "clients";
const BUILD = "CELLIX_TEST_DASHBOARD_V11";

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

const PRIVATE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Cellix — My Balance</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:min(440px,100%);background:#fff;border-radius:24px;padding:28px;box-shadow:0 12px 40px rgba(20,40,80,.10)}.logo{font-size:40px;font-weight:800;color:#1677ff}.sub{color:#697386;margin:7px 0 20px}.identity{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}.name{font-size:20px;font-weight:800}.phone{font-size:13px;color:#687386}.private{font-size:12px;color:#7b8493;margin-top:5px}.balance{margin-top:22px;padding:20px;border-radius:18px;background:#eef5ff;border:1px solid #d7e7ff}.label{font-size:13px;color:#687386}.amount{font-size:30px;font-weight:900;margin-top:7px}.usd{font-size:18px;font-weight:800;color:#1677ff;margin-top:6px}.checked{font-size:12px;color:#687386;margin-top:18px}.status{display:inline-block;margin-top:14px;padding:8px 12px;border-radius:999px;font-size:13px;font-weight:800}.paid{background:#eaf8ef;color:#167a3b}.due{background:#fff4e5;color:#9a5b00}.privacy{margin-top:18px;padding:12px;border-radius:12px;background:#fff8e8;color:#7a5a00;font-size:12px;line-height:1.5}.install{margin-top:12px;padding:12px;border-radius:12px;background:#f4f7fb;color:#586273;font-size:12px;line-height:1.55}.small{text-align:center;color:#9aa3b2;font-size:12px;margin-top:24px}.err{background:#fff2f2;border:1px solid #f0cccc;color:#b42318;border-radius:14px;padding:16px;margin-top:18px}</style></head><body><main class="card"><div class="logo">Cellix</div><div class="sub">Your outstanding balance</div><div id="content">Checking your account...</div><div class="small">Cellix</div><script>
(async()=>{const c=document.getElementById("content");try{const token=decodeURIComponent(location.pathname.split("/")[2]||"").trim();if(!token)throw new Error("Invalid private link.");const r=await fetch("/api/private?token="+encodeURIComponent(token),{cache:"no-store"});const d=await r.json();if(!d.ok||!d.customer)throw new Error(d.message||"This private link is invalid or no longer active.");const x=d.customer,amount=Number(x.remaining)||0;const rate=Number(x.exchangeRate)||0;const usd=rate>0?amount/rate:0;const paid=amount===0;const updated=x.updatedAt?new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(x.updatedAt)):"—";c.innerHTML='<div class="identity"><div class="name"></div><div class="phone"></div></div><div class="private">This is your private Cellix link.</div><div class="balance"><div class="label">Outstanding Balance</div><div class="amount"></div><div class="usd"></div></div><div class="checked">Last updated: '+updated+' (Lebanon time)</div><div class="status '+(paid?"paid":"due")+'">'+(paid?"✓ Account Paid":"Outstanding Balance")+'</div><div class="privacy">🔒 This private page contains confidential account information. Please do not share this link.</div><div class="install"><b>Save this page on your phone:</b><br>Open it in Google Chrome → ⋮ → Install / Add to Home screen, if available.</div>';c.querySelector(".name").textContent=x.name||"";c.querySelector(".phone").textContent=x.phone||"";c.querySelector(".amount").textContent=new Intl.NumberFormat("en-US").format(amount)+" LBP";c.querySelector(".usd").textContent=rate>0?"≈ $"+usd.toFixed(2):"USD unavailable";}catch(e){c.innerHTML='<div class="err"></div>';c.querySelector(".err").textContent=e.message||"Unable to load your balance. Please try again.";}})();
</script></main></body></html>`;
const ADMIN = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cellix Admin</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f7fb;color:#172033}.wrap{max-width:1100px;margin:24px auto;padding:0 16px}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.logo{font-size:38px;font-weight:900;color:#1677ff}.sub{color:#697386}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.card,.panel{background:#fff;border-radius:18px;padding:18px;box-shadow:0 8px 28px #17325d10}.k{font-size:12px;color:#697386}.v{font-size:25px;font-weight:900;margin-top:5px}.grid{display:grid;grid-template-columns:1fr 2fr;gap:16px}.input{width:100%;height:46px;border:1px solid #ccd6e2;border-radius:10px;padding:0 12px;margin:7px 0;background:#fff}.btn{border:0;border-radius:10px;padding:12px 15px;font-weight:800;cursor:pointer;background:#1677ff;color:#fff}.btn.green{background:#16a05d}.btn.light{background:#edf4ff;color:#1677ff}.actions{display:flex;gap:8px;flex-wrap:wrap}.tablewrap{overflow:auto}.table{width:100%;border-collapse:collapse;min-width:850px}.table th,.table td{text-align:left;padding:11px 9px;border-bottom:1px solid #edf0f4;font-size:13px}.table th{color:#687386;font-size:12px}.search{width:100%;height:46px;border:1px solid #ccd6e2;border-radius:10px;padding:0 12px;margin-bottom:10px}.msg{font-size:13px;margin-top:10px;white-space:pre-wrap}.ok{color:#167a3b}.bad{color:#b42318}.history{max-height:280px;overflow:auto}.hist{padding:10px 0;border-bottom:1px solid #edf0f4;font-size:12px}.muted{color:#697386}.rate{display:flex;gap:8px;align-items:center}.rate .input{margin:0}.build{font-size:11px;color:#9aa3b2}@media(max-width:800px){.cards{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}@media(max-width:480px){.cards{grid-template-columns:1fr}.logo{font-size:32px}}</style></head><body><div class="wrap"><div class="top"><div><div class="logo">Cellix</div><div class="sub">Customer Balance Dashboard</div></div><div class="build">V11 • Test</div></div><div class="cards"><div class="card"><div class="k">Total Customers</div><div class="v" id="count">—</div></div><div class="card"><div class="k">Total Balance (LBP)</div><div class="v" id="total">—</div></div><div class="card"><div class="k">Total Balance (USD)</div><div class="v" id="totalUsd">—</div></div><div class="card"><div class="k">Last Updated</div><div class="v" id="updated" style="font-size:16px">—</div></div></div><div class="grid"><div><div class="panel"><h3 style="margin-top:0">Admin Access</h3><form method="post" action="/admin/login"><input class="input" id="token" name="token" type="password" placeholder="Admin token" required><button class="btn" type="submit">Load Dashboard</button></form><div id="msg" class="msg">Enter your admin token and press Load Dashboard.</div></div><div class="panel" style="margin-top:16px"><h3 style="margin-top:0">Exchange Rate</h3><div class="rate"><span>1 USD =</span><input class="input" id="rate" inputmode="decimal" placeholder="89500"><span>LBP</span></div><button class="btn light" id="saveRate" style="margin-top:10px">Save Exchange Rate</button><div id="rateMsg" class="msg"></div></div><div class="panel" style="margin-top:16px"><h3 style="margin-top:0">Upload Excel</h3><p class="muted" style="font-size:13px">Use the proven direct upload. It does not depend on browser JavaScript.</p><a class="btn green" href="/admin/upload" style="display:inline-block;text-decoration:none">Open Upload</a></div></div><div><div class="panel"><div class="actions"><input class="search" id="search" placeholder="Search by name or phone number..."><button class="btn light" id="refresh">Refresh</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Name</th><th>Phone</th><th>Balance LBP</th><th>USD</th><th>Status</th><th>Private Link</th><th>WhatsApp</th></tr></thead><tbody id="rows"><tr><td colspan="7" class="muted">Enter admin token and load dashboard.</td></tr></tbody></table></div></div><div class="panel" style="margin-top:16px"><h3 style="margin-top:0">Update History</h3><div id="history" class="history"><div class="muted">No data loaded.</div></div></div></div></div></div><script>
let state={clients:[],history:[],rate:0,token:""};
const $=id=>document.getElementById(id);const fmt=n=>new Intl.NumberFormat("en-US").format(Number(n)||0);const time=v=>v?new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Beirut",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(v)):"—";
function wa(c){let p=String(c.phone||"").replace(/\D/g,"");if(p.startsWith("0"))p="961"+p.slice(1);else if(p&&!p.startsWith("961"))p="961"+p;const msg=["إدارة Cellix تشكركم على ثقتكم بنا،","","ونشارككم رابطكم الخاص للاطلاع على رصيدكم الحالي:","","الرابط:",String(c.link||""),"","نرجو منكم عدم مشاركة هذا الرابط مع أي شخص، حفاظاً على خصوصية معلومات حسابكم.","","كما نوصي بحفظ الرابط على هاتفكم من خلال تثبيت صفحة Cellix، وذلك باتباع الخطوات التالية:","","1- افتحوا الرابط باستخدام Google Chrome.","2- اضغطوا على ⋮ ثم اختاروا Install / تثبيت التطبيق إذا ظهر الخيار.","3- اضغطوا Install / تثبيت للتأكيد.","","لمزيد من التفاصيل أو المساعدة، يرجى التواصل مع إدارة Cellix حصراً على الرقم الخاص: 81024686"].join("\n");return p?"https://wa.me/"+p+"?text="+encodeURIComponent(msg):"#";}
function render(){const q=$("search").value.trim().toLowerCase();const list=state.clients.filter(c=>!q||String(c.name).toLowerCase().includes(q)||String(c.phone).toLowerCase().includes(q));$("rows").innerHTML=list.map(c=>'<tr><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.phone)+'</td><td>'+fmt(c.remaining)+'</td><td>'+(state.rate>0?"$"+(Number(c.remaining)/state.rate).toFixed(2):"—")+'</td><td>'+esc(c.status)+'</td><td><button class="btn light" data-copy="'+esc(c.link)+'">Copy Link</button></td><td><a class="btn green" href="'+esc(wa(c))+'" target="_blank" rel="noopener">WhatsApp</a></td></tr>').join("")||'<tr><td colspan="7" class="muted">No customers found.</td></tr>';$('rows').querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent="Copied";setTimeout(()=>b.textContent="Copy Link",1200)}catch{prompt("Copy private link:",b.dataset.copy)}});$("history").innerHTML=state.history.slice(0,30).map(h=>'<div class="hist"><b>'+esc(h.name||"")+'</b> — '+esc(h.type||"")+'<br><span class="muted">'+time(h.at)+' • '+fmt(h.previous)+' → '+fmt(h.current)+' LBP</span></div>').join("")||'<div class="muted">No history yet.</div>';}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;"}[m]));}
async function load(){state.token=$("token").value.trim();$("msg").textContent="Loading...";try{const r=await fetch("/api/dashboard",{cache:"no-store"});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||"Unable to load dashboard.");state.clients=d.clients||[];state.history=d.history||[];state.rate=Number(d.exchangeRate)||0;$("rate").value=state.rate||"";$("count").textContent=state.clients.length;const total=state.clients.reduce((a,c)=>a+Number(c.remaining||0),0);$("total").textContent=fmt(total);$("totalUsd").textContent=state.rate>0?"$"+(total/state.rate).toFixed(2):"—";$("updated").textContent=time(d.updatedAt);$("msg").textContent="Dashboard loaded.";$("msg").className="msg ok";render()}catch(e){$("msg").textContent="Error: "+e.message;$("msg").className="msg bad"}}
$("load").onclick=load;load();$("refresh").onclick=load;$("search").oninput=render;$("saveRate").onclick=async()=>{const rate=Number($("rate").value);if(!(rate>0)){$("rateMsg").textContent="Enter a valid exchange rate.";return}if(!state.token){$("rateMsg").textContent="Load the dashboard first.";return}try{const r=await fetch("/api/exchange-rate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({rate})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"Save failed.");state.rate=rate;$("rateMsg").textContent="Saved: 1 USD = "+fmt(rate)+" LBP";load()}catch(e){$("rateMsg").textContent="Error: "+e.message}};
</script></body></html>`;
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});}
function xmlTextServer(bytes){return new TextDecoder("utf-8").decode(bytes)}
function xmlDecodeServer(s){return String(s??"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&")}
function xmlAttrServer(tag,name){const re=new RegExp("\\b"+name.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")+"\\s*=\\s*([\\\"'])([\\s\\S]*?)\\1","i");const m=String(tag||"").match(re);return m?xmlDecodeServer(m[2]):""}
function xmlTextContentServer(fragment){return xmlDecodeServer(String(fragment??"").replace(/<[^>]*>/g,""))}
function xmlBlocksServer(xml,tag){const re=new RegExp("<(?:(?:[A-Za-z_][\\w.-]*):)?"+tag+"\\b[^>]*>[\\s\\S]*?<\\/(?:(?:[A-Za-z_][\\w.-]*):)?"+tag+">","gi");return String(xml||"").match(re)||[]}
function xmlInnerServer(block,tag){const re=new RegExp("<(?:(?:[A-Za-z_][\\w.-]*):)?"+tag+"\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[A-Za-z_][\\w.-]*):)?"+tag+">","i");const m=String(block||"").match(re);return m?m[1]:""}
async function inflateRawServer(data){
 if(typeof DecompressionStream==="undefined")throw new Error("Server cannot decompress XLSX files.");
 const ds=new DecompressionStream("deflate-raw");
 return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
}
function xmlTagsServer(xml,tag){const re=new RegExp("<(?:(?:[A-Za-z_][\\w.-]*):)?"+tag+"\\b[^>]*\\/?\\>","gi");return String(xml||"").match(re)||[]}
async function unzipXlsxServer(buf){
 const a=new Uint8Array(buf),dv=new DataView(buf),u16=p=>dv.getUint16(p,true),u32=p=>dv.getUint32(p,true);
 let eocd=-1;for(let p=a.length-22;p>=Math.max(0,a.length-65557);p--){if(u32(p)===0x06054b50){eocd=p;break}}
 if(eocd<0)throw new Error("Invalid XLSX file (ZIP header not found).");
 const count=u16(eocd+10),cdOff=u32(eocd+16),out={};let p=cdOff;
 for(let i=0;i<count;i++){
  if(u32(p)!==0x02014b50)throw new Error("Invalid XLSX central directory.");
  const method=u16(p+10),csize=u32(p+20),nlen=u16(p+28),xlen=u16(p+30),clen=u16(p+32),loff=u32(p+42);
  const name=new TextDecoder().decode(a.slice(p+46,p+46+nlen));
  const ln=u16(loff+26),lx=u16(loff+28),data=a.slice(loff+30+ln+lx,loff+30+ln+lx+csize);
  out[name]=method===0?data:method===8?await inflateRawServer(data):null;
  if(!out[name])throw new Error("Unsupported XLSX compression for "+name);
  p+=46+nlen+xlen+clen;
 }
 return out;
}
async function readXlsxServer(file){
 if(/\.csv$/i.test(file.name)){
  const text=await file.text();return text.split(/\r?\n/).filter(x=>x.trim()!=="").map(line=>{let out=[],cur="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'&&line[i+1]==='"'){cur+='"';i++;continue}if(ch==='"'){q=!q;continue}if(ch===','&&!q){out.push(cur);cur=""}else cur+=ch}out.push(cur);return out});
 }
 const entries=await unzipXlsxServer(await file.arrayBuffer());
 const wb=xmlTextServer(entries["xl/workbook.xml"]||new Uint8Array());
 if(!wb)throw new Error("Excel workbook.xml is missing.");
 const sheetBlocks=xmlTagsServer(wb,"sheet");if(!sheetBlocks.length)throw new Error("The Excel file has no sheets.");
 const sheet=sheetBlocks[0],rid=xmlAttrServer(sheet,"id");
 const relXml=xmlTextServer(entries["xl/_rels/workbook.xml.rels"]||new Uint8Array());let target="";
 for(const rel of xmlTagsServer(relXml,"Relationship")){if(xmlAttrServer(rel,"Id")===rid){target=xmlAttrServer(rel,"Target");break}}
 if(!target)target="worksheets/sheet1.xml";target=target.replace(/^\//,"");if(!target.startsWith("xl/"))target="xl/"+target.replace(/^xl\//,"");
 const shared=[];if(entries["xl/sharedStrings.xml"]){const sd=xmlTextServer(entries["xl/sharedStrings.xml"]);for(const si of xmlBlocksServer(sd,"si"))shared.push(xmlTextContentServer(si));}
 const sheetXml=xmlTextServer(entries[target]||new Uint8Array());if(!sheetXml)throw new Error("Excel worksheet is missing.");
 const rows=[];
 for(const rowBlock of xmlBlocksServer(sheetXml,"row")){
  const rowNo=Number(xmlAttrServer(rowBlock,"r"))||rows.length+1,arr=[];
  for(const c of xmlBlocksServer(rowBlock,"c")){
   const ref=xmlAttrServer(c,"r")||"A1",m=ref.match(/^([A-Z]+)(\d+)$/i);if(!m)continue;
   let col=0;for(const ch of m[1].toUpperCase())col=col*26+ch.charCodeAt(0)-64;col--;
   const type=xmlAttrServer(c,"t"),vBlock=xmlInnerServer(c,"v");let val="";
   if(type==="inlineStr"){const is=xmlInnerServer(c,"is");val=xmlTextContentServer(is);}
   else{val=xmlTextContentServer(vBlock);if(type==="s")val=shared[Number(val)]??"";else if(type==="b")val=val==="1"?"TRUE":"FALSE";}
   arr[col]=val;
  }
  rows[rowNo-1]=arr;
 }
 return rows;
}
function escapeHtml(v){return String(v??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","":"&quot;"}[m]));}
function normalizePhone(v){return String(v??"").replace(/\D/g,"");}
function normalizeName(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ");}
function waPhone(v){let p=normalizePhone(v);if(p.startsWith("0"))p="961"+p.slice(1);else if(p&&!p.startsWith("961"))p="961"+p;return p;}
function makeToken(){const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/admin/login"&&request.method==="POST"){
 const form=await request.formData(); const token=String(form.get("token")||"").trim();
 if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN) return new Response("<html><body style=\"font-family:Arial;padding:30px\"><h2 style=\"color:#b42318\">Invalid admin token</h2><a href=\"/admin\">Back</a></body></html>",{status:401,headers:{"content-type":"text/html;charset=UTF-8"}});
 return new Response(null,{status:303,headers:{"location":"/admin","set-cookie":"CELLIX_ADMIN="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Strict"}});
}
if(url.pathname==="/admin")return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  if(url.pathname==="/admin/upload")return new Response(ADMIN,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  if(url.pathname.startsWith("/c/")&&url.pathname.length>3)return new Response(PRIVATE_PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
  if(url.pathname==="/api/private"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const token=String(url.searchParams.get("token")||"").trim();const raw=await env.BALANCES.get(DATA_KEY);if(!token||!raw)return json({ok:false,message:"Invalid private link."},404);let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}const customer=clients.find(c=>String(c.token||"")===token);if(!customer)return json({ok:false,message:"This private link is invalid or no longer active."},404);const rateRaw=await env.BALANCES.get("exchangeRate");const exchangeRate=Number(rateRaw)||0;const metaRaw=await env.BALANCES.get("meta");let meta={};if(metaRaw){try{meta=JSON.parse(metaRaw)}catch{}}return json({ok:true,customer:{name:customer.name,phone:customer.phone||"",remaining:Number(customer.remaining)||0,status:customer.status||"active",exchangeRate,updatedAt:meta.updatedAt||null}});
  }
  if(url.pathname==="/api/check"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const phone=normalizePhone(url.searchParams.get("phone")),name=normalizeName(url.searchParams.get("name"));if(!phone||!name)return json({ok:false,message:"Missing phone or name."},400);const raw=await env.BALANCES.get(DATA_KEY);if(!raw)return json({ok:false,message:"No customer data has been uploaded yet."},404);let clients=[];try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}const customer=clients.find(c=>normalizePhone(c.phone)===phone&&normalizeName(c.name)===name);return customer?json({ok:true,customer}):json({ok:false,message:"No matching customer was found."});
  }
  if(url.pathname==="/api/dashboard"){
   if(!env.BALANCES)return json({ok:false,message:"Balance storage is not configured."},500);const token=request.headers.get("x-admin-token")||((request.headers.get("cookie")||"").match(/(?:^|;\s*)CELLIX_ADMIN=([^;]+)/)?.[1] ? decodeURIComponent((request.headers.get("cookie")||"").match(/(?:^|;\s*)CELLIX_ADMIN=([^;]+)/)[1]) : "");if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN)return json({ok:false,message:"Unauthorized"},401);const raw=await env.BALANCES.get(DATA_KEY);let clients=[];if(raw){try{clients=JSON.parse(raw)}catch{return json({ok:false,message:"Stored data is invalid."},500)}}const metaRaw=await env.BALANCES.get("meta");let meta={};if(metaRaw){try{meta=JSON.parse(metaRaw)}catch{}}const histRaw=await env.BALANCES.get("history");let history=[];if(histRaw){try{history=JSON.parse(histRaw)}catch{}}const resultClients=clients.map(c=>({name:c.name||"",phone:c.phone||"",remaining:Number(c.remaining)||0,status:c.status||((Number(c.remaining)||0)===0?"zero_balance":"active"),link:new URL("/c/"+c.token,request.url).toString()}));const exchangeRate=Number(await env.BALANCES.get("exchangeRate"))||0;return json({ok:true,clients:resultClients,history:history.slice(0,100),updatedAt:meta.updatedAt||null,exchangeRate});
  }
  if(url.pathname==="/api/exchange-rate"&&request.method==="POST"){
   if(!env.BALANCES)return json({ok:false,error:"BALANCES KV binding is missing."},500);
   const token=request.headers.get("x-admin-token")||((request.headers.get("cookie")||"").match(/(?:^|;\s*)CELLIX_ADMIN=([^;]+)/)?.[1] ? decodeURIComponent((request.headers.get("cookie")||"").match(/(?:^|;\s*)CELLIX_ADMIN=([^;]+)/)[1]) : "");if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN)return json({ok:false,error:"Unauthorized"},401);
   let body;try{body=await request.json()}catch{return json({ok:false,error:"Invalid JSON"},400)}
   const rate=Number(body.rate);if(!(rate>0))return json({ok:false,error:"Invalid exchange rate."},400);
   await env.BALANCES.put("exchangeRate",String(rate));return json({ok:true,rate});
  }
  if(url.pathname==="/api/upload"&&request.method==="POST"){
   if(!env.BALANCES)return json({ok:false,error:"BALANCES KV binding is missing."},500);
   const isHtml=url.searchParams.get("html")==="1";
   let token="", incoming=[];
   try{
    const ct=request.headers.get("content-type")||"";
    if(ct.includes("multipart/form-data")){
      const form=await request.formData();
      token=String(form.get("token")||"").trim();
      const file=form.get("file");
      if(!file||typeof file.arrayBuffer!=="function")throw new Error("No Excel file was received.");
      const rows=await readXlsxServer(file);
      if(!rows.length)throw new Error("The Excel file is empty.");
      const header=(rows[0]||[]).map(v=>String(v??"").trim().toLowerCase());
      const find=(...names)=>{for(const n of names){const i=header.indexOf(n.toLowerCase());if(i>=0)return i}return -1};
      const nameI=find("name","client name","customer name"),phoneI=find("contact number","phone","phone number","contact"),remI=find("remaining balance","remaining","balance due","amount due");
      if(nameI<0||phoneI<0||remI<0)throw new Error("Required columns not found. Need: Name, Contact Number, Remaining Balance.");
      for(let i=1;i<rows.length;i++){
       const name=String(rows[i]?.[nameI]??"").trim(),phone=String(rows[i]?.[phoneI]??"").trim();
       let remaining=rows[i]?.[remI]??0;
       if(name||phone){remaining=Number(String(remaining).replace(/,/g,"").replace(/[^0-9.-]/g,""))||0;incoming.push({name,phone,remaining});}
      }
    }else{
      token=request.headers.get("x-admin-token")||"";
      const body=await request.json();
      if(Array.isArray(body.clients))incoming=body.clients;
    }
   }catch(e){
    const msg=e?.message||String(e);
    if(isHtml)return new Response(`<html><body style="font-family:Arial;padding:30px"><h2 style="color:#b42318">Upload failed</h2><p>${escapeHtml(msg)}</p><a href="/admin/upload">Back</a></body></html>`,{status:400,headers:{"content-type":"text/html;charset=UTF-8"}});
    return json({ok:false,error:msg},400);
   }
   if(!env.ADMIN_TEST_TOKEN||token!==env.ADMIN_TEST_TOKEN){
    if(isHtml)return new Response(`<html><body style="font-family:Arial;padding:30px"><h2 style="color:#b42318">Upload failed</h2><p>Unauthorized admin token.</p><a href="/admin/upload">Back</a></body></html>`,{status:401,headers:{"content-type":"text/html;charset=UTF-8"}});
    return json({ok:false,error:"Unauthorized"},401);
   }
   if(!incoming.length){if(isHtml)return new Response(`<html><body style="font-family:Arial;padding:30px"><h2 style="color:#b42318">Upload failed</h2><p>No customer rows found.</p><a href="/admin/upload">Back</a></body></html>`,{status:400,headers:{"content-type":"text/html;charset=UTF-8"}});return json({ok:false,error:"No customer data received."},400);}
   incoming=incoming.map(c=>({name:String(c.name??"").trim(),phone:String(c.phone??"").trim(),remaining:Number(c.remaining)||0})).filter(c=>c.name||c.phone);
   let allCustomers=[];const oldRaw=await env.BALANCES.get(DATA_KEY);if(oldRaw){try{allCustomers=JSON.parse(oldRaw)}catch{}}
   const phoneKey=c=>normalizePhone(c.phone),nameKey=c=>normalizeName(c.name);
   const findExisting=c=>{const p=phoneKey(c),n=nameKey(c);return allCustomers.find(x=>(p&&phoneKey(x)===p)||(n&&nameKey(x)===n));};
   const updated=[];const changes=[];const now=new Date().toISOString();
   for(const c of incoming){const existing=findExisting(c);const customer={name:c.name||existing?.name||"",phone:c.phone||existing?.phone||"",remaining:c.remaining,token:existing?.token||makeToken(),status:c.remaining===0?"zero_balance":"active"};const previous=existing?Number(existing.remaining)||0:0;const type=!existing?"New Customer":(previous===c.remaining?"No Change":(c.remaining===0?"Account Paid":c.remaining>previous?"Balance Increased":"Balance Decreased"));changes.push({name:customer.name,previous,current:c.remaining,diff:c.remaining-previous,type,at:now});if(existing){const idx=allCustomers.indexOf(existing);if(idx>=0)allCustomers[idx]=customer;}else allCustomers.push(customer);updated.push(customer);}
   for(const c of allCustomers){if(!updated.some(u=>u.token===c.token)){const previous=Number(c.remaining)||0;if(previous!==0)changes.push({name:c.name,previous,current:0,diff:-previous,type:"Not in Latest Excel",at:now});c.remaining=0;c.status="not_in_latest";}}
   const historyRaw=await env.BALANCES.get("history");let history=[];if(historyRaw){try{history=JSON.parse(historyRaw)}catch{}}history=changes.concat(history).slice(0,1000);
   await env.BALANCES.put(DATA_KEY,JSON.stringify(allCustomers));await env.BALANCES.put("history",JSON.stringify(history));await env.BALANCES.put("meta",JSON.stringify({count:allCustomers.length,latestCount:updated.length,updatedAt:now}));
   if(isHtml){const esc=escapeHtml;return new Response(`<html><body style="font-family:Arial;padding:30px"><div style="max-width:650px;margin:auto"><h2 style="color:#1677ff">Cellix Upload Result — V9</h2><div style="padding:18px;border-radius:14px;background:#eef8f1;color:#167a3b"><b>UPLOAD: SUCCESS</b><br><br>Customers processed: ${updated.length}<br>Total customers stored: ${allCustomers.length}<br>Private links preserved.</div><a href="/admin/upload" style="display:inline-block;margin-top:18px">Upload another file</a></div></body></html>`,{status:200,headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});}
   return json({ok:true,count:updated.length,totalCustomers:allCustomers.length});
  }
  if(url.pathname==="/api/health")return json({ok:true,storage:!!env.BALANCES});
  return new Response(PAGE,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
 }
};
