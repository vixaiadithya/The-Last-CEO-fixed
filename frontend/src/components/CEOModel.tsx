import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getAudioCtx } from '@/lib/audio';

type CEOModelProps = {
  archetype?: string;
  mood?: 'default' | 'victory' | 'bankruptcy' | 'singularity';
  playable?: boolean;
  selectedStation?: string;
  onStationChange?: (station: string) => void;
  quarter?: number;
};

// Footstep trail tuning
const FOOT_COUNT = 24;      // pooled footprint meshes
const STEP_INTERVAL = 0.8;  // world units between strides
const FOOT_LIFE = 1.7;      // seconds before a print fully fades

// --- Footstep audio (synthesized via Web Audio, no asset files) ---
const playFootstep = (side: number) => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;

  // Master bus for the step
  const out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(ctx.destination);

  // Mid-range "body" click — pitched so it carries on laptop speakers,
  // alternating per foot for a natural gait
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  const base = side > 0 ? 240 : 200;
  osc.frequency.setValueAtTime(base + Math.random() * 20, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.13);

  // Bandpassed noise burst for the "scuff" texture
  const dur = 0.06;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.28, t);
  nGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2600;
  bp.Q.value = 0.8;
  noise.connect(bp).connect(nGain).connect(out);
  noise.start(t);
  noise.stop(t + dur);
};

// 3D Isometric Camera Controller
const CameraController = ({ playable }: { playable: boolean }) => {
  const { camera } = useThree();
  useEffect(() => {
    if (playable) {
      // Pulled back and tilted down for an isometric view of the room
      camera.position.set(0, 5.2, 5.8);
      camera.lookAt(0, -0.6, -1.8);
    } else {
      // Standard view of the CEO model — pulled back and centered so the full figure fits the frame
      camera.position.set(0, 1.3, 4.6);
      camera.lookAt(0, 0.75, 0);
    }
    camera.updateProjectionMatrix();
  }, [playable, camera]);
  return null;
};

