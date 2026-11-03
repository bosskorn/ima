/* ===== shared layout ===== */
const HDR=`<header>
  <div class="wrap hdr">
    <a href="index.html" class="logo"><div class="logo-mark"><span>JSB</span></div><div>JSB Shop<small>CANDY FACTORY</small></div></a>
    <nav><a href="index.html">หน้าแรก</a><a href="products.html">สินค้า</a><a href="promotions.html">โปรโมชัน</a><a href="wholesale.html">ขายส่ง</a><a href="about.html">เกี่ยวกับเรา</a><a href="contact.html">ติดต่อ</a></nav>
    <form class="search" action="products.html"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" name="q" placeholder="ค้นหาอมยิ้ม ลูกอม..."></form>
    <div class="icons">
      <button class="ibtn" id="themeBtn" aria-label="สลับธีม"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <a class="ibtn" href="account.html" aria-label="บัญชี"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></a><a class="ibtn" href="account.html#fav" aria-label="รายการโปรด"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg><span class="badge" id="favN">0</span></a>
      <button class="ibtn" id="cartBtn" aria-label="ตะกร้า"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 2H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg><span class="badge" id="cartN">0</span></button>
    </div>
  </div>
</header>`;
const TAIL=`<div class="cta-band">
  <div class="wrap cta-in">
    <div><h2>ช้อปขนมได้ง่าย ทุกที่ ทุกเวลา</h2><h3>แอด LINE @jsbcandy รับโค้ดลดเพิ่ม!</h3><p>เช็กโปรโมชัน สั่งซื้อ และติดตามพัสดุได้จากมือถือ</p></div>
    <div class="qr"><div class="code" id="qr"></div><div class="store">LINE @jsbcandy</div></div>
    <div class="phone"><div><b style="color:var(--pink)">JSB Shop</b><div class="pb">🍭 Big Bomb · ฿89</div><div class="pb">🍬 Imoji Candy · ฿69</div><div class="pb">🍋 Sour Candy · ฿55</div><div class="pb" style="background:var(--pink);color:#fff;justify-content:center">ชำระเงิน</div></div></div>
  </div>
</div>

<footer style="margin-top:-60px">
  <div class="wrap">
    <div class="fgrid">
      <div><a href="index.html" class="logo"><div class="logo-mark"><span>JSB</span></div><div>JSB Shop<small>CANDY FACTORY</small></div></a><p style="color:var(--muted);margin-top:12px;font-size:15px;font-weight:300">ร้านค้าออนไลน์อย่างเป็นทางการของ JSB Candy ผู้ผลิตอมยิ้มและลูกอมคุณภาพ ส่งตรงจากโรงงานถึงมือคุณ</p><div class="social"><a>LINE</a><a>f</a><a>♪</a><a>▶</a></div></div>
      <div><h4>ช้อปปิ้ง</h4><ul><li><a href="products.html?cat=lolli">อมยิ้ม</a></li><li><a href="products.html?cat=candy">ลูกอม</a></li><li><a href="products.html?cat=sour">ลูกอมเปรี้ยว</a></li><li><a href="promotions.html">โปรโมชัน</a></li><li><a href="wholesale.html">ขายส่ง / ตัวแทน</a></li></ul></div>
      <div><h4>บริการลูกค้า</h4><ul><li><a href="account.html">บัญชีของฉัน</a></li><li><a href="order.html">ติดตามคำสั่งซื้อ</a></li><li><a href="cart.html">ตะกร้าสินค้า</a></li><li><a href="contact.html#faq">คำถามที่พบบ่อย</a></li></ul></div>
      <div><h4>JSB Candy</h4><ul><li><a href="about.html">เกี่ยวกับเรา</a></li><li><a href="contact.html">ติดต่อเรา</a></li><li><span class="ci">☎</span>02-XXX-XXXX</li><li><span class="ci">L</span>@jsbcandy</li></ul></div>
    </div>
    <div class="copy"><span>© 2026 JSB Candy. All rights reserved.</span><span>Made with 💖 in Thailand</span></div>
  </div>
</footer>


<div class="ov" id="ov"></div>
<aside class="drawer" id="drawer" aria-label="ตะกร้าสินค้า">
  <div class="dh"><h3>ตะกร้าของคุณ</h3><button class="ibtn" data-close>✕</button></div>
  <div class="ship" id="shipMsg"></div>
  <div class="items" id="items"></div>
  <div class="df" id="sum"></div>
</aside>

<div class="modal" id="modal"><div class="mbox"><button class="mx" data-close>✕</button><div id="mc"></div></div></div>
<div class="toast" id="toast"></div>`;
document.body.insertAdjacentHTML('afterbegin',HDR);document.body.insertAdjacentHTML('beforeend',TAIL);

