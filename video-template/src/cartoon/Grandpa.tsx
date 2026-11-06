import React from 'react';

// ตัวละครเวกเตอร์วาดด้วยโค้ด: คุณตาผมขาว แว่นกลม (ออกแบบเอง)
// phase = จังหวะก้าว (เรเดียน), walking=false -> ยืนนิ่ง, wave = ยกมือ 0..1, blink = หลับตา
export type Pose = {phase: number; walking: boolean; wave?: number; blink?: boolean; mouth?: 'smile' | 'open' | 'flat'};

const C = {line: '#1b1b1b', skin: '#ffe2c4', hair: '#f4f4f4', shirt: '#e3743a', pants: '#3f5a8a', shoe: '#2a2a2a'};
const W = 9; // ความหนาเส้น

// ขา/แขน: สองท่อน หมุนที่ข้อต่อ
const Limb = ({x, y, a1, a2, l1, l2, color, width, end}: {x: number; y: number; a1: number; a2: number; l1: number; l2: number; color: string; width: number; end: React.ReactNode}) => (
  <g transform={`translate(${x} ${y}) rotate(${a1})`}>
    <line x1={0} y1={0} x2={0} y2={l1} stroke={C.line} strokeWidth={width + W * 2} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={l1} stroke={color} strokeWidth={width} strokeLinecap="round" />
    <g transform={`translate(0 ${l1}) rotate(${a2})`}>
      <line x1={0} y1={0} x2={0} y2={l2} stroke={C.line} strokeWidth={width + W * 2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={l2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <g transform={`translate(0 ${l2})`}>{end}</g>
    </g>
  </g>
);

const Shoe = () => <ellipse cx={22} cy={6} rx={38} ry={18} fill={C.shoe} stroke={C.line} strokeWidth={W / 2} />;
const Hand = () => <circle r={22} fill={C.skin} stroke={C.line} strokeWidth={W / 2} />;

export const Grandpa = ({phase, walking, wave = 0, blink, mouth = 'smile'}: Pose) => {
  const s = walking ? Math.sin(phase) : 0;
  const bob = walking ? Math.abs(Math.cos(phase)) * -14 : Math.sin(phase * 0.3) * 3; // ตัวขึ้นลงตอนเดิน / หายใจตอนยืน
  const knee = (v: number) => Math.max(0, v) * 40;
  const legA = s * 28, legB = -s * 28;
  const armA = -s * 30, armB = s * 30;
  const waveA = -115 * wave + armB * (1 - wave);
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* แขน/ขาฝั่งไกล (หลังตัว) */}
      <Limb x={-18} y={330} a1={legB} a2={knee(-s)} l1={150} l2={150} color={C.pants} width={46} end={<Shoe />} />
      <Limb x={-40} y={150} a1={armA} a2={-15} l1={95} l2={95} color={C.shirt} width={30} end={<Hand />} />
      {/* ลำตัว */}
      <path d="M -70 135 Q -78 250 -66 345 L 66 345 Q 78 250 70 135 Q 0 105 -70 135 Z" fill={C.shirt} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
      <path d="M -66 330 L 66 330 L 64 360 L -64 360 Z" fill={C.pants} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
      {/* ขาฝั่งใกล้ */}
      <Limb x={18} y={330} a1={legA} a2={knee(s)} l1={150} l2={150} color={C.pants} width={46} end={<Shoe />} />
      {/* หัว */}
      <g transform="translate(0 20)">
        <ellipse cx={0} cy={0} rx={112} ry={118} fill={C.skin} stroke={C.line} strokeWidth={W} />
        <ellipse cx={-110} cy={10} rx={20} ry={28} fill={C.skin} stroke={C.line} strokeWidth={W} />
        <path d="M -118 -10 C -140 -90 -90 -150 -20 -140 C -30 -175 40 -170 30 -140 C 90 -160 140 -100 120 -20 C 100 -60 70 -80 40 -85 C 30 -60 -10 -60 -20 -90 C -50 -60 -90 -60 -118 -10 Z"
          fill={C.hair} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
        {/* แว่น + ตา */}
        {[-42, 48].map((x) => (
          <g key={x}>
            <circle cx={x} cy={10} r={36} fill="none" stroke={C.line} strokeWidth={W * 0.8} />
            {blink ? <path d={`M ${x - 16} 12 Q ${x} 2 ${x + 16} 12`} fill="none" stroke={C.line} strokeWidth={W * 0.8} strokeLinecap="round" />
              : <circle cx={x + 4} cy={10} r={8} fill={C.line} />}
          </g>
        ))}
        <line x1={-6} y1={8} x2={12} y2={8} stroke={C.line} strokeWidth={W * 0.8} />
        {mouth === 'open' ? <ellipse cx={10} cy={70} rx={20} ry={14} fill="#7a2b2b" stroke={C.line} strokeWidth={W * 0.7} />
          : <path d={mouth === 'flat' ? 'M -10 68 L 30 68' : 'M -18 60 Q 10 84 38 60'} fill="none" stroke={C.line} strokeWidth={W * 0.8} strokeLinecap="round" />}
      </g>
      {/* แขนฝั่งใกล้ (โบกมือได้) */}
      <Limb x={45} y={150} a1={waveA} a2={-15 - 45 * wave} l1={95} l2={95} color={C.shirt} width={30} end={<Hand />} />
    </g>
  );
};