// Glowing floor tiles randomly lighting up the room
const GlowingFloorTiles = () => {
  const count = 20; // Number of glowing tiles
  const tilesRef = useRef<any[]>([]);

  // Random starting positions and phases
  const tileData = useRef(Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 18) - 9 + 0.5,
    z: Math.floor(Math.random() * 18) - 9 + 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: 4.0 + Math.random() * 4.0,
    color: Math.random() > 0.5 ? '#06b6d4' : '#10b981' // cyan or emerald
  })));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    tilesRef.current.forEach((tile, i) => {
      if (!tile) return;
      const data = tileData.current[i];
      // pulsing opacity
      const opacity = (Math.sin(time * data.speed + data.phase) + 1) / 2;
      tile.material.opacity = opacity * 0.3;

      // Randomly move invisible tiles
      if (opacity < 0.1 && Math.random() < 0.04) {
        data.x = Math.floor(Math.random() * 18) - 9 + 0.5;
        data.z = Math.floor(Math.random() * 18) - 9 + 0.5;
        tile.position.set(data.x, -0.395, data.z);
      }
    });
  });

  return (
    <group position={[0, 0, -1.5]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (tilesRef.current[i] = el)}
          position={[tileData.current[i].x, -0.395, tileData.current[i].z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.95, 0.95]} />
          <meshBasicMaterial color={tileData.current[i].color} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

// 3D Office Environment Stations
const OfficeRoom = ({ selectedStation }: { selectedStation?: string }) => {
  return (
    <group>
      {/* Cyberpunk Neon Floor Grid */}
      <gridHelper args={[18, 18, '#06b6d4', '#1e293b']} position={[0, -0.4, -1.5]} />
      <GlowingFloorTiles />

      {/* Red Warning Boundary Line */}
      <group position={[0, -0.39, -2.0]}>
        {/* Top Edge (Back) */}
        <mesh position={[0, 0, -6]}>
          <boxGeometry args={[16, 0.05, 0.1]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
        {/* Bottom Edge (Front) */}
        <mesh position={[0, 0, 6]}>
          <boxGeometry args={[16, 0.05, 0.1]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
        {/* Left Edge */}
        <mesh position={[-8, 0, 0]}>
          <boxGeometry args={[0.1, 0.05, 12]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
        {/* Right Edge */}
        <mesh position={[8, 0, 0]}>
          <boxGeometry args={[0.1, 0.05, 12]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Office Back Wall */}
      <mesh position={[0, 1.5, -8.2]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Neon Back Wall Glowing Trim */}
      <mesh position={[0, 1.2, -8.15]}>
        <boxGeometry args={[20, 0.04, 0.04]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[0, 0.1, -8.15]}>
        <boxGeometry args={[20, 0.04, 0.04]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* 1. HR Operations Desk (Left Zone) */}
      <group position={[-2.8, -0.4, -0.6]}>
        {/* Floor Indicator Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={selectedStation === 'hr' ? [0.88, 1.02, 32] : [0.92, 1.0, 32]} />
          <meshBasicMaterial color={selectedStation === 'hr' ? '#6ee7b7' : '#10b981'} side={2} transparent opacity={selectedStation === 'hr' ? 1.0 : 0.3} />
        </mesh>

        {/* Spot/Point Light */}
        <pointLight position={[0, 1, 0]} color="#10b981" intensity={selectedStation === 'hr' ? 3.5 : 2} distance={3.5} />

        {/* Desk Mesh */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#064e3b" roughness={0.4} />
        </mesh>

        {/* Hologram Terminal Monitor */}
        <mesh position={[0, 0.9, 0.1]}>
          <boxGeometry args={[0.6, 0.35, 0.05]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <mesh position={[0, 0.82, 0.1]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Floating Sector Label Sign */}
        <group position={[0, 1.4, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.25, 0.1]} />
            <meshStandardMaterial color="#064e3b" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[0.8, 0.16, 0.01]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      </group>

      {/* 2. ML Server Cluster (Right Zone) */}
      <group position={[2.8, -0.4, -0.6]}>
        {/* Floor Indicator Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={selectedStation === 'ml' ? [0.88, 1.02, 32] : [0.92, 1.0, 32]} />
          <meshBasicMaterial color={selectedStation === 'ml' ? '#67e8f9' : '#06b6d4'} side={2} transparent opacity={selectedStation === 'ml' ? 1.0 : 0.3} />
        </mesh>

        {/* Spot/Point Light */}
        <pointLight position={[0, 1.2, 0]} color="#06b6d4" intensity={selectedStation === 'ml' ? 3.5 : 2} distance={3.5} />

        {/* Main Server Tower Mesh */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.8, 1.6, 0.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.8} />
        </mesh>

        {/* Glowing Server Status Indicator Bulbs */}
        <mesh position={[0, 1.3, 0.41]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[0, 1.1, 0.41]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[0, 0.9, 0.41]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, 0.7, 0.41]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[0, 0.5, 0.41]}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Floating Sector Label Sign */}
        <group position={[0, 1.8, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.25, 0.1]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[0.8, 0.16, 0.01]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </group>
      </group>

      {/* 3. Executive Boardroom Table (Center Forward Zone) */}
      <group position={[0, -0.4, -3.2]}>
        {/* Floor Indicator Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={selectedStation === 'boardroom' ? [1.18, 1.32, 32] : [1.22, 1.3, 32]} />
          <meshBasicMaterial color={selectedStation === 'boardroom' ? '#fcd34d' : '#fbbf24'} side={2} transparent opacity={selectedStation === 'boardroom' ? 1.0 : 0.3} />
        </mesh>

        {/* Spot/Point Light */}
        <pointLight position={[0, 1.2, 0]} color="#fbbf24" intensity={selectedStation === 'boardroom' ? 4.0 : 2.5} distance={4} />

        {/* Large Table Mesh */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[2.2, 0.6, 1.0]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Hologram Board Projector Screen Glow */}
        <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.7]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} />
        </mesh>

        {/* Office Chairs */}
        <mesh position={[-1.3, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[1.3, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.8, 0.3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Floating Sector Label Sign */}
        <group position={[0, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[1.0, 0.25, 0.1]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[0.9, 0.16, 0.01]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// Internal Character Component inside the Canvas
const CEOCharacter = ({
  archetype = 'researcher',
  mood = 'default',
  playable = false,
  onStationChange,
  quarter = 1
}: CEOModelProps) => {
  const groupRef = useRef<any>();
  const bodyGroupRef = useRef<any>();
  const leftLegRef = useRef<any>();
  const rightLegRef = useRef<any>();
  const leftArmRef = useRef<any>();
  const rightArmRef = useRef<any>();

  // Player position states (cached in refs for 60fps performance inside useFrame)
  const playerPos = useRef({ x: 0, z: 0 });
  const playerRot = useRef(0);
  const lastStation = useRef('none');
  const moveKeys = useRef({ forward: false, backward: false, left: false, right: false });
  const joystickRef = useRef({ x: 0, y: 0 });

  // Footstep trail (refs to avoid re-renders inside the 60fps loop)
  const footRefs = useRef<any[]>([]);
  const footMeta = useRef(Array.from({ length: FOOT_COUNT }, () => ({ born: -1e9, x: 0, z: 0, rot: 0 })));
  const footCursor = useRef(0);
  const distTravelled = useRef(0);
  const lastStepDist = useRef(0);
  const stepSide = useRef(1);

  const chairRef = useRef<any>();
  const deskRef = useRef<any>();
  const chairSpinTarget = useRef(0);
  const hasMoved = useRef(false);

  useEffect(() => {
    if (playable) {
      hasMoved.current = false;
      if (chairRef.current) chairRef.current.visible = true;
      if (deskRef.current) deskRef.current.visible = true;
      playerPos.current = { x: 0, z: 2.5 };
      playerRot.current = Math.PI; // Face the stations
      if (groupRef.current) {
        groupRef.current.position.set(0, -0.4, 2.5);
        groupRef.current.rotation.y = Math.PI; // Face the stations
      }
    } else {
      // Hide chair and desk in menus/selection screens
      if (chairRef.current) chairRef.current.visible = false;
      if (deskRef.current) deskRef.current.visible = false;
    }
  }, [quarter, playable]);

  useEffect(() => {
    if (!playable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable movement inputs if user is currently typing in an input element
      const el = document.activeElement;
      const isInputActive = el && (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.hasAttribute('contenteditable')
      );
      if (isInputActive) return;

      const key = e.key.toLowerCase();

      const isForward = key === 'arrowup' || key === 'w';
      const isBackward = key === 'arrowdown' || key === 's';
      const isLeft = key === 'arrowleft' || key === 'a';
      const isRight = key === 'arrowright' || key === 'd';

      if (isForward || isBackward || isLeft || isRight) {
        e.preventDefault();
      }

      if (isForward) moveKeys.current.forward = true;
      if (isBackward) moveKeys.current.backward = true;
      if (isLeft) moveKeys.current.left = true;
      if (isRight) moveKeys.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      const isForward = key === 'arrowup' || key === 'w';
      const isBackward = key === 'arrowdown' || key === 's';
      const isLeft = key === 'arrowleft' || key === 'a';
      const isRight = key === 'arrowright' || key === 'd';

      if (isForward) moveKeys.current.forward = false;
      if (isBackward) moveKeys.current.backward = false;
      if (isLeft) moveKeys.current.left = false;
      if (isRight) moveKeys.current.right = false;
    };

    const handleJoystickMove = (e: any) => {
      joystickRef.current = { x: e.detail.x, y: e.detail.y };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('joystickMove', handleJoystickMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('joystickMove', handleJoystickMove);
    };
  }, [playable]);

  useFrame((state, delta) => {
    // Smoothly spin the chair if clicked
    if (chairRef.current) {
      chairRef.current.rotation.y += (chairSpinTarget.current - chairRef.current.rotation.y) * 5 * delta;
    }
    if (bodyGroupRef.current) {
      if (!hasMoved.current && playable) {
        bodyGroupRef.current.rotation.y += (chairSpinTarget.current - bodyGroupRef.current.rotation.y) * 5 * delta;
      } else {
        const diff = 0 - bodyGroupRef.current.rotation.y;
        const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        bodyGroupRef.current.rotation.y += normalizedDiff * 10 * delta;
      }
    }

    if (groupRef.current) {
      if (playable) {
        // 1. Keyboard direction polling
        let dx = 0;
        let dz = 0;

        if (moveKeys.current.forward) dz -= 1;
        if (moveKeys.current.backward) dz += 1;
        if (moveKeys.current.left) dx -= 1;
        if (moveKeys.current.right) dx += 1;

        // Add joystick contribution (y is vertical on screen, which maps to z on floor)
        dx += joystickRef.current.x;
        dz += joystickRef.current.y;

        // Diagonal normalization
        if (dx !== 0 && dz !== 0) {
          const len = Math.sqrt(dx * dx + dz * dz);
          if (len > 1) { // Only normalize if vector length is > 1 to allow analog slow movement
            dx /= len;
            dz /= len;
          }
        }

        const isMoving = dx !== 0 || dz !== 0;
        const speed = 3.0; // Units per second

        if (isMoving) {
          playerPos.current.x += dx * speed * delta;
          playerPos.current.z += dz * speed * delta;

          // Limit boundaries within the expanded office grid room bounds
          let hitBoundary = false;
          if (playerPos.current.x <= -8.0 || playerPos.current.x >= 8.0 || playerPos.current.z <= -8.0 || playerPos.current.z >= 4.0) {
            hitBoundary = true;
          }
          playerPos.current.x = Math.max(-8.0, Math.min(8.0, playerPos.current.x));
          playerPos.current.z = Math.max(-8.0, Math.min(4.0, playerPos.current.z));

          if (hitBoundary && onStationChange) {
            // We can reuse onStationChange to send a special string, or use a new prop.
            // A special station string 'boundary' is easiest.
            onStationChange('boundary');
          }

          // Set rotation target direction angle
          playerRot.current = Math.atan2(dx, dz);

          // Drop a glowing footprint every stride, alternating left/right foot
          distTravelled.current += speed * delta;
          if (distTravelled.current - lastStepDist.current >= STEP_INTERVAL) {
            lastStepDist.current = distTravelled.current;
            const rot = playerRot.current;
            const fx = Math.sin(rot), fz = Math.cos(rot);  // forward vector
            const px = Math.cos(rot), pz = -Math.sin(rot); // lateral vector
            const m = footMeta.current[footCursor.current];
            m.born = state.clock.getElapsedTime();
            m.x = playerPos.current.x + px * 0.13 * stepSide.current - fx * 0.05;
            m.z = playerPos.current.z + pz * 0.13 * stepSide.current - fz * 0.05;
            m.rot = rot;
            footCursor.current = (footCursor.current + 1) % FOOT_COUNT;
            playFootstep(stepSide.current);
            stepSide.current *= -1;
          }
        }

        if (isMoving && !hasMoved.current) {
          hasMoved.current = true;
          if (chairRef.current) chairRef.current.visible = false;
          if (deskRef.current) deskRef.current.visible = false;
        }

        // Apply updated absolute coordinates
        groupRef.current.position.set(playerPos.current.x, -0.4, playerPos.current.z);

        // Smooth rotation interpolation (prevent snapping)
        const diff = playerRot.current - groupRef.current.rotation.y;
        const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        groupRef.current.rotation.y += normalizedDiff * 0.18;

        // Walking / Bobbing skeletal animation logic
        if (isMoving) {
          const walkTime = state.clock.getElapsedTime() * 12;
          if (leftLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(walkTime) * 0.6;
            leftLegRef.current.position.set(-0.2, 0.6, 0);
          }
          if (rightLegRef.current) {
            rightLegRef.current.rotation.x = -Math.sin(walkTime) * 0.6;
            rightLegRef.current.position.set(0.2, 0.6, 0);
          }
          if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(walkTime) * 0.6;
          if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(walkTime) * 0.6;
          if (bodyGroupRef.current) bodyGroupRef.current.position.y = Math.abs(Math.sin(walkTime)) * 0.08;
        } else if (playable && !hasMoved.current) {
          // Sitting animation
          if (leftLegRef.current) {
            leftLegRef.current.rotation.x = -Math.PI / 2 + 0.1;
            leftLegRef.current.position.set(-0.2, 0.55, 0.3);
          }
          if (rightLegRef.current) {
            rightLegRef.current.rotation.x = -Math.PI / 2 + 0.1;
            rightLegRef.current.position.set(0.2, 0.55, 0.3);
          }
          if (leftArmRef.current) leftArmRef.current.rotation.x = -0.2;
          if (rightArmRef.current) rightArmRef.current.rotation.x = -0.2;
          if (bodyGroupRef.current) bodyGroupRef.current.position.y = -0.15;
        } else {
          // Idle breathing subtle animation
          const idleTime = state.clock.getElapsedTime() * 2;
          if (leftLegRef.current) {
            leftLegRef.current.rotation.x = 0;
            leftLegRef.current.position.set(-0.2, 0.6, 0);
          }
          if (rightLegRef.current) {
            rightLegRef.current.rotation.x = 0;
            rightLegRef.current.position.set(0.2, 0.6, 0);
          }
          if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
          if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
          if (bodyGroupRef.current) bodyGroupRef.current.position.y = Math.sin(idleTime) * 0.02;
        }

        // Fade & place the footprint trail
        const nowT = state.clock.getElapsedTime();
        for (let i = 0; i < FOOT_COUNT; i++) {
          const fm = footRefs.current[i];
          if (!fm) continue;
          const meta = footMeta.current[i];
          const age = nowT - meta.born;
          if (age >= 0 && age < FOOT_LIFE) {
            const t = 1 - age / FOOT_LIFE;
            fm.visible = true;
            fm.position.set(meta.x, -0.39, meta.z);
            fm.rotation.set(-Math.PI / 2, 0, meta.rot);
            fm.material.opacity = t * 0.5;
            const sc = 1.1 - t * 0.2;
            fm.scale.set(sc, sc, sc);
          } else if (fm.visible) {
            fm.visible = false;
          }
        }

        // 2. Station distance logic checks
        const dHR = Math.sqrt(Math.pow(playerPos.current.x - (-2.8), 2) + Math.pow(playerPos.current.z - (-0.6), 2));
        const dML = Math.sqrt(Math.pow(playerPos.current.x - 2.8, 2) + Math.pow(playerPos.current.z - (-0.6), 2));
        const dBoard = Math.sqrt(Math.pow(playerPos.current.x - 0, 2) + Math.pow(playerPos.current.z - (-3.2), 2));

        let currentStation = 'none';
        if (dHR < 1.6) {
          currentStation = 'hr';
        } else if (dML < 1.6) {
          currentStation = 'ml';
        } else if (dBoard < 1.8) {
          currentStation = 'boardroom';
        }

        if (currentStation !== lastStation.current) {
          lastStation.current = currentStation;
          if (onStationChange) {
            onStationChange(currentStation);
          }
        }
      } else {
        // Continuous rotation for static viewports
        groupRef.current.rotation.y += 0.006;

        // Gentle floating animation (bobbing up and down)
        if (mood === 'singularity') {
          groupRef.current.position.y = -0.4 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15;
        } else {
          groupRef.current.position.y = -0.4 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
        }
      }
    }
  });

  // Cosmetic skin definitions (appearance only — no gameplay effect)
  let suitColor = '#1e293b'; // Slate 800
  let tieColor = '#f43f5e';  // Rose 500
  let skinColor = '#fed7aa'; // Peach skin
  let eyeColor = '#06b6d4';  // Cyan visor
  let hairColor = '#1e293b'; // Hair / helmet block
  let accessoryColor = '';
  let handTattoo = '';

  switch (archetype) {
    case 'cyberpunk': // Cyberpunk Executive — magenta neon
      suitColor = '#241531';
      tieColor = '#ec4899';
      eyeColor = '#f0abfc';
      hairColor = '#0f0a18';
      accessoryColor = '#ec4899';
      handTattoo = 'H';
      break;
    case 'researcher': // AI Researcher — lab white + cyan glasses
      suitColor = '#e2e8f0';
      tieColor = '#0891b2';
      eyeColor = '#22d3ee';
      hairColor = '#1e293b';
      handTattoo = 'K';
      break;
    case 'quant': // Quant Trader — dark suit, ticker green
      suitColor = '#0f172a';
      tieColor = '#22c55e';
      eyeColor = '#4ade80';
      hairColor = '#0b1220';
      handTattoo = 'SA';
      break;
    case 'stealth': // Stealth Agent — all black + hat
      suitColor = '#0a0a0a';
      tieColor = '#334155';
      eyeColor = '#e2e8f0';
      hairColor = '#000000';
      handTattoo = 'A';
      break;
    case 'space': // Space Entrepreneur — white suit, violet helmet
      suitColor = '#e2e8f0';
      tieColor = '#a855f7';
      eyeColor = '#7c3aed';
      hairColor = '#cbd5e1';
      accessoryColor = '#a855f7';
      handTattoo = 'SH';
      break;
    case 'hacker': // Hacker — dark hoodie, matrix green
      suitColor = '#0a0f0a';
      tieColor = '#16a34a';
      eyeColor = '#4ade80';
      hairColor = '#020617';
      accessoryColor = '#16a34a';
      handTattoo = 'X';
      break;
  }

  // Adjustments based on mood
  let headRotationX = 0;
  let headPositionY = 1.7;
  let leftArmRotationZ = 0;
  let rightArmRotationZ = 0;
  let spineRotationX = 0;

  if (mood === 'bankruptcy') {
    suitColor = '#0f172a'; // Faded out
    tieColor = '#475569';
    eyeColor = '#dc2626';  // Error red deactivated eyes
    headRotationX = 0.5;   // Slouched head
    headPositionY = 1.5;
    leftArmRotationZ = 0.2;  // Limp arms
    rightArmRotationZ = -0.2;
    spineRotationX = 0.15;
  } else if (mood === 'victory') {
    accessoryColor = '#fbbf24'; // Golden halo/crown
  } else if (mood === 'singularity') {
    suitColor = '#0284c7';  // Fully digitized sky-blue
    tieColor = '#06b6d4';
    eyeColor = '#22c55e';   // Glowing matrix green
    skinColor = '#0c4a6e';  // Transparent digital blue
  }

  return (
    <>
      <group ref={groupRef} position={[0, -0.4, 0]}>
        {/* CEO Chair - visible only when sitting */}
        <group 
          ref={chairRef} 
          position={[0, 0, -0.35]} 
          visible={playable && !hasMoved.current}
          onClick={(e) => { e.stopPropagation(); chairSpinTarget.current += Math.PI * 2; }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          {/* Seat Base */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.7, 0.15, 0.7]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.4} transparent opacity={0.85} roughness={0.1} />
          </mesh>

          {/* Backrest */}
          <mesh position={[0, 0.95, -0.28]}>
            <boxGeometry args={[0.65, 1.0, 0.15]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.4} transparent opacity={0.85} roughness={0.1} />
          </mesh>

          {/* Headrest */}
          <mesh position={[0, 1.55, -0.22]}>
            <boxGeometry args={[0.4, 0.2, 0.1]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} transparent opacity={0.9} roughness={0.2} />
          </mesh>

          {/* Backrest Frame/Support (Cyan glow) */}
          <mesh position={[0, 0.95, -0.37]}>
            <boxGeometry args={[0.1, 0.8, 0.05]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>

          {/* Left Armrest */}
          <group position={[-0.4, 0.65, 0.05]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.5]} />
              <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.3} transparent opacity={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.15, -0.15]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#00E5FF" metalness={0.8} />
            </mesh>
          </group>

          {/* Right Armrest */}
          <group position={[0.4, 0.65, 0.05]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.5]} />
              <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.3} transparent opacity={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.15, -0.15]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#00E5FF" metalness={0.8} />
            </mesh>
          </group>

          {/* Stem */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
            <meshStandardMaterial color="#00E5FF" metalness={0.9} roughness={0.1} emissive="#00E5FF" emissiveIntensity={0.2} />
          </mesh>

          {/* Star Base */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={`base-${i}`} position={[0, 0.05, 0]} rotation={[0, (Math.PI * 2 / 5) * i, 0]}>
              <boxGeometry args={[0.08, 0.04, 0.6]} />
              <meshStandardMaterial color="#00E5FF" metalness={0.8} emissive="#00E5FF" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>

        {/* CEO Personal Desk - visible only when sitting */}
        <group ref={deskRef} position={[0, 0, 0.6]} visible={playable && !hasMoved.current}>
          {/* Desk Surface */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[2.2, 0.05, 0.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          {/* Glowing Desk Edge */}
          <mesh position={[0, 0.75, -0.28]}>
            <boxGeometry args={[2.22, 0.01, 0.02]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          <mesh position={[0, 0.75, 0.28]}>
            <boxGeometry args={[2.22, 0.01, 0.02]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
          {/* Desk Legs */}
          <mesh position={[-1.0, 0.375, 0]}>
            <boxGeometry args={[0.05, 0.75, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} />
          </mesh>
          <mesh position={[1.0, 0.375, 0]}>
            <boxGeometry args={[0.05, 0.75, 0.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} />
          </mesh>

          {/* Papers */}
          <mesh position={[-0.6, 0.78, 0.05]} rotation={[0, 0.15, 0]}>
            <boxGeometry args={[0.22, 0.01, 0.28]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          <mesh position={[-0.55, 0.79, -0.05]} rotation={[0, -0.1, 0]}>
            <boxGeometry args={[0.22, 0.01, 0.28]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
          </mesh>
          <mesh position={[-0.58, 0.8, 0]} rotation={[0, 0.05, 0]}>
            <boxGeometry args={[0.22, 0.01, 0.28]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>

          {/* Luxury Pen */}
          <mesh position={[-0.4, 0.78, 0.15]} rotation={[Math.PI / 2, 0, 0.6]}>
            <cylinderGeometry args={[0.006, 0.006, 0.14, 8]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* CEO Coffee Mug */}
          <group position={[0.7, 0.78, 0.1]}>
            {/* Mug Body */}
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
            {/* Mug Handle */}
            <mesh position={[0.04, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.03, 0.01, 8, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
            {/* Coffee Liquid */}
            <mesh position={[0, 0.118, 0]}>
              <cylinderGeometry args={[0.036, 0.036, 0.005, 16]} />
              <meshStandardMaterial color="#3E2723" roughness={0.8} />
            </mesh>
            {/* CEO Text */}
            <Text
              position={[-0.041, 0.06, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              fontSize={0.04}
              color="#020617"
              fontWeight={900}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.05}
            >
              CEO
            </Text>
          </group>

          {/* Holographic Tablet Display */}
          <mesh position={[0, 0.95, 0.0]} rotation={[0.5, 0, 0]}>
            <planeGeometry args={[0.7, 0.35]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.25} side={2} />
          </mesh>
          <mesh position={[0, 0.95, -0.001]} rotation={[0.5, 0, 0]}>
            <planeGeometry args={[0.72, 0.37]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} wireframe />
          </mesh>
        </group>

        {/* Halo for Victory or Singularity */}
        {(mood === 'victory' || mood === 'singularity') && (
          <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color={mood === 'victory' ? '#eab308' : '#22c55e'} side={2} />
          </mesh>
        )}

        {/* Main Spine / Body rotation group */}
        <group ref={bodyGroupRef} rotation={[spineRotationX, 0, 0]}>
          {/* Head */}
          <group position={[0, headPositionY, 0]} rotation={[headRotationX, 0, 0]}>
            {/* Hair/Helmet block */}
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.52, 0.1, 0.52]} />
              <meshStandardMaterial color={mood === 'bankruptcy' ? '#334155' : hairColor} roughness={0.7} />
            </mesh>

            {/* Main Head Block */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.45, 0.5]} />
              <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>

            {/* Visor / Eyes / Glasses */}
            <mesh position={[0, 0.08, 0.26]}>
              <boxGeometry args={[0.42, 0.12, 0.05]} />
              <meshBasicMaterial color={eyeColor} />
            </mesh>

            {/* Stealth Agent — low-brim hat */}
            {archetype === 'stealth' && mood !== 'bankruptcy' && (
              <group position={[0, 0.36, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.52, 0.52, 0.04, 24]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.13, 0]}>
                  <cylinderGeometry args={[0.3, 0.33, 0.26, 24]} />
                  <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.03, 0]}>
                  <cylinderGeometry args={[0.34, 0.34, 0.06, 24]} />
                  <meshBasicMaterial color={eyeColor} />
                </mesh>
              </group>
            )}

            {/* Space Entrepreneur — sealed helmet dome */}
            {archetype === 'space' && mood !== 'bankruptcy' && (
              <group position={[0, 0.05, 0]}>
                <mesh>
                  <sphereGeometry args={[0.42, 24, 24]} />
                  <meshStandardMaterial color="#cbd5e1" transparent opacity={0.28} roughness={0.1} metalness={0.7} />
                </mesh>
                <mesh position={[0, -0.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.12, 0.03, 12, 24]} />
                  <meshBasicMaterial color={accessoryColor} />
                </mesh>
              </group>
            )}

            {/* Hacker — dark hood framing the face */}
            {archetype === 'hacker' && mood !== 'bankruptcy' && (
              <group>
                <mesh position={[0, 0.08, -0.2]}>
                  <boxGeometry args={[0.62, 0.7, 0.18]} />
                  <meshStandardMaterial color="#030712" roughness={0.95} />
                </mesh>
                <mesh position={[0, 0.36, -0.02]}>
                  <boxGeometry args={[0.62, 0.16, 0.5]} />
                  <meshStandardMaterial color="#030712" roughness={0.95} />
                </mesh>
                <mesh position={[-0.31, 0.08, -0.02]}>
                  <boxGeometry args={[0.08, 0.56, 0.5]} />
                  <meshStandardMaterial color="#030712" roughness={0.95} />
                </mesh>
                <mesh position={[0.31, 0.08, -0.02]}>
                  <boxGeometry args={[0.08, 0.56, 0.5]} />
                  <meshStandardMaterial color="#030712" roughness={0.95} />
                </mesh>
              </group>
            )}

            {/* Cyberpunk Executive — neon cheek strips */}
            {archetype === 'cyberpunk' && mood !== 'bankruptcy' && (
              <group>
                <mesh position={[-0.2, -0.08, 0.26]}>
                  <boxGeometry args={[0.04, 0.18, 0.02]} />
                  <meshBasicMaterial color={accessoryColor} />
                </mesh>
                <mesh position={[0.2, -0.08, 0.26]}>
                  <boxGeometry args={[0.04, 0.18, 0.02]} />
                  <meshBasicMaterial color={accessoryColor} />
                </mesh>
              </group>
            )}
          </group>

          {/* Torso (Suit Jacket) */}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.8, 0.9, 0.45]} />
            <meshStandardMaterial color={suitColor} roughness={0.5} />
          </mesh>

          {/* Shirt Collar (White V-shape) */}
          <mesh position={[0, 1.4, 0.23]}>
            <boxGeometry args={[0.18, 0.12, 0.02]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>

          {/* Tie */}
          <mesh position={[0, 1.15, 0.24]}>
            <boxGeometry args={[0.08, 0.4, 0.02]} />
            <meshStandardMaterial color={tieColor} roughness={0.8} />
          </mesh>

          {/* Left Arm */}
          <group ref={leftArmRef} position={[-0.55, 1.35, 0]} rotation={[0, 0, leftArmRotationZ]}>
            <mesh position={[0, -0.35, 0]}>
              <boxGeometry args={[0.22, 0.7, 0.22]} />
              <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>
            {/* Hand with Encryption Tattoo */}
            <group position={[0, -0.75, 0]}>
              <mesh>
                <boxGeometry args={[0.18, 0.12, 0.18]} />
                <meshStandardMaterial color={skinColor} roughness={0.6} />
              </mesh>
              <Text
                position={[0, 0, -0.095]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.06}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {handTattoo}
              </Text>
            </group>
          </group>

          {/* Right Arm */}
          <group ref={rightArmRef} position={[0.55, 1.35, 0]} rotation={[0, 0, rightArmRotationZ]}>
            <mesh position={[0, -0.35, 0]}>
              <boxGeometry args={[0.22, 0.7, 0.22]} />
              <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.75, 0]}>
              <boxGeometry args={[0.18, 0.12, 0.18]} />
              <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>
            {/* Quant Trader — handheld market slate */}
            {archetype === 'quant' && mood !== 'bankruptcy' && (
              <mesh position={[0.15, -0.8, 0.18]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.22, 0.3, 0.03]} />
                <meshBasicMaterial color="#22c55e" />
              </mesh>
            )}
          </group>

          {/* Cyberpunk Executive — neon back emitters */}
          {archetype === 'cyberpunk' && accessoryColor && mood !== 'bankruptcy' && (
            <group position={[0, 1.1, -0.3]}>
              <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.15, 0.6, 0.08]} />
                <meshBasicMaterial color={accessoryColor} />
              </mesh>
              <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.15, 0.6, 0.08]} />
                <meshBasicMaterial color={accessoryColor} />
              </mesh>
            </group>
          )}
        </group>

        {/* Legs (Pants) */}
        <group position={[0, 0, 0]}>
          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.2, 0.6, 0]}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.28, 0.6, 0.3]} />
              <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.65, 0.05]}>
              <boxGeometry args={[0.28, 0.1, 0.4]} />
              <meshStandardMaterial color={mood === 'bankruptcy' ? '#1e293b' : '#0f172a'} roughness={0.2} />
            </mesh>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.2, 0.6, 0]}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.28, 0.6, 0.3]} />
              <meshStandardMaterial color={suitColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.65, 0.05]}>
              <boxGeometry args={[0.28, 0.1, 0.4]} />
              <meshStandardMaterial color={mood === 'bankruptcy' ? '#1e293b' : '#0f172a'} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Footstep trail — pooled glowing prints left on the floor as the CEO walks */}
      {playable && Array.from({ length: FOOT_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { footRefs.current[i] = el; }}
          position={[0, -0.39, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[0.12, 0.2]} />
          <meshBasicMaterial color={eyeColor} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
};

export const CEOModel = ({
  archetype = 'researcher',
  mood = 'default',
  playable = false,
  selectedStation = 'none',
  onStationChange,
  quarter = 1
}: CEOModelProps) => {
  return (
    <div className="h-full w-full select-none relative" onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        camera={{ position: [0, 1.4, 3.2], fov: 42 }}
        className="h-full w-full"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={1.2} />
        <spotLight position={[0, 6, 0]} intensity={1.0} />

        <CameraController playable={playable} />

        {!playable && <OrbitControls enableZoom={true} enablePan={false} minDistance={2} maxDistance={6} target={[0, 0.6, 0]} />}
        {playable && (
          <OrbitControls
            enableRotate={true}
            enablePan={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent looking from below the floor
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN, // Left click to pan/move the view
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE // Right click to rotate
            }}
            target={[0, -0.6, -1.8]}
          />
        )}

        {playable && <OfficeRoom selectedStation={selectedStation} />}

        <CEOCharacter
          archetype={archetype}
          mood={mood}
          playable={playable}
          onStationChange={onStationChange}
          quarter={quarter}
        />
      </Canvas>
    </div>
  );
};

export default CEOModel;
