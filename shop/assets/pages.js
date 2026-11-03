/* ===== Page-specific logic (runs after app.js) ===== */
const findP=id=>P.find(p=>p.id==id);
const catName=id=>(CATS.find(c=>c.id===id)||{}).name||'';
const thumb=(p,cls='th')=>`<div class="${cls}" style="--tint:${p.c[0]}33">${art(p.art,...p.c)}</div>`;
const orders=()=>store.get('jsb-orders',[]);
const user=()=>store.get('jsb-user',null);

/* ---------- products ---------- */
if(PAGE==='products'){
  let maxPrice=4000;
  window.extraFilter=p=>p.price<=maxPrice;
  window.onGrid=n=>{$('#count').textContent=`พบสินค้า ${n} รายการ`;$('#ttl').textContent=cat==='all'?'สินค้าทั้งหมด':catName(cat)};
  const side=()=>{$('#side').innerHTML=`<h4>หมวดหมู่</h4>${CATS.map(c=>`<button class="lnk ${cat===c.id?'on':''}" data-scat="${c.id}"><span>${c.ic} ${c.name}</span><span>${c.id==='all'?P.length:P.filter(p=>p.cat===c.id).length}</span></button>`).join('')}
    <h4>ราคาไม่เกิน <span class="hl" id="pv">${baht(maxPrice)}</span></h4><input type="range" id="pr" min="50" max="4000" step="50" value="${maxPrice}">
    <h4>ประเภท</h4>${[['all','ทั้งหมด'],['sale','🔥 ลดราคา'],['best','⭐ ขายดี'],['new','✨ มาใหม่']].map(([k,l])=>`<button class="lnk ${tag===k?'on':''}" data-stag="${k}">${l}</button>`).join('')}`;
    $('#pr').oninput=e=>{maxPrice=+e.target.value;$('#pv').textContent=baht(maxPrice);renderGrid()}};
  $('#side').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.scat)cat=b.dataset.scat;if(b.dataset.stag)tag=b.dataset.stag;side();renderGrid();history.replaceState(null,'',`?cat=${cat}&tag=${tag}`)});
  side();
}

