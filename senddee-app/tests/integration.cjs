// End-to-end data-consistency test (create → edit → void → hand over → receipts → credit → home dashboard → settings overview → reload).
// Needs: a running preview (npx vite preview --port 4173) and playwright available globally:
//   NODE_PATH=$(npm root -g) node tests/integration.cjs
// Re-run it after connecting the real API (src/api/index.js) with demo data.
const { chromium, devices } = require('playwright');
const B='http://localhost:4173/#';
let pass=0,fail=0;const ok=(c,m,extra='')=>{console.log(c?'PASS':'FAIL',m,c?'':extra);c?pass++:fail++};
const num=t=>parseFloat(String(t).replace(/[^0-9.\-]/g,''))||0;
const near=(a,b)=>Math.abs(a-b)<0.011;
(async()=>{const b=await chromium.launch();const p=await(await b.newContext({...devices['Pixel 5'],locale:'th-TH'})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));p.on('dialog',d=>d.accept());
const go=async path=>{await p.goto(B+path);await p.waitForTimeout(450)};
const login=async()=>{await p.goto('http://localhost:4173/');await p.fill('input[placeholder="เช่น LP001"]','LP001');await p.fill('input[placeholder="เช่น S001"]','S001');await p.fill('input[inputmode=numeric]','1234');await p.click('text=เข้าสู่ระบบ');await p.waitForSelector('.act')};
const overview=async()=>{await go('/settings');await p.waitForSelector('.ov2');const t=await p.locator('.ov2 b').allInnerTexts();const kv=await p.locator('.blk.ov .kv').allInnerTexts();
  const cnt=num((kv.find(x=>x.includes('พัสดุวันนี้'))||'').match(/(\d+) ชิ้น/)?.[1]);const voided=num((kv.find(x=>x.includes('พัสดุวันนี้'))||'').match(/ยกเลิก (\d+)/)?.[1]);const vat=num((kv.find(x=>x.includes('ภาษีมูลค่าเพิ่ม'))||'0'));
  return {rev:num(t[0]),profit:num(t[1]),cnt,voided,vat}};
const credit=async phone=>{await go('/credit');await p.fill('input[inputmode=tel]',phone);await p.waitForSelector('.res');return num(await p.locator('.res .cr').innerText())};
const homeBadges=async()=>{await go('/');await p.waitForSelector('.act');const n=async k=>(await p.locator(`[data-k=${k}] [data-n]`).count())?num(await p.locator(`[data-k=${k}] [data-n]`).innerText()):0;
  const o={'พัสดุในร้าน':await n('waiting'),'ค้างเกิน 24 ชม.':await n('overdue')};o.tab=await p.locator('.tabbar .badge-n').count()?num(await p.locator('.tabbar .badge-n').innerText()):0;o.pipe={};
  for(const st of ['received','handed_over','in_transit','out_for_delivery','delivered'])o.pipe[st]=num(await p.locator(`[data-k=st-${st}] .num`).innerText());o.recent=await p.locator('[data-k=recent] .no').allInnerTexts();return o};
const searchHas=async(q)=>{await go('/search');await p.fill('.in',q);await p.waitForTimeout(250);return p.locator('.oc .no').allInnerTexts().then(a=>a.map(s=>s.trim()))};
const mkParcel=async(paste,w,carrier,cod)=>{await p.fill('.paste',paste);await p.click('text=แยกที่อยู่อัตโนมัติ');await p.fill('[data-f=weight] input',String(w));for(const i of [0,1,2])await p.fill(`.dims input >> nth=${i}`,'20');await p.click('[data-f=ptype]');await p.click('.topt:has-text("เสื้อผ้า")');await p.click(`.cr:has-text("${carrier}")`);
  if(cod){await p.locator('.tg').first().click();await p.click('text=ยืนยันบัญชีนี้');await p.fill('[data-f=cod] input',String(cod));}
  await p.click('.stickybar .btn');await p.waitForSelector('.label');const no=(await p.locator('.sheet .label .no').innerText()).trim();return no};

await login();
// ---------- baseline
const base=await overview();const c0=await credit('0812345678');const hb0=await homeBadges();ok(await p.locator('[data-k=overdue]').count()===1,'home shows the overdue alert row');
ok(c0===1000,'baseline sender credit ฿1,000');console.log('baseline',JSON.stringify(base),'badges',JSON.stringify(hb0));
const waiting0=hb0['พัสดุในร้าน'],over0=hb0['ค้างเกิน 24 ชม.'];

// ---------- create a visit with 2 parcels
await go('/receive');await p.fill('[data-f=sphone] input','0812345678');await p.waitForSelector('.sheet');await p.click('text=ใช่ ยืนยัน');
const A=await mkParcel('คุณสมหญิง ใจงาม 081-234-5678 99/1 ม.2 ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ 10540',2,'SPX',1000);
await p.click('text=+ เพิ่มรายการถัดไป');await p.waitForTimeout(400);
const Bn=await mkParcel('นายวิชัย แสงทอง 082-555-6677 8 ซ.นิมมานเหมินท์ 9 ต.สุเทพ อ.เมือง เชียงใหม่ 50200',1,'Flash',0);
await p.click('.sheet .btn.ghost:has-text("เสร็จสิ้น")');await p.waitForSelector('.rc');await p.waitForTimeout(500);
const txId=(await p.locator('.rc .kv b').first().innerText()).trim();console.log('created',A,Bn,txId);
ok(A!==Bn&&/^SD\d{9}TH$/.test(A),'two distinct tracking numbers generated');

// credit + receipt
ok(near(await credit('0812345678'),1000-61.10-28),'credit = 1000 − 61.10 − 28 = 910.90');
await go('/receipt/'+txId);await p.waitForSelector('.rc');await p.waitForTimeout(400);
let rc=await p.locator('.rc').innerText();
ok(rc.includes('2 ชิ้น')&&rc.includes('฿57.00')&&rc.includes('฿30.00')&&rc.includes('฿2.10')&&rc.includes('฿89.10'),'receipt totals: ship 57.00, COD fee 30.00, VAT 2.10, total 89.10');
ok(!rc.includes('เครดิต'),'receipt has no credit wording');
// shop + home badges
const hb1=await homeBadges();ok(hb1['พัสดุในร้าน']===waiting0+2&&hb1.tab===waiting0+2&&hb1.pipe.received===waiting0+2,`home to-do row, tab badge and pipeline all show ${waiting0+2} waiting`,JSON.stringify(hb1));ok(hb1.recent.map(x=>x.trim()).includes(A)&&hb1.recent.map(x=>x.trim()).includes(Bn),'home recent list shows the new parcels');ok(await p.locator('[data-k=receive]').count()===1&&await p.locator('[data-k=handover]').innerText().then(t=>t.includes('ชิ้นรออยู่')),'home primary actions present');
await go('/shop');await p.waitForSelector('.oc');const shopNos=(await p.locator('.oc .no').allInnerTexts()).map(s=>s.trim());ok(shopNos.includes(A)&&shopNos.includes(Bn),'both parcels listed under พัสดุในร้าน');
// search by tracking / receiver / sender phone
ok((await searchHas(A)).includes(A),'search by tracking number');ok((await searchHas('0825556677')).includes(Bn),'search by receiver phone');ok((await searchHas('0812345678')).includes(A),'search by sender phone (finds seed + new)');
// detail A
await go('/orders/'+A);await p.waitForSelector('.tl');let d=await p.locator('.page').innerText();
ok(d.includes('SPX Express')&&d.includes('฿29')&&d.includes('฿30')&&d.includes('฿2.10')&&d.includes('฿61.10')&&d.includes('1,000'),'detail A: carrier, fee, COD fee, VAT, charge, COD amount');
ok(d.includes('คุณสมหญิง')&&d.includes('สมุทรปราการ')&&d.includes('คุณสมชาย ใจดี')&&d.includes('หน้าร้าน'),'detail A: receiver, sender, pickup place');
// overview
let ov=await overview();ok(ov.cnt===base.cnt+2,`settings: parcels today +2 (${base.cnt}→${ov.cnt})`);ok(near(ov.rev,base.rev+87),`settings: revenue +87.00 excl. VAT (${base.rev}→${ov.rev})`);ok(near(ov.vat,base.vat+2.10),`settings: VAT +2.10 (${base.vat}→${ov.vat})`);ok(near(ov.profit,Math.round(ov.rev*0.15*100)/100),'settings: profit = 15% of revenue');

// ---------- edit B: Flash 1kg(28) -> 4kg(50)
await go('/orders/'+Bn);await p.waitForSelector('.tl');await p.click('text=แก้ไขข้อมูล');await p.fill('.sheet input[inputmode=decimal]','4');await p.click('.sheet >> text=บันทึก');await p.waitForSelector('.toast');
ok((await p.locator('.toast').innerText()).includes('หักเครดิตเพิ่ม ฿22'),'edit B: toast says extra ฿22 deducted');await p.waitForTimeout(500);
d=await p.locator('.page').innerText();ok(d.includes('฿50')&&d.includes('4 กก.'),'detail B shows new weight and fee ฿50');
ok(near(await credit('0812345678'),1000-61.10-50),'credit after edit = 888.90');
await go('/receipt/'+txId);await p.waitForSelector('.rc');await p.waitForTimeout(400);rc=await p.locator('.rc').innerText();ok(rc.includes('฿79.00')&&rc.includes('฿111.10'),'receipt follows the edit (ship 79.00, total 111.10)');
ov=await overview();ok(near(ov.rev,base.rev+109),`settings revenue follows edit (+109 → ${ov.rev})`);

// ---------- void A
await go('/orders/'+A);await p.waitForSelector('.tl');await p.click('text=ยกเลิกพัสดุ (Void)');await p.click('.sheet .chip >> nth=0');await p.click('text=ยืนยันยกเลิก');await p.waitForTimeout(800);
ok((await p.locator('.badge').first().innerText()).includes('ยกเลิก'),'A shows cancelled');
ok(near(await credit('0812345678'),1000-50),'void A refunds credit (950.00)');
const hb2=await homeBadges();ok(hb2['พัสดุในร้าน']===waiting0+1,'waiting badge drops after void');
await go('/search?filter=cancelled');await p.waitForSelector('.oc');ok((await p.locator('.oc .no').allInnerTexts()).map(s=>s.trim()).includes(A),'cancelled list contains A');
await go('/receipt/'+txId);await p.waitForSelector('.rc');await p.waitForTimeout(400);rc=await p.locator('.rc').innerText();ok(rc.includes('1 ชิ้น')&&rc.includes('฿50.00')&&!rc.includes('COD'),'receipt excludes voided A (1 piece, ฿50.00, no COD)');
ov=await overview();ok(ov.cnt===base.cnt+1&&ov.voided>=1,'settings: count +1 and voided counted');ok(near(ov.rev,base.rev+50)&&near(ov.vat,base.vat),'settings: revenue +50, VAT back to baseline');

// ---------- hand over B (+ overdue seed)
await go('/shop');await p.waitForSelector('.oc');await p.locator('.oc').filter({hasText:Bn}).locator('.chk').click();await p.click('.stickybar .btn');await p.fill('.in',Bn);await p.press('.in','Enter');await p.waitForTimeout(250);
ok((await p.locator('.sheet').innerText()).includes('ตรวจแล้ว 1 / 1'),'handover: scanning B ticks it (1/1)');
await p.click('text=/ยืนยันส่งมอบ/');await p.waitForSelector('.mf');const hid=1;ok((await p.locator('.mf').innerText()).includes(Bn),'manifest lists B');
const hb3=await homeBadges();ok(hb3['พัสดุในร้าน']===waiting0&&hb3.pipe.handed_over===hb0.pipe.handed_over+1,'home waiting count back to original and pipeline handed-over +1');
await go('/orders/'+Bn);await p.waitForSelector('.tl');d=await p.locator('.page').innerText();ok(d.includes('ส่งมอบขนส่งแล้ว')&&d.includes('HO-'),'B status handed over with HO id');
ok(await p.locator('button:has-text("ยกเลิกพัสดุ (Void)")').count()===0&&await p.locator('button:has-text("แก้ไขข้อมูล")').count()===0,'B can no longer be edited or voided');
// advance
await p.click('text=จำลองสถานะถัดไป');await p.waitForTimeout(500);await go('/search?filter=in_transit');await p.waitForSelector('.oc');ok((await p.locator('.oc .no').allInnerTexts()).map(s=>s.trim()).includes(Bn),'after advance, B appears in "กำลังขนส่ง"');
const hb4=await homeBadges();ok(hb4.pipe.in_transit===hb0.pipe.in_transit+1&&hb4.pipe.handed_over===hb0.pipe.handed_over,'pipeline: B moved from handed-over to in-transit');const credAfter=await credit('0812345678');ok(near(credAfter,950),'handover/advance do not change credit');

// ---------- issues
await go('/issues');await p.click('.chip:has-text("พัสดุชำรุด")');await p.fill('input[list="nos"]',Bn);await p.fill('textarea','กล่องบุบ');await p.click('text=ส่งเรื่อง');await p.waitForTimeout(700);
ok((await p.locator('.page').innerText()).includes(Bn),'issue logged against B');await p.click('text=ปิดเรื่อง');await p.waitForTimeout(400);ok(await p.locator('.badge.green').count()===1,'issue resolved');

// ---------- persistence
await p.reload();await p.waitForTimeout(800);ok(await p.locator('.login').count()===0&&p.url().includes('/issues'),'reload keeps the session logged in and stays on the same page');
ok(near(await credit('0812345678'),950),'credit persisted after reload');const ov2=await overview();ok(near(ov2.rev,ov.rev),'overview persisted after reload');
// draft visit survives reload
await go('/receive');await p.waitForSelector('.paste');await p.click('text=ไม่ใช่คนนี้ / เปลี่ยนผู้ส่ง').catch(()=>{});await p.fill('[data-f=sphone] input','0812345678');await p.waitForSelector('.sheet');ok((await p.locator('.sheet').innerText()).includes('฿950'),'new visit: sender popup shows updated credit ฿950');await p.click('text=ใช่ ยืนยัน');
const C=await mkParcel('คุณสมศรี 086-777-8899 5 ม.1 ต.ในเมือง อ.เมือง อุดรธานี 41000',1,'SPX',0);await p.click('text=+ เพิ่มรายการถัดไป');await p.waitForTimeout(300);
await p.reload();await p.waitForTimeout(800);await go('/receive');await p.waitForSelector('.paste');ok(await p.locator('.done').count()===1&&await p.locator('[data-f=sphone] input').isDisabled(),'mid-visit reload restores locked sender and created items');
// cross-visit: finishing resets draft
await p.click('text=เสร็จสิ้น → ใบเสร็จ');await p.waitForSelector('.rc');await go('/receive');await p.waitForSelector('.paste');ok(await p.locator('.done').count()===0,'after receipt, a new visit starts clean');
// credit boundary: sender with ฿40 cannot create ฿50 parcel; but can create ฿25
await p.fill('[data-f=sphone] input','0861112233');await p.waitForSelector('.sheet');await p.click('text=ใช่ ยืนยัน');
await p.fill('.paste','คุณทดสอบ 089-999-9999 5 ม.1 เชียงใหม่ 50000');await p.click('text=แยกที่อยู่อัตโนมัติ');await p.fill('[data-f=weight] input','5');for(const i of [0,1,2])await p.fill(`.dims input >> nth=${i}`,'10');await p.click('[data-f=ptype]');await p.click('.topt:has-text("เอกสาร")');await p.click('.cr:has-text("Flash")');
ok(await p.locator('.stickybar .btn').isDisabled(),'credit ฿40 < ฿50 parcel: create is blocked');
await p.fill('[data-f=weight] input','1');await p.click('.cr:has-text("SPX")');await p.waitForTimeout(200);ok(await p.locator('.stickybar .btn').isEnabled(),'credit ฿40 ≥ ฿25 parcel (SPX 1kg): create allowed');
// reset clears everything
await go('/settings');await p.click('text=ล้างข้อมูลทดลอง');await p.click('.sheet .btn.danger');await p.waitForTimeout(600);const ov3=await overview();ok(near(await credit('0812345678'),1000),'reset: credit back to ฿1,000');
console.log(`\nRESULT ${pass} passed, ${fail} failed`);console.log('errors',errs);await b.close();})();