const $=s=>document.querySelector(s);
const baht=n=>'฿'+Math.round(n).toLocaleString('th-TH');
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* candy illustrations */
/* 3D-style candy renders (SVG gradients + speculars + soft shadows) */
let _u=0;
const shade=(h,a)=>{let n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round((f-r)*t+r);g=Math.round((f-g)*t+g);b=Math.round((f-b)*t+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)};
function defs(id,c){return `<defs>
<radialGradient id="b${id}" cx=".32" cy=".28" r=".85"><stop offset="0" stop-color="${shade(c,.55)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-.45)}"/></radialGradient>
<radialGradient id="h${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="s${id}" x1="0" x2="1"><stop offset="0" stop-color="#d9cbbd"/><stop offset=".4" stop-color="#fffaf3"/><stop offset="1" stop-color="#cbb8a5"/></linearGradient>
<radialGradient id="g${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="f${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter></defs>`}
function art(type,c1,c2,c3){
  const id=++_u,D=defs(id,c1);
  const stick=(x,y1,y2)=>`<rect x="${x-5}" y="${y1}" width="10" height="${y2-y1}" rx="5" fill="url(#s${id})"/>`;
  const spec=(x,y,rx,ry,r=-30)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#h${id})" transform="rotate(${r} ${x} ${y})"/>`;
  const ground=(x,y,w)=>`<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w/6}" fill="url(#g${id})"/>`;
  if(type==='lolli')return `<svg viewBox="0 0 140 180">${D}${ground(70,172,40)}${stick(70,90,168)}<circle cx="70" cy="64" r="54" fill="url(#b${id})"/>
  <g opacity=".85" filter="url(#f${id})"><path d="M70 64m-40 0a40 40 0 0 1 40-40a28 28 0 0 1 28 28a17 17 0 0 1-17 17a9 9 0 0 1-9-9" fill="none" stroke="${c2}" stroke-width="11" stroke-linecap="round"/></g>
  <circle cx="70" cy="64" r="54" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>${spec(48,38,16,9)}${spec(96,92,6,3,-40)}</svg>`;
  if(type==='bomb')return `<svg viewBox="0 0 140 180">${D}${ground(70,172,44)}${stick(70,100,168)}<circle cx="70" cy="66" r="58" fill="url(#b${id})"/>
  <path d="M20 80q50 30 100 0" stroke="${c3}" stroke-opacity=".35" stroke-width="10" fill="none" filter="url(#f${id})"/>
  <text x="70" y="76" text-anchor="middle" font-family="Anuphan,sans-serif" font-weight="800" font-size="28" fill="#fff" stroke="${shade(c1,-.5)}" stroke-width="1" paint-order="stroke">BIG</text>${spec(46,36,18,10)}${spec(100,98,7,3,-40)}</svg>`;
  if(type==='emoji')return `<svg viewBox="0 0 140 180">${D}${ground(70,172,40)}${stick(70,100,168)}<circle cx="70" cy="64" r="54" fill="url(#b${id})"/>
  <ellipse cx="52" cy="56" rx="7" ry="9" fill="${c3}"/><ellipse cx="88" cy="56" rx="7" ry="9" fill="${c3}"/><circle cx="54" cy="53" r="2.4" fill="#fff"/><circle cx="90" cy="53" r="2.4" fill="#fff"/>
  <path d="M46 78q24 26 48 0" stroke="${c3}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="76" rx="9" ry="6" fill="${c2}" opacity=".55"/><ellipse cx="102" cy="76" rx="9" ry="6" fill="${c2}" opacity=".55"/>${spec(48,32,16,8)}</svg>`;
  if(type==='candy'){const w=`<linearGradient id="w${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c2,.4)}"/><stop offset="1" stop-color="${shade(c2,-.35)}"/></linearGradient>`;
  return `<svg viewBox="0 0 180 130">${D.replace('</defs>',w+'</defs>')}${ground(90,120,60)}<path d="M46 60 8 32q-4 28 0 56z" fill="url(#w${id})"/><path d="M134 60l38-28q4 28 0 56z" fill="url(#w${id})"/>
  <path d="M46 60 8 32M46 60 8 88M134 60l38-28M134 60l38 28" stroke="${shade(c2,-.4)}" stroke-opacity=".4"/>
  <ellipse cx="90" cy="60" rx="50" ry="40" fill="url(#b${id})"/><path d="M56 36q34 46 68 0M56 84q34-46 68 0" stroke="${c3}" stroke-opacity=".75" stroke-width="7" fill="none"/>${spec(70,36,16,7,-15)}</svg>`}
  if(type==='sour')return `<svg viewBox="0 0 150 150">${D}${ground(75,140,58)}${[[48,52,c1],[98,46,c2],[72,92,c3],[34,100,c2],[112,98,c1]].map(([x,y,c],k)=>{const g=`q${id}_${k}`;return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c,.45)}"/><stop offset="1" stop-color="${shade(c,-.35)}"/></linearGradient></defs><g transform="rotate(${(x*7)%40-20} ${x} ${y})"><rect x="${x-22}" y="${y-18}" width="44" height="40" rx="12" fill="${shade(c,-.45)}"/><rect x="${x-22}" y="${y-22}" width="44" height="40" rx="12" fill="url(#${g})"/>${[[-8,-10],[6,-4],[-2,6],[10,8],[-12,4]].map(([a,b])=>`<circle cx="${x+a}" cy="${y+b}" r="1.8" fill="#fff" opacity=".9"/>`).join('')}<ellipse cx="${x-8}" cy="${y-15}" rx="9" ry="3" fill="#fff" opacity=".55"/></g>`}).join('')}</svg>`;
  /* box */
  return `<svg viewBox="0 0 160 160">${D}${ground(80,150,62)}<path d="M20 52 80 30l60 22v70l-60 24-60-24z" fill="${shade(c1,-.35)}"/><path d="M20 52l60 22v72l-60-24z" fill="url(#b${id})"/><path d="M80 74l60-22v70l-60 24z" fill="${shade(c1,-.2)}"/><path d="M20 52 80 30l60 22-60 22z" fill="${shade(c1,.35)}"/>
  <path d="M50 41l60 22v14l-10 4V67L40 45z" fill="${c3}" opacity=".9"/><text x="48" y="112" font-family="Anuphan,sans-serif" font-weight="800" font-size="20" fill="#fff" transform="skewY(20) translate(0,-40)">JSB</text></svg>`;
}
/* 3D icons */
function ico(n){const id=++_u;const g=(c)=>`<defs><linearGradient id="i${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c,.35)}"/><stop offset="1" stop-color="${shade(c,-.25)}"/></linearGradient><radialGradient id="g${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="108" rx="40" ry="6" fill="url(#g${id})"/>`;
  const R='#e5172f',F=`url(#i${id})`;
  const m={
  factory:`${g(R)}<path d="M14 100V54l22 14V54l22 14V40h14v-14h10v14h14v60z" fill="${shade(R,-.35)}" transform="translate(3 3)"/><path d="M14 100V54l22 14V54l22 14V40h14v-14h10v14h14v60z" fill="${F}"/><rect x="24" y="78" width="12" height="12" rx="2" fill="#fff"/><rect x="46" y="78" width="12" height="12" rx="2" fill="#fff"/><rect x="68" y="78" width="12" height="12" rx="2" fill="#fff"/><rect x="72" y="20" width="10" height="6" rx="3" fill="#ccc"/>`,
  truck:`${g(R)}<rect x="8" y="34" width="62" height="50" rx="6" fill="${F}"/><path d="M70 50h22l16 18v16H70z" fill="${shade(R,-.25)}"/><path d="M76 56h14l10 12H76z" fill="#cfe6ff"/><rect x="8" y="34" width="62" height="10" rx="5" fill="#fff" opacity=".25"/><circle cx="30" cy="88" r="11" fill="#333"/><circle cx="30" cy="88" r="5" fill="#ddd"/><circle cx="88" cy="88" r="11" fill="#333"/><circle cx="88" cy="88" r="5" fill="#ddd"/><path d="M18 52h30M18 62h22" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  shield:`${g('#2bb39a')}<path d="M60 12l38 14v30c0 26-18 42-38 50C40 98 22 82 22 56V26z" fill="${shade('#2bb39a',-.35)}" transform="translate(3 3)"/><path d="M60 12l38 14v30c0 26-18 42-38 50C40 98 22 82 22 56V26z" fill="${F}"/><path d="M42 56l12 12 24-26" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 18l30 11v8L60 26z" fill="#fff" opacity=".3"/>`,
  box:`${g('#f2a541')}<path d="M16 40 60 22l44 18v52l-44 18-44-18z" fill="${shade('#f2a541',-.35)}"/><path d="M16 40l44 18v52L16 92z" fill="${F}"/><path d="M60 58l44-18v52l-44 18z" fill="${shade('#f2a541',-.15)}"/><path d="M16 40 60 22l44 18-44 18z" fill="${shade('#f2a541',.35)}"/><path d="M38 31l44 18v14l-8 3V52L30 34z" fill="${R}"/>`,
  cart:`${g(R)}<path d="M10 22h16l12 52h56l10-38H34" fill="none" stroke="${shade(R,-.3)}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="M36 36h68l-10 38H44z" fill="${F}"/><path d="M40 46h58M44 58h48" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><circle cx="46" cy="92" r="8" fill="#333"/><circle cx="88" cy="92" r="8" fill="#333"/>`,
  card:`${g('#5b6cff')}<rect x="14" y="30" width="86" height="58" rx="10" fill="${shade('#5b6cff',-.4)}" transform="translate(4 4)"/><rect x="14" y="30" width="86" height="58" rx="10" fill="${F}"/><rect x="14" y="42" width="86" height="12" fill="#1b1b3a"/><rect x="24" y="64" width="18" height="12" rx="3" fill="#ffd36b"/><path d="M52 72h34" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/>`,
  home:`${g(R)}<path d="M20 58 60 24l40 34v42H20z" fill="#fff"/><path d="M20 58 60 24l40 34" fill="none" stroke="${F}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><path d="M20 58v42h80V58" fill="none" stroke="#e8dcdc" stroke-width="2"/><rect x="50" y="70" width="20" height="30" rx="3" fill="${R}"/><rect x="28" y="66" width="14" height="14" rx="2" fill="#cfe6ff"/><rect x="78" y="66" width="14" height="14" rx="2" fill="#cfe6ff"/>`,
  };return `<svg viewBox="0 0 120 116">${m[n]}</svg>`}

