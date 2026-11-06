import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grandpa, Pose} from './Grandpa';
import {Backyard} from './Scene';
import story from './story.json';

// การ์ตูนเล่าเรื่อง ~30 วิ: "ตาขี้บ่นกับลูกบอลข้างบ้าน"
// เวลาแต่ละฉากมาจากเสียงพากย์ (scripts/story_voice.py -> story.json)

type Line = {text: string; color?: string};
type Beat = {beat: string; text: Line[]; start: number; end: number};
const S = story.scenes as Beat[];
export const END_CARD = 3.2; // วินาที
export const storyFrames = (fps: number) => Math.ceil((S[S.length - 1].end + END_CARD) * fps);

const COL: Record<string, string> = {white: '#fff', yellow: '#ffd60a', red: '#ff3b3b'};
const FONT = `@font-face{font-family:Kanit;font-weight:800;src:url(${staticFile('kanit-thai-800-normal.woff2')});unicode-range:U+0E00-0E7F}
@font-face{font-family:Kanit;font-weight:800;src:url(${staticFile('kanit-latin-800-normal.woff2')})}`;

const Caption = ({lines, dur}: {lines: Line[]; dur: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [dur - 5, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      {lines.map((l, i) => {
        const s = spring({frame: f - 3 - i * 5, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
        const visible = l.text.replace(/[ัิ-ฺ็-๎]/g, '').length;
        const size = Math.min(104, Math.floor(920 / (visible * 0.56)));
        return (
          <div key={i} style={{fontFamily: 'Kanit', fontWeight: 800, fontSize: size, lineHeight: 1.25, whiteSpace: 'nowrap', color: COL[l.color ?? 'white'],
            WebkitTextStroke: `${Math.round(size * 0.17)}px #111`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.07}px 0 #111`,
            opacity: Math.min(1, s * 1.5) * (1 - out), transform: `translateY(${(1 - s) * 50}px) scale(${0.5 + 0.5 * s})`}}>
            {l.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Ball = ({x, y, rot = 0, s = 1}: {x: number; y: number; rot?: number; s?: number}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={42} fill="#fff" stroke="#151515" strokeWidth={7} />
    <path d="M 0 -14 L 13 -4 L 8 12 L -8 12 L -13 -4 Z" fill="#151515" />
    <path d="M 0 -14 L 0 -40 M 13 -4 L 38 -12 M 8 12 L 22 34 M -8 12 L -22 34 M -13 -4 L -38 -12" stroke="#151515" strokeWidth={5} />
    <path d="M -24 -24 Q -14 -34 -2 -34" stroke="#fff" strokeWidth={0} />
  </g>
);

// ตัวละครบนพื้น: x = ตำแหน่ง, size = ขนาด (คุณตา 1.25, เด็ก 0.95)
const Actor = ({x, size, flip, pose}: {x: number; size: number; flip?: boolean; pose: Pose}) => {
  const feet = 1462;
  return (
    <g>
      <ellipse cx={x} cy={feet} rx={140 * size} ry={26 * size} fill="rgba(40,80,20,.28)" />
      <g transform={`translate(${x} ${feet - 512 * size}) scale(${flip ? -size : size} ${size})`}>
        <Grandpa {...pose} />
      </g>
    </g>
  );
};

const arc = (p: number, x0: number, y0: number, x1: number, y1: number, h: number) => ({x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p - h * 4 * p * (1 - p)});

export const Story = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const idx = Math.max(0, S.findIndex((s) => t >= s.start && t < s.end));
  const sc = t >= S[S.length - 1].end ? {beat: 'end', start: S[S.length - 1].end, end: S[S.length - 1].end + END_CARD} : S[idx];
  const lt = t - sc.start; // เวลาในฉาก
  const len = sc.end - sc.start;
  const p = Math.min(1, lt / len);
  const phase = t * Math.PI * 2 * 1.5;
  const talk = Math.floor(f / 4) % 2 === 0;
  const blinkNow = f % 90 > 86;

  let gx = 380, gPose: Pose = {phase, walking: false, eyes: blinkNow ? 'blink' : 'open', mouth: 'smile'}, gFlip = false;
  let kid: null | {x: number; pose: Pose; flip?: boolean} = null;
  let ball: null | {x: number; y: number; rot: number} = null;
  let dusk = 0;

  switch (sc.beat) {
    case 'ballIn': {
      // บอลลอยข้ามรั้ว -> เด้งพื้น -> กลิ้งมาหยุดข้างคุณตา; คุณตาตกใจ
      const a = interpolate(lt, [0.3, 1.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const b = interpolate(lt, [1.6, 2.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      const pos = lt < 1.6 ? arc(a, 1150, 700, 760, 1420, 300) : arc(b, 760, 1420, 600, 1420, 110);
      ball = {...pos, rot: lt * -400};
      gPose = {...gPose, eyes: lt > 1.4 ? 'open' : gPose.eyes, mouth: lt > 1.5 && lt < 3 ? 'open' : 'flat'};
      break;
    }
    case 'grumble': {
      // ถือบอล บ่น แล้วโยนข้ามรั้วกลับไป
      const throwAt = len * 0.62;
      gPose = {...gPose, hold: lt < throwAt, wave: lt >= throwAt ? interpolate(lt, [throwAt, throwAt + 0.3], [0, 1], {extrapolateRight: 'clamp'}) : 0,
        eyes: lt < throwAt ? 'happy' : 'open', mouth: lt < throwAt ? (talk ? 'open' : 'flat') : 'smile'};
      if (lt < throwAt) ball = {x: gx + 1.25 * 95, y: 1462 - 512 * 1.25 + 1.25 * 175, rot: 0};
      else {
        const q = interpolate(lt, [throwAt, throwAt + 1.1], [0, 1], {extrapolateRight: 'clamp'});
        if (q < 1) ball = {...arc(q, gx + 140, 900, 1180, 760, 420), rot: q * 600};
      }
      break;
    }
    case 'waiting': {
      dusk = interpolate(lt, [0, len], [0.15, 0.45]);
      gx = 540;
      gPose = {...gPose, mouth: 'flat'};
      break;
    }
    case 'worried': {
      // เดินไปทางรั้ว (ขวา) ช้าๆ แล้วหยุดมอง
      dusk = 0.5;
      gx = interpolate(lt, [0, len * 0.6], [540, 760], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
      gPose = {...gPose, walking: lt < len * 0.6, mouth: 'flat', eyes: blinkNow ? 'blink' : 'open'};
      break;
    }
    case 'kidArrives': {
      gx = 330;
      const kx = interpolate(lt, [0, 2.4], [1300, 760], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
      const kWalk = lt < 2.4;
      kid = {x: kx, flip: true, pose: {kid: true, phase: phase + 1, walking: kWalk, hold: true, eyes: 'open', mouth: !kWalk && talk && lt < len - 0.5 ? 'open' : 'smile'}};
      ball = {x: kx - 0.95 * 95 * (1), y: 1462 - 512 * 0.95 + 0.95 * 175, rot: 0};
      gPose = {...gPose, eyes: lt > 3 ? 'happy' : 'open', mouth: lt > 3 ? 'smile' : 'flat'};
      break;
    }
    case 'together':
    case 'end': {
      gx = 330;
      const tt = sc.beat === 'end' ? lt + len : lt;
      kid = {x: 760, flip: true, pose: {kid: true, phase: phase + 1, walking: false, wave: interpolate(tt, [0.2, 0.6], [0, 1], {extrapolateRight: 'clamp'}), eyes: 'happy', mouth: 'smile'}};
      gPose = {...gPose, wave: interpolate(tt, [0.4, 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), eyes: 'happy', mouth: 'smile'};
      // บอลเด้งไปมาระหว่างสองคน
      const cyc = (tt * 0.8) % 2;
      const q = cyc < 1 ? cyc : 2 - cyc;
      ball = {...arc(q, 450, 1420, 650, 1420, 260), rot: tt * 300};
      break;
    }
  }

  return (
    <AbsoluteFill>
      <style>{FONT}</style>
      <Audio src={staticFile(story.audio)} />
      <Backyard cam={0} />
      {/* แสงเย็น: วันที่บอลไม่มา */}
      <AbsoluteFill style={{background: 'linear-gradient(#ffb070, #c0607a)', mixBlendMode: 'multiply', opacity: dusk}} />
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Actor x={gx} size={1.25} flip={gFlip} pose={gPose} />
        {kid && <Actor x={kid.x} size={0.95} flip={kid.flip} pose={kid.pose} />}
        {ball && <Ball {...ball} />}
      </svg>
      {S.map((s, i) => (
        <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={Math.round((s.end - s.start) * fps)}>
          <Caption lines={s.text} dur={Math.round((s.end - s.start) * fps)} />
        </Sequence>
      ))}
      <Sequence from={Math.round(S[S.length - 1].end * fps)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const EndCard = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 10, stiffness: 180}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <div style={{fontFamily: 'Kanit', fontWeight: 800, fontSize: 76, color: '#fff', WebkitTextStroke: '13px #111', paintOrder: 'stroke fill',
        transform: `scale(${s})`, textAlign: 'center', lineHeight: 1.3}}>
        แท็กคนที่ชอบบ่นใส่เรา<br /><span style={{color: '#ffd60a'}}>กดติดตามดูตอนต่อไป</span>
      </div>
    </AbsoluteFill>
  );
};
