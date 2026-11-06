import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, spring, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

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
export type Caption = {start: number; end: number; lines: Line[]; image?: string}; // หน่วยวินาที; image = ไฟล์ใน public/
export type HookProps = {
  video?: string; // ไฟล์ใน public/ เช่น "clip.mp4" (ไม่ใส่ = พื้นหลังตัวอย่าง)
  sourceIsLandscape?: boolean; // คลิปแนวนอน -> เติมขอบด้วยภาพเบลอ
  hook: Line[]; // ข้อความเปิดคลิปกลางจอ
  hookEnd: number; // วินาทีที่ hook หายไป
  captions: Caption[]; // ข้อความ/ซับตามเวลา
  audio?: string; // เสียงพากย์ใน public/ (สร้างโดย scripts/make_video.py)
  hookImage?: string; // ภาพพื้นหลังช่วง hook
  credit?: string; // เครดิตภาพ (แสดงตัวเล็กมุมล่าง)
};

// ภาพนิ่ง + Ken Burns (ซูม/แพนช้าๆ) + เฟดเข้า
const KenBurns = ({src, dur, dir}: {src: string; dur: number; dir: number}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const fade = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade, overflow: 'hidden', background: '#000'}}>
      <img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.8) saturate(1.1)',
        transform: `scale(${1.05 + 0.1 * p}) translateX(${dir * (p - 0.5) * 40}px)`}} />
    </AbsoluteFill>
  );
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
        // ย่อฟอนต์อัตโนมัติให้อยู่บรรทัดเดียว (ไม่นับสระบน/ล่างและวรรณยุกต์ที่ไม่กินที่)
        const visible = l.text.replace(/[ัิ-ฺ็-๎]/g, '').length;
        const fit = Math.min(size, Math.floor(900 / (visible * 0.56)));
        return (
          <div key={i} style={{...strokeStyle(fit, T[l.color ?? 'white']), whiteSpace: 'nowrap', textAlign: 'center', opacity: Math.min(1, s * 1.5) * (1 - out),
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

export const HookStyle = ({video, sourceIsLandscape, hook, hookEnd, captions, audio, hookImage, credit}: HookProps) => {
  const {fps, durationInFrames} = useVideoConfig();
  const hookFrames = Math.round(hookEnd * fps);
  // ภาพประกอบค้างจนถึงฉากถัดไปที่มีภาพ (ไม่มีช่วงดำ)
  const imgs = [{start: 0, image: hookImage}, ...captions.map((c) => ({start: c.start, image: c.image}))]
    .map((x, i, arr) => ({...x, end: arr[i + 1]?.start}))
    .filter((x) => x.image);
  return (
    <AbsoluteFill>
      <style>{fontCss}</style>
      {audio && <Audio src={staticFile(audio)} />}
      <Footage video={video} landscape={sourceIsLandscape} />
      {imgs.map((x, i) => {
        const from = Math.round(x.start * fps);
        const nextImg = imgs[i + 1];
        const to = nextImg ? Math.round(nextImg.start * fps) + 6 : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <KenBurns src={x.image!} dur={to - from} dir={i % 2 ? -1 : 1} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.55))'}} />
      {credit && (
        <div style={{position: 'absolute', left: 30, right: 30, bottom: 30, fontFamily: 'sans-serif', fontSize: 18, color: 'rgba(255,255,255,.6)', textShadow: '0 1px 2px #000'}}>
          {credit}
        </div>
      )}
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