const CATS=[
  {id:'all',name:'ทั้งหมด',sub:'สินค้าทุกชนิด',ic:'🍬',bg:'#fde2ee'},
  {id:'lolli',name:'อมยิ้ม',sub:'Lollipop',ic:'🍭',bg:'#e9e0fb'},
  {id:'candy',name:'ลูกอม',sub:'Candy',ic:'🍬',bg:'#fff1cc'},
  {id:'sour',name:'ลูกอมเปรี้ยว',sub:'Sour Candy',ic:'🍋',bg:'#d6f3ec'},
  {id:'box',name:'ยกลัง / ขายส่ง',sub:'Wholesale',ic:'📦',bg:'#ffe2d4'},
];
const P=[
  {id:1,cat:'lolli',art:'bomb',c:['#e8317a','#ff9ac1','#7b4fd6'],name:'Big Bomb อมยิ้มลูกใหญ่ รสผลไม้รวม',price:89,was:129,rating:4.9,rev:2310,sold:15400,tags:['sale','best'],opts:[['ถุง 10 ไม้',89,1],['ถุง 30 ไม้',239,3],['กล่อง 50 ไม้',369,5]]},
  {id:2,cat:'lolli',art:'emoji',c:['#ffc93c','#ff7a3d','#5a2b1a'],name:'Imoji Candy อมยิ้มหน้ายิ้ม',price:69,was:89,rating:4.8,rev:1280,sold:9800,tags:['best'],opts:[['ถุง 10 ไม้',69,1],['ถุง 30 ไม้',189,3]]},
  {id:3,cat:'lolli',art:'lolli',c:['#2bb39a','#fff','#147a68'],name:'อมยิ้มเกลียว รสแอปเปิ้ลเขียว',price:59,was:75,rating:4.7,rev:640,sold:4200,tags:['new'],opts:[['ถุง 20 ไม้',59,1],['ถุง 50 ไม้',139,2.5]]},
  {id:4,cat:'lolli',art:'lolli',c:['#7b4fd6','#ffc93c','#4a2aa0'],name:'อมยิ้มเกลียว รสองุ่นเคียวโฮ',price:59,was:75,rating:4.8,rev:530,sold:3900,tags:[],opts:[['ถุง 20 ไม้',59,1],['ถุง 50 ไม้',139,2.5]]},
  {id:5,cat:'candy',art:'candy',c:['#e8317a','#ffc93c','#fff'],name:'ลูกอมรสสตรอว์เบอร์รี่ครีม',price:45,was:59,rating:4.7,rev:880,sold:6100,tags:['sale'],opts:[['ถุง 100 กรัม',45,1],['ถุง 500 กรัม',189,5]]},
  {id:6,cat:'candy',art:'candy',c:['#ff7a3d','#2bb39a','#fff'],name:'ลูกอมรสส้มมิกซ์ฟรุต',price:45,was:null,rating:4.6,rev:410,sold:2800,tags:[],opts:[['ถุง 100 กรัม',45,1],['ถุง 500 กรัม',189,5]]},
  {id:7,cat:'sour',art:'sour',c:['#ffc93c','#2bb39a','#e8317a'],name:'Sour Candy ลูกอมเปรี้ยวจี๊ด รวมรส',price:55,was:79,rating:4.9,rev:1720,sold:11200,tags:['sale','best'],opts:[['ถุง 120 กรัม',55,1],['ถุง 500 กรัม',199,4]]},
  {id:8,cat:'sour',art:'sour',c:['#a5e05a','#ffe14d','#6dc23b'],name:'Sour Lemon มะนาวเปรี้ยวซ่า',price:49,was:null,rating:4.6,rev:290,sold:1900,tags:['new'],opts:[['ถุง 120 กรัม',49,1],['ถุง 500 กรัม',179,4]]},
  {id:9,cat:'box',art:'box',c:['#e8317a','#c21d62','#ffc93c'],name:'Big Bomb ยกลัง 12 กล่อง (600 ไม้)',price:3590,was:4428,rating:5.0,rev:186,sold:820,tags:['sale'],opts:[['1 ลัง',3590,1],['3 ลัง',10290,3]]},
  {id:10,cat:'box',art:'box',c:['#7b4fd6','#4a2aa0','#2bb39a'],name:'อมยิ้มเกลียว ยกลัง คละรส 1,000 ไม้',price:2390,was:2990,rating:4.9,rev:124,sold:560,tags:[],opts:[['1 ลัง',2390,1],['3 ลัง',6890,3]]},
  {id:11,cat:'candy',art:'candy',c:['#ffffff','#e8317a','#e8317a'],name:'ลูกอมมิ้นต์เย็นซ่า ไร้น้ำตาล',price:65,was:null,rating:4.5,rev:150,sold:900,tags:['new'],opts:[['ถุง 100 กรัม',65,1]]},
  {id:12,cat:'sour',art:'sour',c:['#ff5c8a','#7b4fd6','#ffc93c'],name:'Sour Berry เบอร์รี่เปรี้ยวหวาน',price:55,was:69,rating:4.7,rev:340,sold:2300,tags:[],opts:[['ถุง 120 กรัม',55,1],['ถุง 500 กรัม',199,4]]},
];
const BUNDLES=[
  {name:'แพ็กลองชิม',price:199,was:276,items:['Big Bomb 10 ไม้','Imoji Candy 10 ไม้','Sour Candy 1 ถุง','ลูกอมสตรอว์เบอร์รี่ 1 ถุง'],ids:[1,2,7,5]},
  {name:'แพ็กปาร์ตี้',price:590,was:860,hot:true,items:['Big Bomb 30 ไม้','Imoji Candy 30 ไม้','อมยิ้มเกลียว 50 ไม้','Sour Candy 500 กรัม','ส่งฟรีทันที'],ids:[1,2,3,7]},
  {name:'แพ็กร้านค้า',price:1990,was:2780,items:['คละสินค้าขายดี 8 รายการ','จำนวนรวม ~800 ชิ้น','ฟรีชั้นวางโชว์สินค้า','กำไรต่อชิ้นสูงสุด 40%'],ids:[1,2,3,4,5,6,7,8]},
];
const COUPONS={JSBNEW:{t:'pct',v:10,d:'ลด 10% ลูกค้าใหม่'},SWEET50:{t:'amt',v:50,d:'ลด ฿50 เมื่อซื้อครบ 300',min:300}};

