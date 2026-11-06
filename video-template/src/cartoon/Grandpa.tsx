import React from 'react';

// ตัวละครเวกเตอร์วาดด้วยโค้ด สไตล์การ์ตูนลายเส้นหนา + แรเงา 2 ชั้น
// สัดส่วน: หัวโต ตัวเล็ก แขนขาเรียวยาว (แบบการ์ตูนเล่าเรื่องใน Reels)
// phase = จังหวะก้าว, walking, wave 0..1, eyes: 'happy' (ยิ้มหลับตา) | 'open' | 'blink', mouth
export type Pose = {kid?: boolean; hold?: boolean; phase: number; walking: boolean; wave?: number; eyes?: 'happy' | 'open' | 'blink'; mouth?: 'smile' | 'open' | 'flat'};

const GRANDPA = {
  line: '#151515', skin: '#fde3cc', skinSh: '#efc3a2', hair: '#ffffff', hairSh: '#d9dde3',
  shirt: '#7cc576', shirtSh: '#55a253', pants: '#8a5a2b', pantsSh: '#6b431d', shoe: '#1d1d1d',
};
const KID = {...GRANDPA, skin: '#f6d2b0', skinSh: '#e2b08a', hair: '#2b2118', hairSh: '#4a3a2c', shirt: '#f2c230', shirtSh: '#d39d12', pants: '#3a64b0', pantsSh: '#284a88', shoe: '#c0392b'};
// สีทั้งหมดอ่านจาก CSS variable -> ตัวละครเดียวกันเปลี่ยนชุดสีได้
export const PAL = Object.fromEntries(Object.keys(GRANDPA).map((k) => [k, `var(--${k})`])) as Record<keyof typeof GRANDPA, string>;
const vars = (pal: typeof GRANDPA) => Object.fromEntries(Object.entries(pal).map(([k, v]) => [`--${k}`, v])) as React.CSSProperties;
const LW = 7;

