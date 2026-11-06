import React from 'react';
import {AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grandpa} from './Grandpa';

const L = '#151515';

// พุ่มใบไม้: กลุ่มวงกลมซ้อน + ไฮไลต์ + เงา
const Foliage = ({cx, cy, r, base = '#4f9e3a', light = '#7cc45a', dark = '#3a7d2b'}: {cx: number; cy: number; r: number; base?: string; light?: string; dark?: string}) => {
  const blobs = [[0, 0, 1], [-0.7, 0.25, 0.7], [0.7, 0.2, 0.72], [-0.35, -0.5, 0.65], [0.4, -0.45, 0.62], [0, 0.55, 0.6]];
  return (
    <g>
      {blobs.map(([x, y, k], i) => <circle key={`o${i}`} cx={cx + x * r} cy={cy + y * r} r={k * r * 0.62} fill={L} />)}
      {blobs.map(([x, y, k], i) => <circle key={`b${i}`} cx={cx + x * r} cy={cy + y * r} r={k * r * 0.62 - 7} fill={base} />)}
      {blobs.map(([x, y, k], i) => <circle key={`d${i}`} cx={cx + x * r + k * r * 0.18} cy={cy + y * r + k * r * 0.2} r={k * r * 0.38} fill={dark} opacity={0.55} />)}
      {blobs.map(([x, y, k], i) => <circle key={`l${i}`} cx={cx + x * r - k * r * 0.2} cy={cy + y * r - k * r * 0.22} r={k * r * 0.28} fill={light} />)}
      {blobs.map(([x, y, k], i) => (
        <path key={`s${i}`} d={`M ${cx + x * r - 20} ${cy + y * r + 10} q 6 -10 14 -4 M ${cx + x * r + 12} ${cy + y * r - 14} q 6 -10 14 -2`} stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

const Cloud = ({x, y, s}: {x: number; y: number; s: number}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 40 C -10 10 30 -10 55 6 C 70 -26 130 -26 145 8 C 175 -6 210 16 200 40 Z" fill="#fff" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 20 34 Q 60 26 100 34" stroke="#d6e8f5" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

const Tuft = ({x, y, s = 1, c = '#3e8a2c'}: {x: number; y: number; s?: number; c?: string}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -30 0 Q -26 -40 -40 -70 Q -14 -40 -10 0 Q -6 -60 2 -90 Q 8 -50 8 0 Q 18 -46 40 -66 Q 24 -36 26 0 Z"
    fill={c} stroke={L} strokeWidth={5} strokeLinejoin="round" />
);

const Backyard = ({cam}: {cam: number}) => (
  <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fb1ec" /><stop offset="0.7" stopColor="#a9defa" /><stop offset="1" stopColor="#d5f0fd" /></linearGradient>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a6d65e" /><stop offset="1" stopColor="#7fbf3f" /></linearGradient>
      <linearGradient id="plank" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f0a35c" /><stop offset="1" stopColor="#d9843d" /></linearGradient>
      {/* เส้นสั่นนิดๆ ให้ดูวาดมือ */}
      <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
    </defs>
    <rect width="1080" height="1920" fill="url(#sky)" />
    <g transform={`translate(${-cam * 0.08} 0)`}>
      <Cloud x={120} y={520} s={0.9} /><Cloud x={760} y={430} s={1.1} /><Cloud x={1400} y={500} s={0.8} />
    </g>
    <g filter="url(#ink)">
      {/* พุ่มไม้หลังรั้ว */}
      <g transform={`translate(${-cam * 0.35} 0)`}>
        {[700, 900, 1080, 1300, 1500].map((x, i) => <Foliage key={x} cx={x} cy={860 + (i % 2) * 30} r={130} base="#5aa843" light="#86cc5f" />)}
      </g>
      {/* รั้วไม้ปลายแหลม + ลายไม้ */}
      <g transform={`translate(${-((cam * 0.5) % 96)} 0)`}>
        <rect x={-100} y={1040} width={1400} height={34} fill="#c46f2e" stroke={L} strokeWidth={6} />
        {Array.from({length: 15}, (_, i) => {
          const x = i * 96 - 48, top = 880 + ((i * 37) % 3) * 10;
          return (
            <g key={i}>
              <path d={`M ${x} 1300 L ${x} ${top + 50} L ${x + 44} ${top} L ${x + 88} ${top + 50} L ${x + 88} 1300 Z`} fill="url(#plank)" stroke={L} strokeWidth={6} strokeLinejoin="round" />
              <path d={`M ${x + 22} ${top + 90} l 2 70 M ${x + 60} ${top + 140} l -2 90 M ${x + 30} ${top + 260} l 3 80`} stroke="#a8582180" strokeWidth={4} strokeLinecap="round" />
              <path d={`M ${x + 70} ${top + 60} L ${x + 74} 1300`} stroke="#c46f2e80" strokeWidth={10} />
            </g>
          );
        })}
      </g>
      {/* สนามหญ้า + หย่อมสี + ดิน */}
      <path d="M -20 1260 Q 540 1230 1100 1265 L 1100 1940 L -20 1940 Z" fill="url(#grass)" stroke={L} strokeWidth={7} />
      <g transform={`translate(${-cam} 0)`}>
        {Array.from({length: 8}, (_, i) => {
          const x = i * 380 - 100, y = 1380 + ((i * 131) % 380);
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={160} ry={34} fill="#c3e277" opacity={0.6} />
              {i % 3 === 0 && <path d={`M ${x + 120} ${y + 120} q 60 -30 140 -6 q 40 14 -20 26 q -70 14 -120 -20 z`} fill="#c99a63" stroke={L} strokeWidth={5} />}
              <path d={`M ${x - 60} ${y + 60} q 20 -10 40 0 M ${x + 40} ${y - 40} q 14 -8 30 0`} stroke="#4f8f2a" strokeWidth={5} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </g>
      {/* ต้นไม้ใหญ่ซ้าย */}
      <g transform={`translate(${-cam * 0.25} 0)`}>
        <path d="M 20 1330 C 40 1150 10 1000 60 860 C 80 790 120 740 170 700 L 200 730 C 150 780 120 840 115 920 C 112 1060 130 1200 140 1330 Z" fill="#8c5a2b" stroke={L} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 60 900 C 90 820 140 770 190 720" stroke="#6a401c" strokeWidth={10} fill="none" />
        <path d="M 105 1000 C 140 960 200 940 260 950" fill="none" stroke={L} strokeWidth={22} strokeLinecap="round" />
        <path d="M 105 1000 C 140 960 200 940 260 950" fill="none" stroke="#8c5a2b" strokeWidth={10} strokeLinecap="round" />
        <Foliage cx={130} cy={540} r={240} />
        <Foliage cx={-40} cy={720} r={150} />
        <Foliage cx={300} cy={760} r={120} />
      </g>
      {/* หญ้าด้านหน้า (เลื่อนเร็ว = ใกล้กล้อง) */}
      <g transform={`translate(${-cam * 1.3} 0)`}>
        {[[60, 1880, 1.6], [330, 1820, 1.1], [980, 1900, 1.7], [1300, 1840, 1.3], [1650, 1890, 1.6], [760, 1500, 0.7], [140, 1460, 0.6], [1120, 1540, 0.8]].map(([x, y, s], i) => <Tuft key={i} x={x} y={y} s={s} />)}
      </g>
    </g>
  </svg>
);

// ฉากตัวอย่าง: เดินเข้ามา -> หยุด -> ยิ้ม -> ยกนิ้วชี้ขึ้นแตะหัว -> พูด
export const CartoonScene = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const walkEnd = 2.4 * fps;
  const x = interpolate(f, [0, walkEnd], [-200, 560], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const walking = f < walkEnd;
  const phase = (f / fps) * Math.PI * 2 * 1.5;
  const cam = x * 0.5;
  const wave = interpolate(f, [walkEnd + 12, walkEnd + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.8))});
  const eyes = walking ? 'open' : f % 80 > 76 ? 'blink' : f > walkEnd + 8 ? 'happy' : 'open';
  const talking = f > walkEnd + 30 && Math.floor(f / 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <Backyard cam={cam} />
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <ellipse cx={x} cy={1462} rx={170} ry={30} fill="rgba(40,80,20,.28)" />
        <g transform={`translate(${x} 810) scale(1.25)`}>
          <Grandpa phase={phase} walking={walking} wave={wave} eyes={eyes} mouth={talking ? 'open' : 'smile'} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