const PAGE=document.body.dataset.page||'home';const QS=new URLSearchParams(location.search);
let cart=store.get('jsb-cart',[]),favs=store.get('jsb-favs',[]),coupon=store.get('jsb-coupon',null),cat=QS.get('cat')||'all',tag=QS.get('tag')||'all',sortBy='pop',query=(QS.get('q')||'').toLowerCase();
const tint=c=>`linear-gradient(145deg,${c}22,${c}44)`;

function renderCats(){if(!$('#cats'))return;$('#cats').innerHTML=CATS.map(c=>`<button class="cat ${cat===c.id?'on':''}" data-cat="${c.id}"><div class="ic" style="background:${c.bg}">${c.ic}</div><b>${c.name}</b><span>${c.sub} · ${c.id==='all'?P.length:P.filter(p=>p.cat===c.id).length} รายการ</span></button>`).join('')}
function renderFilters(){if(!$('#filters'))return;$('#filters').innerHTML=[['all','ทั้งหมด'],['sale','ลดราคา'],['best','ขายดี'],['new','มาใหม่']].map(([k,l])=>`<button class="fbtn ${tag===k?'on':''}" data-tag="${k}">${l}</button>`).join('')}
const TAGL={sale:['t-sale',p=>'-'+Math.round((1-p.price/p.was)*100)+'%'],new:['t-new',()=>'ใหม่'],best:['t-best',()=>'ขายดี']};
function cardHTML(p){
  const pu=p.opts.at(-1),per=pu[1]/pu[2];
  return `<article class="card"><div class="thumb" style="--tint:${p.c[0]}33" data-view="${p.id}">${art(p.art,...p.c)}<div class="tags">${p.tags.map(t=>`<span class="tag ${TAGL[t][0]}">${TAGL[t][1](p)}</span>`).join('')}</div></div>
  <button class="fav ${favs.includes(p.id)?'on':''}" data-fav="${p.id}" aria-label="ถูกใจ"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
  <div class="body"><div class="meta"><span>${CATS.find(c=>c.id===p.cat).name}</span><span>ขายแล้ว ${p.sold>=1000?(p.sold/1000).toFixed(1)+'k':p.sold}</span></div>
  <h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="stars">★ ${p.rating.toFixed(1)} <span>(${p.rev.toLocaleString()})</span></div>
  <div class="price"><b>${baht(p.price)}</b>${p.was?`<s>${baht(p.was)}</s>`:''}</div>
  ${p.opts.length>1?`<div class="unit">💡 ซื้อแพ็กใหญ่ เหลือ ${baht(per)}/หน่วย</div>`:'<div class="unit">&nbsp;</div>'}
  <button class="add" data-add="${p.id}">+ ใส่ตะกร้า</button></div></article>`;
}
function renderGrid(){if(!$('#grid'))return;
  let l=P.filter(p=>(cat==='all'||p.cat===cat)&&(tag==='all'||p.tags.includes(tag))&&(!query||p.name.toLowerCase().includes(query))&&(!window.extraFilter||extraFilter(p)));
  const s={pop:(a,b)=>b.sold-a.sold,low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,save:(a,b)=>((b.was||b.price)-b.price)/(b.was||1)-((a.was||a.price)-a.price)/(a.was||1)};
  l.sort(s[sortBy]);if(PAGE==='home')l=l.slice(0,8);if(window.gridLimit)l=l.slice(0,gridLimit);window.onGrid&&onGrid(l.length);
  $('#grid').innerHTML=l.length?l.map(cardHTML).join(''):'<div class="empty">ไม่พบสินค้าที่ค้นหา ลองคำอื่นดูนะ 🍭</div>';
}
function renderBundles(){if(!$('#bundleList'))return;$('#bundleList').innerHTML=BUNDLES.map((b,i)=>`<div class="bundle ${b.hot?'hot':''}">${b.hot?'<span class="ribbon">🔥 คุ้มที่สุด · ขายดีอันดับ 1</span>':''}<h3>${b.name}</h3><div class="bp">${baht(b.price)} <small><s>${baht(b.was)}</s></small></div><div class="save">ประหยัด ${baht(b.was-b.price)} (${Math.round((1-b.price/b.was)*100)}%)</div><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul><button class="btn ${b.hot?'btn-p':'btn-o'}" data-bundle="${i}">ใส่ตะกร้า</button></div>`).join('')}

