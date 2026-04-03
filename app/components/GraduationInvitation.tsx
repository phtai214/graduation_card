'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Calendar, Clock, MapPin, Building2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   GLSL SHADERS
═══════════════════════════════════════════════════════════════ */

const STAR_VERT = /* glsl */`
  uniform float uTime;
  attribute float aSpeed;
  attribute float aBright;
  attribute float aSize;
  varying float vBright;
  void main() {
    vBright = aBright;
    float y = mod(position.y - uTime * aSpeed + 82.0, 164.0) - 82.0;
    vec4 mv = modelViewMatrix * vec4(position.x, y, position.z, 1.0);
    gl_PointSize = aSize * (225.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }`;
const STAR_FRAG = /* glsl */`
  varying float vBright;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    /* Circular core glow */
    float core = exp(-d * 9.5) + exp(-d * 3.2) * 0.35;

    /* 4-spike cross rays + 4 diagonal rays = 8-pointed star burst */
    float angle = atan(uv.y, uv.x);
    float ray4  = pow(abs(cos(angle * 2.0)), 5.5);           /* cross +  */
    float ray4b = pow(abs(cos(angle * 2.0 + 0.7854)), 7.0);  /* diagonal x */
    float rays  = (ray4 * 0.72 + ray4b * 0.28)
                  * exp(-d * 3.8)
                  * (0.30 + vBright * 0.70);

    float g = core + rays;
    float a = g * vBright * 0.94;

    /* White-hot center → blue rays → deep-blue outer */
    vec3 col = mix(vec3(0.12, 0.38, 0.92), vec3(0.82, 0.94, 1.0),
                   core * 0.75 + vBright * 0.25);
    col = mix(col, vec3(1.0), exp(-d * 24.0) * 0.55); /* bright white core */
    col += rays * vec3(0.50, 0.72, 1.0) * 0.30;        /* blue ray tint     */

    gl_FragColor = vec4(col, a);
  }`;

const BG_VERT = /* glsl */`
  uniform float uTime;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vAlpha = 0.20 + 0.18 * sin(uTime * 0.6 + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 1.8 * (200.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }`;