// แขน/ขาเรียว: สองท่อน หมุนที่ข้อต่อ (เส้นขอบ + ไส้ + เงาด้านหลัง)
const Limb = ({x, y, a1, a2, l1, l2, fill, shade, width, end}: {x: number; y: number; a1: number; a2: number; l1: number; l2: number; fill: string; shade: string; width: number; end?: React.ReactNode}) => {
  const seg = (l: number) => (
    <>
      <line x1={0} y1={0} x2={0} y2={l} stroke={PAL.line} strokeWidth={width + LW * 2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={l} stroke={fill} strokeWidth={width} strokeLinecap="round" />
      <line x1={width * 0.28} y1={4} x2={width * 0.28} y2={l - 4} stroke={shade} strokeWidth={width * 0.38} strokeLinecap="round" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${a1})`}>
      {seg(l1)}
      <g transform={`translate(0 ${l1}) rotate(${a2})`}>
        {seg(l2)}
        <g transform={`translate(0 ${l2})`}>{end}</g>
      </g>
    </g>
  );
};

const Shoe = () => (
  <g>
    <path d="M -22 -8 C -24 14 -14 26 10 26 L 52 26 C 62 26 64 12 50 6 C 34 0 20 -6 14 -12 Z" fill={PAL.shoe} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
    <path d="M 4 4 Q 22 6 40 10" stroke="#555" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// มือการ์ตูน: ฝ่ามือ + นิ้วโป้ง (pointing = ชี้นิ้ว)
const Hand = ({pointing}: {pointing?: boolean}) => (
  <g>
    {pointing && <path d="M 4 -8 C 10 -40 22 -52 28 -46 C 34 -40 22 -20 16 -2" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinejoin="round" />}
    <path d="M -16 -6 C -22 14 -12 30 4 30 C 20 30 26 14 20 -4 C 14 -16 -10 -18 -16 -6 Z" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinejoin="round" />
    <path d="M -16 4 C -28 0 -30 -12 -20 -14" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinecap="round" />
    <path d="M -2 14 L 16 14 M -4 22 L 14 22" stroke={PAL.skinSh} strokeWidth={3} strokeLinecap="round" />
  </g>
);

export const Grandpa = ({kid, hold, phase, walking, wave = 0, eyes = 'happy', mouth = 'smile'}: Pose) => {
  const s = walking ? Math.sin(phase) : 0;
  const bob = walking ? -Math.abs(Math.cos(phase)) * 10 : Math.sin(phase * 0.35) * 2.5;
  const tilt = walking ? Math.sin(phase * 2) * 1.5 : Math.sin(phase * 0.35) * 1; // หัวเอียงนิดๆ
  const knee = (v: number) => Math.max(0, v) * 38;
  const standSpread = walking ? 0 : 7;
  const legA = s * 24 - standSpread, legB = -s * 24 + standSpread;
  const armFar = s * 22 + 8;
  const armNear = -s * 22 - 8;
  const waveA = hold ? -40 : -130 * wave + armNear * (1 - wave);
  const waveB = hold ? -50 : -20 - 25 * wave;

  return (
    <g transform={`translate(0 ${bob})`} style={vars(kid ? KID : GRANDPA)}>
      {/* ขาไกล */}
      <Limb x={-14} y={250} a1={legB} a2={knee(-s)} l1={118} l2={118} fill={PAL.pantsSh} shade={PAL.pantsSh} width={30} end={<Shoe />} />
      {/* แขนไกล */}
      <Limb x={-44} y={95} a1={armFar} a2={-12} l1={78} l2={74} fill={PAL.skinSh} shade={PAL.skinSh} width={18} end={<Hand />} />
      {/* ลำตัว: เสื้อยืด */}
      <path d="M -50 80 C -64 82 -66 120 -62 170 C -60 205 -58 235 -56 258 L 56 258 C 58 235 60 205 62 170 C 66 120 64 82 50 80 C 30 72 -30 72 -50 80 Z"
        fill={PAL.shirt} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
      <path d="M 26 84 C 44 110 46 200 40 254 L 56 258 C 60 210 66 120 50 80 Z" fill={PAL.shirtSh} />
      <path d="M -24 76 Q 0 92 24 76" fill="none" stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinecap="round" />
      {/* แขนเสื้อสั้น */}
      <path d="M -50 82 C -70 90 -76 118 -70 132 L -44 128 Z" fill={PAL.shirt} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
      {/* กางเกง */}
      <path d="M -57 246 L 57 246 L 60 282 L 4 282 L 0 262 L -4 282 L -60 282 Z" fill={PAL.pants} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
      {/* ขาใกล้ */}
      <Limb x={16} y={250} a1={legA} a2={knee(s)} l1={118} l2={118} fill={PAL.pants} shade={PAL.pantsSh} width={32} end={<Shoe />} />
      <path d="M 20 262 L 22 300" stroke={PAL.pantsSh} strokeWidth={4} strokeLinecap="round" />

      {/* คอ */}
      <rect x={-14} y={52} width={28} height={30} fill={PAL.skinSh} stroke={PAL.line} strokeWidth={LW} />
      {/* หัว (ใหญ่) */}
      <g transform={`translate(0 -70) rotate(${tilt})`}>
        {/* หู */}
        <path d="M -112 6 C -140 0 -144 44 -112 52" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW} />
        <path d="M 112 6 C 140 0 144 44 112 52" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW} />
        {/* หน้า */}
        <path d="M -114 -20 C -118 70 -70 128 0 128 C 70 128 118 70 114 -20 C 110 -100 -110 -100 -114 -20 Z" fill={PAL.skin} stroke={PAL.line} strokeWidth={LW} />
        <path d="M 70 100 C 100 80 116 40 114 -10 C 104 40 90 76 60 104 Z" fill={PAL.skinSh} />
        {kid ? (
          <path d="M -120 10 C -130 -80 -60 -120 0 -118 C 70 -122 132 -80 120 10 C 110 -20 96 -40 70 -46 C 74 -30 60 -24 50 -40 C 30 -24 -6 -26 -14 -48 C -30 -30 -70 -30 -80 -50 C -96 -40 -110 -20 -120 10 Z"
            fill={PAL.hair} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
        ) : (
          <>
        <path d="M -126 30 C -146 -10 -136 -60 -112 -78 C -124 -110 -86 -140 -60 -126 C -56 -168 -6 -170 6 -140 C 22 -176 74 -166 74 -128 C 110 -144 140 -110 124 -76 C 150 -54 146 -6 126 26
                 C 118 0 112 -20 104 -36 C 96 -18 80 -14 70 -22 C 74 -44 64 -60 50 -66 C 40 -46 14 -40 -2 -56 C -14 -36 -46 -34 -60 -52 C -70 -36 -90 -30 -100 -40 C -108 -20 -116 0 -126 30 Z"
          fill={PAL.hair} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M 60 -120 C 90 -126 116 -104 112 -80 M -40 -126 C -20 -140 0 -136 4 -128" fill="none" stroke={PAL.hairSh} strokeWidth={6} strokeLinecap="round" />
          </>
        )}
        {/* แว่นกลม + ตา */}
        {[-46, 46].map((x) => (
          <g key={x}>
            {eyes === 'open' ? (
              <g><ellipse cx={x} cy={22} rx={9} ry={11} fill={PAL.line} /><circle cx={x + 3} cy={18} r={3} fill="#fff" /></g>
            ) : eyes === 'blink' ? (
              <path d={`M ${x - 16} 24 L ${x + 16} 24`} stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinecap="round" />
            ) : (
              <path d={`M ${x - 18} 28 Q ${x} 8 ${x + 18} 28`} fill="none" stroke={PAL.line} strokeWidth={LW * 0.8} strokeLinecap="round" />
            )}
            {!kid && <circle cx={x} cy={22} r={38} fill="rgba(255,255,255,.08)" stroke={PAL.line} strokeWidth={LW * 0.75} />}
            {!kid && <path d={`M ${x - 22} 2 Q ${x - 10} -8 ${x + 4} -6`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />}
          </g>
        ))}
        {!kid && <path d="M -8 18 Q 0 10 8 18" fill="none" stroke={PAL.line} strokeWidth={LW * 0.75} />}
        {!kid && <path d="M -84 20 L -112 10 M 84 20 L 112 10" stroke={PAL.line} strokeWidth={LW * 0.75} strokeLinecap="round" />}
        {/* จมูก + ปาก */}
        <path d="M 4 50 Q 14 62 2 66" fill="none" stroke={PAL.line} strokeWidth={LW * 0.6} strokeLinecap="round" />
        {mouth === 'open' ? (
          <path d="M -20 84 Q 4 112 28 84 Q 4 92 -20 84 Z" fill="#8b2f2f" stroke={PAL.line} strokeWidth={LW * 0.7} strokeLinejoin="round" />
        ) : (
          <path d={mouth === 'flat' ? 'M -14 88 L 22 88' : 'M -24 82 Q 2 102 30 80'} fill="none" stroke={PAL.line} strokeWidth={LW * 0.75} strokeLinecap="round" />
        )}
        <ellipse cx={-70} cy={70} rx={14} ry={8} fill="#f6a99a" opacity={0.55} />
        <ellipse cx={74} cy={70} rx={14} ry={8} fill="#f6a99a" opacity={0.55} />
      </g>
      {/* แขนใกล้ (ยกชี้นิ้วได้) */}
      <path d="M 50 82 C 70 90 76 118 70 132 L 44 128 Z" fill={PAL.shirt} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
      <Limb x={58} y={120} a1={waveA} a2={waveB} l1={74} l2={74} fill={PAL.skin} shade={PAL.skinSh} width={18} end={<Hand pointing={wave > 0.5} />} />
      <path d="M 50 82 C 70 90 76 118 70 132 L 50 132" fill={PAL.shirt} stroke={PAL.line} strokeWidth={LW} strokeLinejoin="round" />
    </g>
  );
};