/* cart */
function calc(){
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tierPct=sub>=3000?12:sub>=2000?8:sub>=1000?5:0;
  const tierDisc=sub*tierPct/100;
  let cp=0,cpMsg='';
  if(coupon&&COUPONS[coupon]){const c=COUPONS[coupon];if(c.min&&sub<c.min)cpMsg=`ต้องซื้อครบ ${baht(c.min)}`;else cp=c.t==='pct'?(sub-tierDisc)*c.v/100:c.v}
  const freeShip=sub>=499||cart.some(i=>i.free);
  const ship=sub===0?0:freeShip?0:45;
  return {sub,tierPct,tierDisc,cp,cpMsg,ship,total:Math.max(0,sub-tierDisc-cp+ship),count:cart.reduce((s,i)=>s+i.qty,0)};
}
function save(){store.set('jsb-cart',cart);store.set('jsb-favs',favs);store.set('jsb-coupon',coupon)}
function renderCart(){
  const c=calc();const n=$('#cartN');n.textContent=c.count;n.classList.remove('bump');void n.offsetWidth;n.classList.add('bump');
  $('#favN').textContent=favs.length;
  const left=499-c.sub;
  const nextTier=[[1000,5],[2000,8],[3000,12]].find(([v])=>c.sub<v);
  $('#shipMsg').innerHTML=c.sub===0?'🛒 ซื้อครบ ฿499 ส่งฟรี!':(left>0&&!cart.some(i=>i.free)?`ซื้ออีก <b>${baht(left)}</b> รับ <b>ส่งฟรี</b> 🚚`:nextTier?`🎉 ส่งฟรีแล้ว! ซื้ออีก <b>${baht(nextTier[0]-c.sub)}</b> รับส่วนลด <b>${nextTier[1]}%</b>`:'🎉 คุณได้รับส่วนลดสูงสุด 12% + ส่งฟรี')+`<div class="bar"><i style="width:${Math.min(100,c.sub/(nextTier&&left<=0?nextTier[0]:499)*100)}%"></i></div>`;
  $('#items').innerHTML=cart.length?cart.map((i,k)=>{const p=P.find(x=>x.id===i.pid)||P[0];return `<div class="it"><div class="th" style="background:${tint(p.c[0])}">${art(p.art,...p.c)}</div><div><h4>${i.name}</h4><span class="hint">${i.opt||''}</span><br><div class="qty"><button data-q="${k}" data-d="-1">−</button><span>${i.qty}</span><button data-q="${k}" data-d="1">+</button></div></div><div style="text-align:right"><b class="price" style="padding:0;font-size:16px">${baht(i.price*i.qty)}</b><button class="rm" data-rm="${k}">ลบ</button></div></div>`}).join(''):'<div class="empty">ตะกร้ายังว่างอยู่ 🍬<br><br><button class="btn btn-p" data-close>เลือกซื้อสินค้า</button></div>';
  $('#sum').innerHTML=cart.length?`<div class="code"><input id="cpIn" placeholder="โค้ดส่วนลด" value="${coupon||''}"><button id="cpBtn">ใช้โค้ด</button></div><span class="hint">ลองใช้ JSBNEW หรือ SWEET50 ${c.cpMsg?'· <b style="color:var(--pink)">'+c.cpMsg+'</b>':''}</span>
  <div class="row"><span>ยอดสินค้า</span><span>${baht(c.sub)}</span></div>
  ${c.tierDisc?`<div class="row" style="color:var(--mint)"><span>ส่วนลดขั้นบันได ${c.tierPct}%</span><span>−${baht(c.tierDisc)}</span></div>`:''}
  ${c.cp?`<div class="row" style="color:var(--mint)"><span>โค้ด ${coupon}</span><span>−${baht(c.cp)}</span></div>`:''}
  <div class="row"><span>ค่าจัดส่ง</span><span>${c.ship?baht(c.ship):'<b style="color:var(--mint)">ฟรี</b>'}</span></div>
  <div class="row tot"><span>ยอดชำระ</span><b>${baht(c.total)}</b></div><button class="btn btn-p" id="checkout">ดำเนินการชำระเงิน →</button>`:'';
  save();window.onCart&&onCart(c);
}
function add(p,opt,qty=1){
  const o=opt||p.opts[0];const key=p.id+'|'+o[0];
  const ex=cart.find(i=>i.key===key);ex?ex.qty+=qty:cart.push({key,pid:p.id,name:p.name,opt:o[0],price:o[1],qty});
  renderCart();toast('✓ เพิ่ม '+p.name.split(' ')[0]+' ลงตะกร้าแล้ว');
}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2000)}
function openDrawer(){$('#drawer').classList.add('on');$('#ov').classList.add('on')}
function closeAll(){['#drawer','#ov','#modal'].forEach(s=>$(s).classList.remove('on'))}
function modal(html){$('#mc').innerHTML=html;$('#modal').classList.add('on');$('#ov').classList.add('on');$('#drawer').classList.remove('on')}