const BG_FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    gl_FragColor = vec4(0.38, 0.58, 0.97, exp(-d*8.5) * vAlpha);
  }`;

const COMET_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const COMET_FRAG = /* glsl */`
  varying vec2 vUv;
  uniform float uAlpha;
  void main() {
    float cx = vUv.x - 0.5;
    float t  = vUv.y;
    float halfW = mix(0.04, 0.50, pow(t, 0.55));
    float body  = smoothstep(halfW, halfW * 0.35, abs(cx));
    float bright = pow(t, 0.28);
    float headGlow = exp(-length(vec2(cx * 6.0, (t - 1.0) * 9.0)));
    float alpha = (body * bright + headGlow * 0.65) * uAlpha;
    alpha *= smoothstep(0.0, 0.04, t);
    vec3 tailCol = vec3(0.18, 0.50, 0.95);
    vec3 coreCol = vec3(0.88, 0.96, 1.00);
    vec3 color   = mix(tailCol, coreCol, pow(t, 0.42));
    color = mix(color, vec3(1.0), headGlow * 0.45);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.96));
  }`;

const GRID_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GRID_FRAG = /* glsl */`
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vec2 g = fract(vUv * 13.0);
    float line = min(min(g.x, 1.0-g.x), min(g.y, 1.0-g.y));
    float grid = smoothstep(0.04, 0.0, line);
    float scan  = sin(vUv.y * 6.0 - uTime * 0.9) * 0.5 + 0.5;
    float pulse = sin(vUv.x * 4.0 + uTime * 0.5) * 0.5 + 0.5;
    float alpha = grid * (0.048 + scan * 0.026 + pulse * 0.016);
    float edge  = smoothstep(0.75, 0.1, length(vUv - 0.5) * 1.8);
    alpha *= edge * smoothstep(0.0, 0.25, vUv.y);
    gl_FragColor = vec4(0.25, 0.50, 0.92, alpha);
  }`;

/* ═══════════════════════════════════════════════════════════════
   3D COMPONENTS
═══════════════════════════════════════════════════════════════ */

function StarRain() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const N = 5500;
  const geo = useMemo(() => {
    const p = new Float32Array(N * 3), s = new Float32Array(N),
      b = new Float32Array(N), z = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - .5) * 120;
      p[i * 3 + 1] = (Math.random() * 2 - 1) * 82;
      p[i * 3 + 2] = -2 - Math.random() * 28;
      s[i] = .55 + Math.random() * 3.1;
      b[i] = .15 + Math.random() * .85;
      z[i] = 2.0 + Math.random() * 5.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(s, 1));
    g.setAttribute('aBright', new THREE.BufferAttribute(b, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(z, 1));
    return g;
  }, []);
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <points geometry={geo}>
      <shaderMaterial ref={matRef} vertexShader={STAR_VERT} fragmentShader={STAR_FRAG}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} />
    </points>
  );
}

function BackgroundStars() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const N = 700;
  const geo = useMemo(() => {
    const p = new Float32Array(N * 3), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - .5) * 175;
      p[i * 3 + 1] = (Math.random() - .5) * 130;
      p[i * 3 + 2] = -18 - Math.random() * 50;
      ph[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    return g;
  }, []);
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <points geometry={geo}>
      <shaderMaterial ref={matRef} vertexShader={BG_VERT} fragmentShader={BG_FRAG}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} />
    </points>
  );
}

function Comet({ offset }: { offset: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const cfg = useMemo(() => {
    const deg = 28 + Math.random() * 25;
    const rad = deg * Math.PI / 180;
    return {
      sx: 18 + Math.random() * 45, sy: 14 + Math.random() * 26,
      vx: -Math.cos(rad), vy: -Math.sin(rad),
      spd: 10 + Math.random() * 13,
      len: 5.5 + Math.random() * 9,
      w: 0.08 + Math.random() * 0.08,
      rot: -(Math.PI / 2 - rad),
      delay: offset * 3.8 + Math.random() * 4.5,
      period: 10 + Math.random() * 10,
    };
  }, [offset]);
  useFrame(({ clock }) => {
    if (!ref.current || !matRef.current) return;
    const tp = (clock.getElapsedTime() - cfg.delay) % cfg.period;
    if (tp < 0) { ref.current.visible = false; return; }
    const p = tp * cfg.spd;
    ref.current.visible = tp < cfg.period - 0.8;
    ref.current.position.set(cfg.sx + cfg.vx * p, cfg.sy + cfg.vy * p, -7);
    matRef.current.uniforms.uAlpha.value =
      tp < 0.28 ? tp / 0.28 : tp > cfg.period - 1 ? (cfg.period - tp) : 1;
  });
  return (
    <mesh ref={ref} rotation={[0, 0, cfg.rot]}>
      <planeGeometry args={[cfg.w, cfg.len]} />
      <shaderMaterial ref={matRef} vertexShader={COMET_VERT} fragmentShader={COMET_FRAG}
        uniforms={{ uAlpha: { value: 1 } }} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Floating 3D Cubes (wireframe edges + subtle fill) ─────── */
type CubeCfg = {
  pos: [number, number, number]; size: number;
  rx: number; ry: number; rz: number;
  drift: number; color: string; opacity: number;
};

const CUBE_CFGS: CubeCfg[] = [
  // Close cubes — visible on sides
  { pos: [-23, 5, -11], size: 1.8, rx: 0.38, ry: 0.52, rz: 0.12, drift: 0.40, color: '#3b82f6', opacity: 0.28 },
  { pos: [23, 8, -13], size: 1.5, rx: -0.22, ry: 0.44, rz: 0.30, drift: 0.48, color: '#8b5cf6', opacity: 0.25 },
  { pos: [-19, -9, -14], size: 2.0, rx: 0.52, ry: -0.30, rz: 0.42, drift: 0.52, color: '#06b6d4', opacity: 0.22 },
  { pos: [20, -7, -15], size: 1.3, rx: 0.65, ry: 0.42, rz: -0.32, drift: 0.62, color: '#60a5fa', opacity: 0.30 },
  // Mid cubes
  { pos: [6, 14, -22], size: 3.0, rx: 0.16, ry: 0.26, rz: 0.09, drift: 0.23, color: '#3b82f6', opacity: 0.14 },
  { pos: [-15, 11, -24], size: 2.5, rx: 0.21, ry: 0.19, rz: 0.23, drift: 0.29, color: '#a78bfa', opacity: 0.16 },
  { pos: [23, -4, -20], size: 2.8, rx: 0.13, ry: 0.36, rz: -0.16, drift: 0.19, color: '#38bdf8', opacity: 0.15 },
  { pos: [-6, -12, -18], size: 1.6, rx: 0.58, ry: 0.38, rz: 0.28, drift: 0.58, color: '#7dd3fc', opacity: 0.20 },
  // Background cubes — large, faint
  { pos: [-10, 7, -34], size: 5.5, rx: 0.06, ry: 0.13, rz: 0.07, drift: 0.12, color: '#3b82f6', opacity: 0.07 },
  { pos: [12, -9, -30], size: 4.5, rx: 0.08, ry: 0.11, rz: 0.08, drift: 0.15, color: '#8b5cf6', opacity: 0.08 },
  { pos: [0, 18, -38], size: 7.0, rx: 0.04, ry: 0.09, rz: 0.05, drift: 0.09, color: '#60a5fa', opacity: 0.05 },
];

function FloatingCube({ pos, size, rx, ry, rz, drift, color, opacity }: CubeCfg) {
  const groupRef = useRef<THREE.Group>(null!);
  const y0 = pos[1];

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)),
    [size]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.x = t * rx;
    groupRef.current.rotation.y = t * ry;
    groupRef.current.rotation.z = t * rz;
    groupRef.current.position.y = y0 + Math.sin(t * drift) * 1.4;
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Glowing edges */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </lineSegments>
      {/* Subtle fill */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.1} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function BackgroundGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <mesh position={[0, -5, -32]}>
      <planeGeometry args={[140, 100]} />
      <shaderMaterial ref={matRef} vertexShader={GRID_VERT} fragmentShader={GRID_FRAG}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} />
    </mesh>
  );
}

function FloatingRing({ pos, r, tilt, spd }: { pos: [number, number, number]; r: number; tilt: number; spd: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const y0 = pos[1];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = y0 + Math.sin(t * spd) * 1.5;
    ref.current.rotation.z = t * spd * 0.35;
  });
  return (
    <mesh ref={ref} position={pos} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[r, 0.018, 8, 80]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

function GlowOrb({ p, color, spd }: { p: [number, number, number]; color: string; spd: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const y0 = p[1];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = y0 + Math.sin(t * spd) * 2.8;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = .22 + Math.sin(t * spd * 1.5) * .12;
  });
  return (
    <mesh ref={ref} position={p}>
      <sphereGeometry args={[4.5, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={.22}
        transparent opacity={.055} depthWrite={false} />
    </mesh>
  );
}

const PAGE_BG = '#c4daf2';

function Scene() {
  return (
    <>
      <color attach="background" args={[PAGE_BG]} />
      <ambientLight intensity={0.22} color="#dbeafe" />
      <pointLight position={[0, 12, 9]} color="#3b82f6" intensity={1.1} />
      <StarRain />
      <BackgroundStars />
      <BackgroundGrid />
      {CUBE_CFGS.map((c, i) => <FloatingCube key={i} {...c} />)}
      <FloatingRing pos={[-20, 5, -20]} r={6} tilt={0.3} spd={0.20} />
      <FloatingRing pos={[22, -4, -24]} r={8.5} tilt={0.55} spd={0.16} />
      <FloatingRing pos={[4, 12, -30]} r={4.5} tilt={0.9} spd={0.26} />
      <FloatingRing pos={[-10, -8, -18]} r={3} tilt={1.2} spd={0.33} />
      <GlowOrb p={[-17, 7, -26]} color="#60a5fa" spd={0.26} />
      <GlowOrb p={[18, -8, -22]} color="#a78bfa" spd={0.42} />
      <GlowOrb p={[0, 14, -30]} color="#38bdf8" spd={0.18} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <Comet key={i} offset={i} />)}
      <fog attach="fog" args={[PAGE_BG, 32, 98]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */

type Sparkle = { top: string; left?: string; right?: string; color: string; delay: string; dur: string };
const SPARKLES: Sparkle[] = [
  { top: '7%', left: '6%', color: '#60a5fa', delay: '0s', dur: '2.2s' },
  { top: '15%', right: '8%', color: '#a78bfa', delay: '0.9s', dur: '2.7s' },
  { top: '50%', left: '10%', color: '#38bdf8', delay: '1.5s', dur: '2.5s' },
  { top: '38%', right: '6%', color: '#818cf8', delay: '2.1s', dur: '2.0s' },
  { top: '70%', left: '14%', color: '#7dd3fc', delay: '2.6s', dur: '3.0s' },
  { top: '60%', right: '11%', color: '#c4b5fd', delay: '1.2s', dur: '2.6s' },
  { top: '25%', left: '5%', color: '#bfdbfe', delay: '3.1s', dur: '2.3s' },
];

const LOG = [
  { lvl: 'INFO', year: '2022', color: '#B7B7B7', msg: 'Nhập học. Màn hình sáng bừng. Hy vọng tràn đầy 🌱' },
  { lvl: 'WARN', year: '2023', color: '#f59e0b', msg: 'CTDL & GT. Linked list. Pointer -> Nước mắt' },
  { lvl: 'WARN', year: '2024', color: '#f59e0b', msg: '3AM + deadline + cà phê = đắm chìm trong coding' },
  { lvl: 'ERROR', year: '2025', color: '#ef4444', msg: '"Em add thêm feature nhé?" — 1 ngày trước bảo vệ' },
  { lvl: 'OK', year: '2026', color: '#3b82f6', msg: 'PASSED -> Đồ án approved ->  BYE UNI 🚀' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function GraduationInvitation() {
  return (
    <main className="min-h-screen overflow-x-hidden relative" style={{ backgroundColor: PAGE_BG }}>

      {/* 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 55 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Ambient CSS glow */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px]"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-24 w-[420px] h-[420px]"
          style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* ═══ BANNER CARD ═══ */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-3 sm:p-5 xl:p-8">
        <div className="w-full max-w-[1080px] relative">

          {/* Outer glow halo */}
          <div className="absolute -inset-[4px] rounded-[36px] blur-3xl -z-10 opacity-30"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)' }} />

          {/* Animated gradient border */}
          <div className="invitation-border rounded-[28px] sm:rounded-[32px] p-[2px]">
            <div className="rounded-[27px] sm:rounded-[31px] overflow-hidden flex flex-col lg:flex-row shadow-2xl">

              {/* ╔════════════════════════════╗
                  ║   LEFT PANEL — dark        ║
                  ╚════════════════════════════╝ */}
              <div className="lg:w-[40%] relative overflow-hidden flex flex-col items-center
                              justify-between py-10 px-8 sm:py-14 lg:py-14
                              banner-left min-h-[260px] sm:min-h-[300px] lg:min-h-0">

                {/* Aurora */}
                <div className="aurora aurora-1" />
                <div className="aurora aurora-2" />
                <div className="aurora aurora-3" />

                {/* Geometric rings */}
                <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full ring-deco" />
                <div className="absolute -top-8  -right-8  w-38 h-38 rounded-full ring-deco-sm" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full ring-deco-alt" />

                {/* Sparkles */}
                {SPARKLES.map((s, i) => (
                  <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-ping"
                    style={{
                      top: s.top, left: s.left, right: s.right,
                      backgroundColor: s.color, animationDelay: s.delay,
                      animationDuration: s.dur, opacity: 0.6
                    }} />
                ))}

                {/* ── Hero text ── */}
                <div className="relative z-10 text-center flex flex-col items-center">
                  <div className="floating-emoji leading-none mb-4"
                    style={{ fontSize: 'clamp(64px, 9vw, 92px)' }}>
                    🎓
                  </div>
                  <p className="text-sky-300/55 text-[9px] font-bold tracking-[0.65em] uppercase mb-3">
                    G R A D U A T I O N
                  </p>
                  <h1 className="text-white font-black leading-[1.05] tracking-[0.05em] text-center hero-title">
                    LỄ TỐT<br className="hidden sm:block" /> NGHIỆP
                  </h1>
                  <div className="flex items-center gap-3 mt-3.5">
                    <div className="h-[1.5px] w-12 rounded"
                      style={{ background: 'linear-gradient(to right, transparent, rgba(147,197,253,0.75))' }} />
                    <span className="text-sky-200 font-bold tracking-[0.42em]"
                      style={{ fontSize: 'clamp(13px, 2vw, 16px)' }}>2026</span>
                    <div className="h-[1.5px] w-12 rounded"
                      style={{ background: 'linear-gradient(to left, transparent, rgba(147,197,253,0.75))' }} />
                  </div>
                </div>

                {/* ── Mini stats ── */}
                <div className="relative z-10 mt-7 w-full flex rounded-2xl overflow-hidden stats-box">
                  {[
                    { v: '4', l: 'NĂM' },
                    { v: '∞', l: 'BUGS' },
                    { v: '1', l: 'BẰNG' },
                  ].map((s, i) => (
                    <div key={i} className={`flex-1 text-center py-3.5 ${i > 0 ? 'border-l stats-divider' : ''}`}>
                      <p className="text-white font-black leading-none"
                        style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}>{s.v}</p>
                      <p className="text-sky-300/55 font-bold tracking-[0.28em] mt-1"
                        style={{ fontSize: '8px' }}>{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* ── School badge — MORE PROMINENT ── */}
                <div className="relative z-10 mt-5 w-full rounded-2xl school-badge-dark">
                  <div className="flex items-center gap-3.5 px-5 py-4">
                    <div className="school-icon-wrap flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3L2 9l10 6 10-6-10-6z"
                          stroke="#fbbf24" strokeWidth="2" fill="rgba(251,191,36,0.2)" />
                        <path d="M6 12.5v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"
                          stroke="#fbbf24" strokeWidth="2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-yellow tracking-[0.3em] uppercase leading-tight badge-huflit-text"
                        style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }}>HUFLIT</p>
                      <p className="text-white/70 leading-tight mt-0.5"
                        style={{ fontSize: 'clamp(9.5px, 1.2vw, 11px)', letterSpacing: '0.08em' }}>
                        Khoa Công nghệ Thông tin
                      </p>
                      <p className="text-white/50 leading-tight mt-0.5"
                        style={{ fontSize: 'clamp(9px, 1.1vw, 10px)', letterSpacing: '0.06em' }}>
                        K28 · 2022 – 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden lg:block w-[1px] my-10 flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(37,99,235,0.2) 25%, rgba(124,58,237,0.2) 75%, transparent)' }} />
              {/* Horizontal divider mobile */}
              <div className="lg:hidden h-[1px] mx-7"
                style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.2), rgba(124,58,237,0.2), transparent)' }} />

              {/* ╔════════════════════════════╗
                  ║   RIGHT PANEL — white      ║
                  ╚════════════════════════════╝ */}
              <div className="flex-1 bg-white flex flex-col gap-4 sm:gap-5
                              p-6 sm:p-8 lg:p-10 xl:p-11">

                {/* ── Name ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="h-[2.5px] w-5 rounded-full"
                      style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
                    <p className="text-blue-500/55 font-black tracking-[0.55em] uppercase"
                      style={{ fontSize: 'clamp(8px, 1.1vw, 10px)' }}>
                      Trân trọng kính mời
                    </p>
                  </div>
                  <h2 className="gradient-name font-black leading-[1.06] tracking-tight"
                    style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
                    Nguyễn Phước Tài
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge-major">Cử nhân Công nghệ Thông tin</span>
                    <span className="badge-year">K28 · 2022–2026</span>
                    <span className="badge-live">🟢 Đã tốt nghiệp</span>
                  </div>
                </div>

                {/* ── Dev Log ── */}
                <div className="dev-log rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 log-titlebar">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <code className="text-slate-600 ml-2"
                      style={{ fontSize: 'clamp(9px, 1.1vw, 10.5px)' }}>
                      graduation.log — 4 years in 5 lines
                    </code>
                  </div>
                  <div className="px-4 py-3 sm:py-3.5 space-y-2 sm:space-y-2.5">
                    {LOG.map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 font-mono">
                        <span className="font-bold mt-0.5 flex-shrink-0 w-10 text-right"
                          style={{ color: line.color, fontSize: 'clamp(9px, 1.1vw, 10px)' }}>
                          {line.lvl}
                        </span>
                        <span className="text-slate-700/55 mt-0.5 flex-shrink-0"
                          style={{ fontSize: 'clamp(9px, 1.1vw, 10px)' }}>{line.year}</span>
                        <span className="text-slate-700 leading-snug"
                          style={{ fontSize: 'clamp(11.5px, 1.4vw, 13px)' }}>{line.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1.5px] rounded"
                    style={{ background: 'linear-gradient(to right, rgba(37,99,235,0.2), transparent)' }} />
                  <span className="text-slate-300 tracking-[0.4em]" style={{ fontSize: '13px' }}>· · ·</span>
                  <div className="flex-1 h-[1.5px] rounded"
                    style={{ background: 'linear-gradient(to left, rgba(37,99,235,0.2), transparent)' }} />
                </div>

                {/* ── Event info ── */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">

                  {/* Date */}
                  <div className="event-card event-time rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 icon-time">
                        <Calendar size={17} strokeWidth={2} color="white" />
                      </div>
                      <span className="text-blue-600 font-black tracking-[0.35em] uppercase"
                        style={{ fontSize: 'clamp(8px, 1vw, 9.5px)' }}>Thời gian</span>
                    </div>
                    <p className="text-slate-400 font-semibold leading-none"
                      style={{ fontSize: 'clamp(11px, 1.3vw, 12.5px)' }}>Thứ Hai</p>
                    <p className="text-blue-700 font-black leading-tight tracking-tight mt-1"
                      style={{ fontSize: 'clamp(20px, 2.6vw, 26px)' }}>
                      06 · 04 · 2026
                    </p>
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-full w-fit time-pill">
                      <Clock size={12} strokeWidth={2.5} color="white" />
                      <span className="text-white font-extrabold"
                        style={{ fontSize: 'clamp(11px, 1.4vw, 13px)' }}>15:00 chiều</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="event-card event-location rounded-xl sm:rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 icon-location">
                        <MapPin size={17} strokeWidth={2} color="white" />
                      </div>
                      <span className="text-violet-600 font-black tracking-[0.35em] uppercase"
                        style={{ fontSize: 'clamp(8px, 1vw, 9.5px)' }}>Địa điểm</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Building2 size={12} strokeWidth={2} color="#7c3aed" className="flex-shrink-0 mt-0.5" />
                      <p className="text-slate-800 font-extrabold leading-tight"
                        style={{ fontSize: 'clamp(12px, 1.5vw, 15px)' }}>
                        Hội trường cơ sở Hóc Môn
                      </p>
                    </div>
                    <p className="text-violet-600 font-bold mt-0.5"
                      style={{ fontSize: 'clamp(12px, 1.5vw, 14px)' }}>HUFLIT</p>
                    <p className="text-slate-500 mt-1.5 leading-relaxed"
                      style={{ fontSize: 'clamp(10.5px, 1.3vw, 12px)' }}>
                      806 Lê Quang Đạo<br />
                      Xã Hóc Môn, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                {/* ── CTA ── */}
                <button className="cta-button w-full rounded-xl sm:rounded-2xl font-black text-white
                                   tracking-[0.12em] py-4 sm:py-[18px]"
                  style={{ fontSize: 'clamp(13px, 1.7vw, 17px)' }}>
                  <span className="flex items-center justify-center gap-3">
                    <span style={{ fontSize: '1.25em' }}>🎉</span>
                    <span>XÁC NHẬN SẼ THAM GIA</span>
                    <span style={{ fontSize: '1.25em' }}>🎊</span>
                  </span>
                </button>

                {/* Footer */}
                <div className="flex items-center gap-3 -mt-1">
                  <div className="flex-1 h-px rounded-full"
                    style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.18))' }} />
                  <p className="text-slate-400 tracking-[0.22em] text-center flex-shrink-0"
                    style={{ fontSize: 'clamp(9px, 1.05vw, 10.5px)' }}>
                    ✦ Với tất cả niềm tự hào · Nguyễn Phước Tài ✦
                  </p>
                  <div className="flex-1 h-px rounded-full"
                    style={{ background: 'linear-gradient(to left, transparent, rgba(37,99,235,0.18))' }} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
