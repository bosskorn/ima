import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, spring, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// ---- theme: แก้สี/ฟอนต์ที่นี่ที่เดียว ----
export const T = {
  white: '#ffffff', red: '#ff1f1f', yellow: '#ffd60a', stroke: '#000000',
  font: 'Kanit', weight: 800,
  pop: {damping: 9, stiffness: 220, mass: 0.6},
};

const fontCss = `
@font-face{font-family:Kanit;font-weight:800;src:url(${staticFile('kanit-thai-800-normal.woff2')});unicode-range:U+0E00-0E7F}
@font-face{font-family:Kanit;font-weight:800;src:url(${staticFile('kanit-latin-800-normal.woff2')})}`;

// ตัวหนา ขอบดำหนา แบบคลิปตัวอย่าง
const strokeStyle = (size: number, color: string): React.CSSProperties => ({
  fontFamily: T.font, fontWeight: T.weight, fontSize: size, color, lineHeight: 1.25,
  WebkitTextStroke: `${Math.round(size * 0.16)}px ${T.stroke}`, paintOrder: 'stroke fill',
  textShadow: `0 ${size * 0.06}px 0 ${T.stroke}`, whiteSpace: 'pre-wrap',
});

export type Line = {text: string; color?: 'white' | 'red' | 'yellow'};
export type Caption = {start: number; end: number; lines: Line[]}; // หน่วยวินาที
export type HookProps = {
  video?: string; // ไฟล์ใน public/ เช่น "clip.mp4" (ไม่ใส่ = พื้นหลังตัวอย่าง)
  sourceIsLandscape?: boolean; // คลิปแนวนอน -> เติมขอบด้วยภาพเบลอ
  hook: Line[]; // ข้อความเปิดคลิปกลางจอ
  hookEnd: number; // วินาทีที่ hook หายไป
  captions: Caption[]; // ข้อความ/ซับตามเวลา
};

const PopLines = ({lines, size, exitAt}: {lines: Line[]; size: number; exitAt: number}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [exitAt - 5, exitAt], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
      {lines.map((l, i) => {
        const s = spring({frame: f - i * 4, fps, config: T.pop});
        const wob = Math.sin((f - i * 4) / 9) * 0.012 * s; // ขยับเบาๆ ตอนค้างจอ
        return (
          <div key={i} style={{...strokeStyle(size, T[l.color ?? 'white']), textAlign: 'center', opacity: Math.min(1, s * 1.5) * (1 - out),
            transform: `translateY(${(1 - s) * 60}px) scale(${(0.4 + 0.6 * s) * (1 + wob) * (1 - 0.3 * out)}) rotate(${(1 - s) * -6}deg)`}}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

const Footage = ({video, landscape}: {video?: string; landscape?: boolean}) => {
  const f = useCurrentFrame();
  if (!video) return <AbsoluteFill style={{background: `linear-gradient(${160 + f * 0.3}deg,#1b263b,#415a77 50%,#0d1b2a)`}} />;
  const src = staticFile(video);
  if (!landscape) return <OffthreadVideo src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(.55)', transform: 'scale(1.2)'}} />
      <AbsoluteFill style={{justifyContent: 'center'}}>
        <OffthreadVideo src={src} style={{width: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const HookStyle = ({video, sourceIsLandscape, hook, hookEnd, captions}: HookProps) => {
  const {fps} = useVideoConfig();
  const hookFrames = Math.round(hookEnd * fps);
  return (
    <AbsoluteFill>
      <style>{fontCss}</style>
      <Footage video={video} landscape={sourceIsLandscape} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.45))'}} />
      <Sequence durationInFrames={hookFrames}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 60}}>
          <PopLines lines={hook} size={118} exitAt={hookFrames} />
        </AbsoluteFill>
      </Sequence>
      {captions.map((c, i) => {
        const from = Math.round(c.start * fps);
        const dur = Math.max(1, Math.round((c.end - c.start) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 520, paddingLeft: 70, paddingRight: 70}}>
              <PopLines lines={c.lines} size={84} exitAt={dur} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