function view(id){
  const p=P.find(x=>x.id===id);let sel=0,qty=1;
  const draw=()=>{const o=p.opts[sel];modal(`<div class="pd"><div class="thumb" style="--tint:${p.c[0]}33">${art(p.art,...p.c)}</div><div class="info">
    <span class="eyebrow">${CATS.find(c=>c.id===p.cat).name}</span><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="stars">★★★★★ ${p.rating} <span>· ${p.rev.toLocaleString()} รีวิว · ขายแล้ว ${p.sold.toLocaleString()}</span></div>
    <div class="price" style="padding:0"><b style="font-size:32px">${baht(o[1])}</b>${sel===0&&p.was?`<s>${baht(p.was)}</s>`:''}</div>
    <div><b>ขนาด</b><div class="opts" style="margin-top:6px">${p.opts.map((x,i)=>`<button class="opt ${i===sel?'on':''}" data-opt="${i}">${x[0]}<small>${baht(x[1]/x[2])}/หน่วย${i>0?' · ประหยัด '+Math.round((1-(x[1]/x[2])/p.opts[0][1])*100)+'%':''}</small></button>`).join('')}</div></div>
    <div style="display:flex;gap:10px;align-items:center"><div class="qty" style="margin:0"><button data-mq="-1">−</button><span>${qty}</span><button data-mq="1">+</button></div><button class="btn btn-p" style="flex:1" data-madd>ใส่ตะกร้า · ${baht(o[1]*qty)}</button></div>
    <a class="hint" style="color:var(--pink);text-decoration:underline" href="product.html?id=${p.id}">ดูรายละเอียดเต็ม →</a><p class="hint">✅ อย. / GMP / ฮาลาล · 🚚 ส่งภายใน 1–3 วัน · 🔄 เปลี่ยนคืนได้ใน 7 วัน</p></div></div>`);
    $('#mc').onclick=e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.opt){sel=+t.dataset.opt;draw()}if(t.dataset.mq){qty=Math.max(1,qty+ +t.dataset.mq);draw()}if('madd' in t.dataset){add(p,p.opts[sel],qty);closeAll()}}};
  draw();
}
function checkout(){
  const c=calc();
  modal(`<form class="co" id="coForm"><h3>ข้อมูลการจัดส่ง</h3><div class="fg"><label>ชื่อ-นามสกุล<input required></label><label>เบอร์โทรศัพท์<input required type="tel" pattern="[0-9\\-\\s]{9,}"></label></div>
  <label>ที่อยู่จัดส่ง<textarea required rows="3" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"></textarea></label>
  <b>วิธีชำระเงิน</b><div class="paym"><label><input type="radio" name="pay" checked>📱 พร้อมเพย์</label><label><input type="radio" name="pay">💳 บัตรเครดิต</label><label><input type="radio" name="pay">💵 เก็บเงินปลายทาง</label></div>
  <div class="row tot"><span>ยอดชำระ (${c.count} ชิ้น)</span><b>${baht(c.total)}</b></div><button class="btn btn-p">ยืนยันคำสั่งซื้อ</button></form>`);
  $('#coForm').onsubmit=e=>{e.preventDefault();const no='JSB'+Date.now().toString().slice(-8);cart=[];coupon=null;renderCart();
    modal(`<div class="ok"><div class="big">🎉</div><h3>สั่งซื้อสำเร็จ!</h3><p>หมายเลขคำสั่งซื้อ <b>${no}</b><br>เราจะจัดส่งภายใน 1–3 วันทำการ ขอบคุณที่อุดหนุน JSB 💖</p><br><button class="btn btn-p" data-close>ช้อปต่อ</button></div>`)};
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-cat],[data-tag],[data-add],[data-fav],[data-view],[data-bundle],[data-q],[data-rm],[data-close],#cartBtn,#cpBtn,#checkout,#ov');if(!t)return;
  const d=t.dataset;
  if(d.cat){if(!$('#grid')||PAGE==='home'){location.href='products.html?cat='+d.cat;return}cat=d.cat;renderCats();renderGrid()}
  else if(d.tag){tag=d.tag;renderFilters();renderGrid()}
  else if(d.add)add(P.find(p=>p.id==d.add));
  else if(d.fav){const id=+d.fav;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];if($('#grid'))renderGrid();renderCart();window.onFav&&onFav()}
  else if(d.view)view(+d.view);
  else if(d.bundle){const b=BUNDLES[d.bundle];cart.push({key:'b'+d.bundle+Date.now(),pid:b.ids[0],name:b.name+' (เซ็ต)',opt:b.items.length+' รายการ',price:b.price,qty:1,free:b.hot});renderCart();toast('✓ เพิ่ม'+b.name+'แล้ว');openDrawer()}
  else if(d.q!==undefined){const i=cart[d.q];i.qty+= +d.d;if(i.qty<1)cart.splice(d.q,1);renderCart()}
  else if(d.rm!==undefined){cart.splice(d.rm,1);renderCart()}
  else if(t.id==='cartBtn')openDrawer();
  else if(t.id==='cpBtn'){const v=t.parentNode.querySelector('input').value.trim().toUpperCase();if(COUPONS[v]){coupon=v;toast('✓ ใช้โค้ด '+v+' แล้ว: '+COUPONS[v].d)}else{coupon=null;toast('โค้ดไม่ถูกต้อง')}renderCart()}
  else if(t.id==='checkout')location.href='checkout.html';
  else closeAll();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});

