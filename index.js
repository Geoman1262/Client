export default {
  async fetch() {
    return new Response(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cellix Test Preview</title>
<style>
body{margin:0;background:#f4f7fb;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:white;border-radius:24px;padding:40px 28px;text-align:center;box-shadow:0 10px 35px #0001;max-width:420px;width:calc(100% - 48px)}
.logo{font-size:52px;font-weight:800;color:#1976f3;margin-bottom:20px}
h1{color:#172033;margin:0 0 12px}
p{color:#667085;font-size:18px}
.ok{display:inline-block;background:#e8f7ed;color:#16803c;padding:12px 18px;border-radius:12px;font-weight:700}
</style>
</head>
<body>
<div class="card">
<div class="logo">Cellix</div>
<h1>TEST PREVIEW</h1>
<p>This is the separate Test branch.</p>
<div class="ok">✓ Preview is working</div>
</div>
</body>
</html>`, {headers: {"content-type":"text/html;charset=UTF-8"}});
  }
};