/* ---------- product detail ---------- */
if(PAGE==='product'){
  const p=findP(QS.get('id'))||P[0];let sel=0,qty=1,tab='d';
  document.title=p.name+' | JSB Shop';
  const variants=[p.c,[shade(p.c[0],.25),p.c[1],p.c[2]],[shade(p.c[0],-.2),p.c[1],p.c[2]],[p.c[2].length===7?p.c[2]:p.c[0],p.c[1],p.c[0]]];
  let vi=0;
  const draw=()=>{const o=p.opts[sel];$('#pdp').innerHTML=`
  <div><div class="gal-main" style="--tint:${variants[vi][0]}44">${art(p.art,...variants[vi])}</div>
    <div class="gal-th">${variants.map((v,i)=>`<button class="${i===vi?'on':''}" data-vi="${i}">${art(p.art,...v)}</button>`).join('')}</div></div>
  <div style="display:grid;gap:14px">
    <div class="crumb"><a href="index.html">หน้าแรก</a> / <a href="products.html?cat=${p.cat}">${catName(p.cat)}</a></div>
    <div class="tags" style="position:static;flex-direction:row">${p.tags.map(t=>`<span class="tag ${TAGL[t][0]}">${TAGL[t][1](p)}</span>`).join('')}</div>
    <h1>${p.name}</h1>
    <div class="stars">★★★★★ ${p.rating} <span>· ${p.rev.toLocaleString()} รีวิว · ขายแล้ว ${p.sold.toLocaleString()} ชิ้น</span></div>
    <div class="bigp">${baht(o[1]*qty)}${sel===0&&p.was?`<s>${baht(p.was*qty)}</s>`:''}</div>
    <div><b>เลือกขนาด</b><div class="opts" style="margin-top:8px">${p.opts.map((x,i)=>`<button class="opt ${i===sel?'on':''}" data-opt="${i}">${x[0]} · ${baht(x[1])}<small>${baht(x[1]/x[2])}/หน่วย${i>0?' · ประหยัด '+Math.round((1-(x[1]/x[2])/p.opts[0][1])*100)+'%':''}</small></button>`).join('')}</div></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div class="qty" style="margin:0"><button data-pq="-1">−</button><span>${qty}</span><button data-pq="1">+</button></div>
      <button class="btn btn-p" style="flex:1" data-padd>ใส่ตะกร้า</button><button class="btn btn-dark" style="flex:1" data-pbuy>ซื้อเลย</button>
      <button class="ibtn ${favs.includes(p.id)?'on':''}" data-fav="${p.id}" aria-label="ถูกใจ" style="box-shadow:var(--sh2)">${favs.includes(p.id)?'💖':'🤍'}</button></div>
    <div class="perks"><div>🚚<br>ส่งฟรีเมื่อครบ ฿499</div><div>✅<br>อย. / GMP / ฮาลาล</div><div>🔄<br>เปลี่ยนคืนใน 7 วัน</div></div>
  </div>`;
  $('#ptabs').innerHTML=`<div class="tabs">${[['d','รายละเอียดสินค้า'],['s','ข้อมูลโภชนาการ'],['r',`รีวิว (${p.rev.toLocaleString()})`]].map(([k,l])=>`<button class="${tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('')}</div>
   <div>${tab==='d'?`<p style="font-size:18px">${p.name} ผลิตโดย JSB Candy ด้วยวัตถุดิบคุณภาพ หวานกำลังดี สีสันสดใส เหมาะสำหรับทุกวัย ทั้งทานเอง แจกในงานปาร์ตี้ งานวันเด็ก หรือวางขายในร้านค้า บรรจุในซองปิดสนิทเพื่อคงความสดใหม่</p>`
    :tab==='s'?`<table class="spec"><tr><td>หมวดหมู่</td><td>${catName(p.cat)}</td></tr><tr><td>ขนาดบรรจุ</td><td>${p.opts.map(o=>o[0]).join(' / ')}</td></tr><tr><td>อายุสินค้า</td><td>18 เดือนนับจากวันผลิต</td></tr><tr><td>การเก็บรักษา</td><td>เก็บในที่แห้งและเย็น หลีกเลี่ยงแสงแดด</td></tr><tr><td>มาตรฐาน</td><td>อย. / GMP / ฮาลาล</td></tr><tr><td>พลังงาน (ต่อ 1 ชิ้น)</td><td>ประมาณ 25 กิโลแคลอรี</td></tr></table>`
    :['คุณแพร|ลูกชอบมาก สีสวย ส่งไวค่ะ','คุณต้น|คุ้มราคามาก ซื้อแพ็กใหญ่ถูกกว่าเยอะ','ร้านสมใจ|ลูกค้าในร้านถามหาทุกวัน สั่งซ้ำแน่นอน'].map(r=>{const[a,b]=r.split('|');return `<div class="rvw"><div class="stars">★★★★★</div><b>${a}</b><p>${b}</p></div>`}).join('')}</div>`};
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
    if(d.vi){vi=+d.vi;draw()}if(d.opt&&b.closest('#pdp')){sel=+d.opt;draw()}if(d.pq){qty=Math.max(1,qty+ +d.pq);draw()}if(d.tab){tab=d.tab;draw()}
    if('padd' in d)add(p,p.opts[sel],qty);if('pbuy' in d){add(p,p.opts[sel],qty);location.href='checkout.html'}});
  window.onFav=draw;
  cat=p.cat;window.extraFilter=x=>x.id!==p.id;window.gridLimit=4;
  draw();
}

/* ---------- cart page ---------- */
if(PAGE==='cart'){
  window.onCart=c=>{
    $('#cartPage').innerHTML=cart.length?`<div class="two-r"><div class="panel"><h3>สินค้าในตะกร้า (${c.count} ชิ้น)</h3><table class="ctable"><thead><tr><th>สินค้า</th><th>ราคา</th><th>จำนวน</th><th>รวม</th><th></th></tr></thead><tbody>
      ${cart.map((i,k)=>{const p=findP(i.pid)||P[0];return `<tr><td class="pc"><div class="pcell">${thumb(p)}<div><b>${i.name}</b><br><span class="hint">${i.opt||''}</span></div></div></td><td>${baht(i.price)}</td><td><div class="qty"><button data-q="${k}" data-d="-1">−</button><span>${i.qty}</span><button data-q="${k}" data-d="1">+</button></div></td><td><b class="hl">${baht(i.price*i.qty)}</b></td><td><button class="rm" data-rm="${k}">ลบ</button></td></tr>`}).join('')}</tbody></table>
      <a href="products.html" class="btn btn-o" style="margin-top:18px">← เลือกซื้อสินค้าต่อ</a></div>
      <div class="panel sticky"><h3>สรุปคำสั่งซื้อ</h3><div class="df" style="padding:0;border:0">${$('#sum').innerHTML}</div></div></div>`
    :`<div class="panel" style="text-align:center;padding:60px 20px"><div style="font-size:70px">🛒</div><h3>ตะกร้ายังว่างอยู่</h3><p class="hint" style="font-size:16px">เลือกขนมอร่อยๆ ใส่ตะกร้ากันเลย</p><br><a href="products.html" class="btn btn-p">เลือกซื้อสินค้า</a></div>`;
    const sh=$('#shipMsg');if(sh&&$('#cartShip'))$('#cartShip').innerHTML=sh.innerHTML;
  };
  tag='best';window.gridLimit=4;
}

/* ---------- checkout ---------- */
if(PAGE==='checkout'){
  let shipFee=null;
  window.onCart=c=>{
    if(!cart.length){$('#coWrap').innerHTML=`<div class="panel" style="text-align:center;padding:60px 20px"><div style="font-size:70px">🛒</div><h3>ยังไม่มีสินค้าในตะกร้า</h3><br><a href="products.html" class="btn btn-p">เลือกซื้อสินค้า</a></div>`;return}
    const exp=$('input[name=ship]:checked')?.value==='exp';const ship=c.ship+(exp?40:0);const total=c.total+(exp?40:0);
    $('#coSum').innerHTML=cart.map(i=>{const p=findP(i.pid)||P[0];return `<div class="mini">${thumb(p)}<div class="n">${i.name}<br><span class="hint">${i.opt} × ${i.qty}</span></div><b>${baht(i.price*i.qty)}</b></div>`}).join('')+
      `<div class="df" style="padding:14px 0 0;border:0"><div class="row"><span>ยอดสินค้า</span><span>${baht(c.sub)}</span></div>${c.tierDisc?`<div class="row" style="color:var(--mint)"><span>ส่วนลดขั้นบันได ${c.tierPct}%</span><span>−${baht(c.tierDisc)}</span></div>`:''}${c.cp?`<div class="row" style="color:var(--mint)"><span>โค้ด ${coupon}</span><span>−${baht(c.cp)}</span></div>`:''}<div class="row"><span>ค่าจัดส่ง${exp?' (ด่วน)':''}</span><span>${ship?baht(ship):'<b style="color:var(--mint)">ฟรี</b>'}</span></div><div class="row tot"><span>ยอดชำระ</span><b>${baht(total)}</b></div></div>`;
    $('#ppAmt')&&($('#ppAmt').textContent=baht(total));
    window._total=total;
  };
  const u=user();if(u){$('#coName').value=u.name||'';$('#coPhone').value=u.phone||'';$('#coEmail').value=u.email||''}
  document.addEventListener('change',e=>{if(e.target.name==='ship')renderCart();if(e.target.name==='pay'){$('#ppqr').style.display=e.target.value==='pp'?'block':'none';$('#ccf').style.display=e.target.value==='cc'?'grid':'none'}});
  $('#ppqr').insertAdjacentHTML('afterbegin',`<div class="qr" style="width:170px"><div class="code">${$('#qr')?.innerHTML||''}</div></div>`);
  $('#coForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
    const no='JSB'+Date.now().toString().slice(-8);
    const o={no,date:new Date().toISOString(),items:cart.map(i=>({...i})),total:window._total,name:f.get('name'),phone:f.get('phone'),addr:[f.get('addr'),f.get('district'),f.get('province'),f.get('zip')].join(' '),pay:f.get('pay'),ship:f.get('ship')};
    store.set('jsb-orders',[o,...orders()]);cart=[];coupon=null;save();location.href='order.html?no='+no+'&new=1'});
}

/* ---------- order success / tracking ---------- */
if(PAGE==='order'){
  const show=no=>{const o=orders().find(x=>x.no===no.toUpperCase().trim());
    if(!o){$('#oRes').innerHTML=`<div class="panel" style="text-align:center"><div style="font-size:54px">🔍</div><h3>ไม่พบคำสั่งซื้อ ${no}</h3><p class="hint">กรุณาตรวจสอบหมายเลขอีกครั้ง</p></div>`;return}
    const h=(Date.now()-new Date(o.date))/36e5,stage=h>48?4:h>24?3:h>2?2:1;
    const steps=[['🧾','ได้รับคำสั่งซื้อ','ระบบได้รับคำสั่งซื้อของคุณแล้ว'],['💳','ยืนยันการชำระเงิน',o.pay==='cod'?'เก็บเงินปลายทาง':'ชำระเงินเรียบร้อย'],['📦','กำลังแพ็กสินค้า','โรงงานกำลังจัดเตรียมสินค้า'],['🚚','อยู่ระหว่างจัดส่ง','เลขพัสดุ TH'+o.no.slice(3)],['🏠','จัดส่งสำเร็จ','ผู้รับได้รับสินค้าแล้ว']];
    $('#oRes').innerHTML=`<div class="two-r"><div class="panel"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h3>คำสั่งซื้อ ${o.no}</h3><span class="st">${steps[Math.min(stage,4)][1]}</span></div><p class="hint">สั่งซื้อเมื่อ ${new Date(o.date).toLocaleString('th-TH')}</p>
      <div class="timeline">${steps.map((s,i)=>`<div class="tl ${i<=stage?'done':''}"><i>${s[0]}</i><div><b>${s[1]}</b><span>${s[2]}</span></div></div>`).join('')}</div></div>
      <div class="panel"><h3>รายการสินค้า</h3>${o.items.map(i=>{const p=findP(i.pid)||P[0];return `<div class="mini">${thumb(p)}<div class="n">${i.name}<br><span class="hint">${i.opt} × ${i.qty}</span></div><b>${baht(i.price*i.qty)}</b></div>`}).join('')}
      <div class="row tot" style="margin-top:12px"><span>ยอดชำระ</span><b>${baht(o.total)}</b></div><p class="hint" style="margin-top:12px">📍 ${o.name} · ${o.phone}<br>${o.addr}</p></div></div>`};
  const no=QS.get('no');
  if(QS.get('new')){$('#oHero').innerHTML=`<div class="okbig">✓</div><h1>สั่งซื้อสำเร็จ!</h1><p>ขอบคุณที่อุดหนุน JSB 💖 หมายเลขคำสั่งซื้อของคุณคือ <b class="hl">${no}</b></p>`}
  if(no){$('#oNo').value=no;show(no)}
  $('#oForm').addEventListener('submit',e=>{e.preventDefault();show($('#oNo').value)});
}

/* ---------- login / register ---------- */
if(PAGE==='login'){
  let mode=location.hash==='#register'?'reg':'login';
  const draw=()=>{$('#authF').innerHTML=`<div class="tabs">${[['login','เข้าสู่ระบบ'],['reg','สมัครสมาชิก']].map(([k,l])=>`<button type="button" class="${mode===k?'on':''}" data-mode="${k}">${l}</button>`).join('')}</div>
    <div class="soc"><button type="button" style="color:#06c755">LINE</button><button type="button" style="color:#1877f2">Facebook</button></div><div class="or">หรือ</div>
    ${mode==='reg'?'<label>ชื่อ-นามสกุล<input name="name" required></label><label>เบอร์โทรศัพท์<input name="phone" type="tel" required></label>':''}
    <label>อีเมล<input name="email" type="email" required></label><label>รหัสผ่าน<input name="pw" type="password" minlength="6" required></label>
    ${mode==='login'?'<div style="display:flex;justify-content:space-between;font-size:14px"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" style="padding:0"> จดจำฉัน</label><a class="hl">ลืมรหัสผ่าน?</a></div>':'<p class="hint">🎁 สมัครวันนี้รับโค้ด JSBNEW ลด 10% ทันที</p>'}
    <button class="btn btn-p">${mode==='login'?'เข้าสู่ระบบ':'สมัครสมาชิก'}</button>`};
  $('#authF').addEventListener('click',e=>{const m=e.target.dataset.mode;if(m){mode=m;draw()}if(e.target.closest('.soc button')){store.set('jsb-user',{name:'ลูกค้า JSB',email:'member@jsb.shop'});location.href='account.html'}});
  $('#authF').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);store.set('jsb-user',{name:f.get('name')||f.get('email').split('@')[0],email:f.get('email'),phone:f.get('phone')||''});location.href='account.html'});
  draw();
}

/* ---------- account ---------- */
if(PAGE==='account'){
  const u=user();
  if(!u){$('#acc').innerHTML=`<div class="panel" style="text-align:center;padding:60px 20px;max-width:560px;margin:0 auto"><div style="font-size:64px">👤</div><h3>กรุณาเข้าสู่ระบบ</h3><p class="hint" style="font-size:16px">เข้าสู่ระบบเพื่อดูคำสั่งซื้อ รายการโปรด และคูปองของคุณ</p><br><a href="login.html" class="btn btn-p">เข้าสู่ระบบ</a> <a href="login.html#register" class="btn btn-o">สมัครสมาชิก</a></div>`}
  else{
    let tabA=(location.hash||'#orders').slice(1);
    const pane=()=>{const os=orders();
      const html={orders:`<h3>คำสั่งซื้อของฉัน</h3>${os.length?os.map(o=>`<div class="ocard"><div class="top"><b>${o.no}</b><span class="st ${(Date.now()-new Date(o.date))/36e5>48?'g':''}">${(Date.now()-new Date(o.date))/36e5>48?'จัดส่งสำเร็จ':'กำลังดำเนินการ'}</span></div><div class="hint">${new Date(o.date).toLocaleDateString('th-TH')} · ${o.items.length} รายการ</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><b class="hl">${baht(o.total)}</b><a class="btn btn-o" style="padding:8px 18px;font-size:15px" href="order.html?no=${o.no}">ติดตามพัสดุ</a></div></div>`).join(''):'<p class="hint" style="font-size:16px">ยังไม่มีคำสั่งซื้อ <a class="hl" href="products.html">เริ่มช้อปเลย →</a></p>'}`,
      fav:`<h3>รายการโปรด (${favs.length})</h3>${favs.length?`<div class="grid g3">${favs.map(id=>cardHTML(findP(id))).join('')}</div>`:'<p class="hint" style="font-size:16px">ยังไม่มีสินค้าที่ถูกใจ กด 🤍 ที่สินค้าเพื่อบันทึกไว้</p>'}`,
      addr:`<h3>ที่อยู่จัดส่ง</h3><form class="form" id="addrF"><label>ชื่อผู้รับ<input value="${u.name}"></label><label>เบอร์โทร<input value="${u.phone||''}"></label><label>ที่อยู่<textarea rows="3">${u.addr||''}</textarea></label><button class="btn btn-p" style="justify-self:start">บันทึก</button></form>`,
      coupon:`<h3>คูปองของฉัน</h3><div class="coupons">${Object.entries(COUPONS).map(([k,c])=>`<div class="coupon"><div class="l">${c.t==='pct'?c.v+'%':'฿'+c.v}<small>ส่วนลด</small></div><div class="r"><b>${c.d}</b><code>${k}</code><button data-copy="${k}">ใช้โค้ด</button></div></div>`).join('')}</div>`,
      profile:`<h3>ข้อมูลส่วนตัว</h3><form class="form" id="profF"><label>ชื่อ<input name="name" value="${u.name}"></label><label>อีเมล<input name="email" value="${u.email}"></label><label>เบอร์โทร<input name="phone" value="${u.phone||''}"></label><button class="btn btn-p" style="justify-self:start">บันทึก</button></form>`}[tabA]||'';
      $('#accPane').innerHTML=html;
      $('#accSide').querySelectorAll('.lnk').forEach(b=>b.classList.toggle('on',b.dataset.acc===tabA));
      $('#profF')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);store.set('jsb-user',{...u,name:f.get('name'),email:f.get('email'),phone:f.get('phone')});toast('✓ บันทึกแล้ว')});
      $('#addrF')?.addEventListener('submit',e=>{e.preventDefault();store.set('jsb-user',{...u,addr:e.target.querySelector('textarea').value});toast('✓ บันทึกที่อยู่แล้ว')});
    };
    $('#acc').innerHTML=`<div class="two"><div class="panel side sticky" id="accSide"><div class="acc-user"><div class="avatar">${u.name[0].toUpperCase()}</div><div><b>${u.name}</b><br><span class="hint">สมาชิก JSB · ระดับ Sweet</span></div></div>
      ${[['orders','📦 คำสั่งซื้อ'],['fav','💖 รายการโปรด'],['coupon','🎟️ คูปอง'],['addr','📍 ที่อยู่จัดส่ง'],['profile','👤 ข้อมูลส่วนตัว']].map(([k,l])=>`<button class="lnk" data-acc="${k}">${l}</button>`).join('')}<button class="lnk" id="logout" style="color:var(--muted)">↪ ออกจากระบบ</button></div><div class="panel" id="accPane"></div></div>`;
    $('#accSide').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='logout'){try{localStorage.removeItem('jsb-user')}catch(x){}location.href='index.html';return}tabA=b.dataset.acc;history.replaceState(null,'','#'+tabA);pane()});
    window.onFav=pane;pane();
  }
}

/* ---------- promotions: coupon copy ---------- */
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(!c)return;coupon=c.dataset.copy;save();renderCart();try{navigator.clipboard.writeText(c.dataset.copy)}catch(x){}toast('✓ บันทึกโค้ด '+c.dataset.copy+' ลงตะกร้าแล้ว')});
if($('#couponList'))$('#couponList').innerHTML=Object.entries(COUPONS).map(([k,c])=>`<div class="coupon"><div class="l">${c.t==='pct'?c.v+'%':'฿'+c.v}<small>ส่วนลด</small></div><div class="r"><b>${c.d}</b><span class="hint">${c.min?'ขั้นต่ำ '+baht(c.min):'ไม่มีขั้นต่ำ'} · ใช้ได้ถึง 31 ธ.ค. 2026</span><code>${k}</code><button data-copy="${k}">เก็บโค้ด</button></div></div>`).join('');
if($('#storyArt'))$('#storyArt').innerHTML=art('box','#e4041f','#fff','#ffc93c');
if($('#authArt'))$('#authArt').innerHTML=art('bomb','#ffc93c','#fff','#ff7a3d')+art('lolli','#2bb39a','#fff','#147a68');

/* ---------- boot ---------- */
renderCats();renderFilters();renderGrid();renderBundles();renderCart();hydrateIcons();