document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
$('#q').value=QS.get('q')||'';
if(PAGE==='products'){$('#q').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderGrid()});$('.search').addEventListener('submit',e=>e.preventDefault())}
$('#sort')?.addEventListener('change',e=>{sortBy=e.target.value;renderGrid()});
$('#b2bForm')?.addEventListener('submit',e=>{e.preventDefault();e.target.reset();toast('✓ ส่งคำขอแล้ว ทีมขายจะติดต่อกลับภายใน 24 ชม.')});
$('#themeBtn').addEventListener('click',()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark'});
document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href').split('?')[0]===(location.pathname.split('/').pop()||'index.html'))a.classList.add('on')});
if($('#heroArt'))$('#heroArt').insertAdjacentHTML('beforeend',[['box',['#e4041f','#fff','#ffc93c'],'30%','30%',230,0],['bomb',['#ff3d6e','#fff','#a0003a'],'4%','6%',170,.8],['emoji',['#ffc93c','#ff7a3d','#5a2b1a'],'66%','0%',150,1.6],['lolli',['#2bb39a','#fff','#147a68'],'62%','46%',120,.4],['sour',['#ffc93c','#ff5c8a','#7bd14b'],'0%','60%',150,1.2]].map(([a,c,l,t,w,dl])=>`<div class="pop" style="left:${l};top:${t};width:${w}px;animation-delay:${dl}s">${art(a,...c)}</div>`).join('')+[['🍬','46%','-4%',0],['🚚','92%','30%',1],['🎁','-4%','40%',2]].map(([e,l,t,d])=>`<div class="bub" style="left:${l};top:${t};animation-delay:${d}s">${e}</div>`).join(''));
function hydrateIcons(){document.querySelectorAll('[data-ico]:empty').forEach(el=>el.innerHTML=ico(el.dataset.ico))}
function tick(){if(!$('#th'))return;const n=new Date(),e=new Date(n);e.setHours(24,0,0,0);let s=Math.floor((e-n)/1000);const pad=x=>String(x).padStart(2,'0');$('#th').textContent=pad(Math.floor(s/3600));$('#tm').textContent=pad(Math.floor(s%3600/60));$('#ts').textContent=pad(s%60)}
tick();setInterval(tick,1000);
$('#qr').innerHTML=Array.from({length:81},(_,i)=>{const x=i%9,y=i/9|0,f=(x<3&&y<3)||(x>5&&y<3)||(x<3&&y>5);return `<i class="${f?((x%2|y%2)&&!(x==1&&y==1)&&!(x==7&&y==1)&&!(x==1&&y==7)&&!((x==1||x==7)&&(y==1||y==7))?'w':''):((x*7+y*13)%3?'':'w')}"></i>`}).join('');
