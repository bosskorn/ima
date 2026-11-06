import React from 'react';
import {AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grandpa} from './Grandpa';

const L = '#1b1b1b';

// ฉากสวนหลังบ้าน วาดด้วย SVG (เลื่อนฉากตามกล้องได้)
const Backyard = ({cam}: {cam: number}) => (
  <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5ec3f2" /><stop offset="1" stopColor="#bfe8fb" /></linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#sky)" />
    {/* เมฆ (ขยับช้า = ไกล) */}
    <g transform={`translate(${-cam * 0.1} 0)`}>
      {[[180, 260], [760, 180], [1300, 300], [1900, 220]].map(([x, y], i) => (
        <path key={i} d={`M ${x} ${y} q 30 -60 90 -30 q 40 -50 100 0 q 60 0 50 40 z`} fill="#fff" stroke={L} strokeWidth={6} strokeLinejoin="round" />
      ))}
    </g>
    {/* รั้วไม้ */}
    <g transform={`translate(${-(cam * 0.5) % 120} 0)`}>
      {Array.from({length: 13}, (_, i) => {
        const x = i * 120 - 60;
        return <path key={i} d={`M ${x} 1250 L ${x} 880 L ${x + 55} 820 L ${x + 110} 880 L ${x + 110} 1250 Z`} fill={i % 2 ? '#e08b4b' : '#d27c3c'} stroke={L} strokeWidth={6} strokeLinejoin="round" />;
      })}
      <rect x={-200} y={950} width={1600} height={30} fill="#b9652c" stroke={L} strokeWidth={6} />
    </g>
    {/* ต้นไม้ */}
    <g transform={`translate(${-cam * 0.8} 0)`}>
      {[-120, 1500, 3000].map((x) => (
        <g key={x}>
          <path d={`M ${x + 60} 1300 C ${x + 70} 1000 ${x + 40} 800 ${x + 110} 600 L ${x + 160} 610 C ${x + 110} 820 ${x + 140} 1000 ${x + 150} 1300 Z`} fill="#8a5427" stroke={L} strokeWidth={7} />
          <path d={`M ${x - 120} 640 q -60 -160 80 -220 q 60 -170 230 -90 q 170 -60 210 110 q 140 80 40 220 q -40 120 -200 80 q -120 90 -240 0 q -150 0 -120 -100 z`} fill="#5fb547" stroke={L} strokeWidth={7} strokeLinejoin="round" />
        </g>
      ))}
    </g>
    {/* สนามหญ้า */}
    <path d="M 0 1180 Q 540 1140 1080 1190 L 1080 1920 L 0 1920 Z" fill="#8fd062" stroke={L} strokeWidth={7} />
    <g transform={`translate(${-cam % 270} 0)`}>
      {Array.from({length: 18}, (_, i) => {
        const x = (i % 6) * 270 + ((i * 97) % 120), y = 1300 + Math.floor(i / 6) * 200 + ((i * 53) % 60);
        return <path key={i} d={`M ${x} ${y} l 10 -40 l 8 40 l 12 -30 l 4 30`} fill="none" stroke="#3f8a2e" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </g>
  </svg>
);

// ฉากตัวอย่าง: เดินเข้ามา -> หยุด -> กะพริบตา -> ยกมือทักทาย
export const CartoonScene = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const walkEnd = 2.6 * fps;
  const x = interpolate(f, [0, walkEnd], [-250, 540], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const walking = f < walkEnd;
  const phase = (f / fps) * Math.PI * 2 * 1.6; // 1.6 ก้าว/วินาที
  const cam = x * 0.6; // กล้องตามตัวละครนิดๆ ให้ฉากเลื่อน
  const wave = interpolate(f, [walkEnd + 10, walkEnd + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const waveWiggle = wave > 0.9 ? Math.sin(f / 3) * 0.08 : 0;
  const blink = f % 70 > 66;
  const talking = f > walkEnd + 25 && Math.floor(f / 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <Backyard cam={cam} />
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <ellipse cx={x} cy={1690} rx={150} ry={26} fill="rgba(0,0,0,.18)" />
        <g transform={`translate(${x} 1060) scale(${walking ? -1 : 1} 1) scale(1.15)`}>
          <Grandpa phase={phase} walking={walking} wave={wave + waveWiggle} blink={blink} mouth={talking ? 'open' : 'smile'} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
