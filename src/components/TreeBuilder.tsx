import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { easing } from 'maath';
import '../shaders/LuxuryMaterial';

const COUNT = 15000;
const RADIUS = 8;
const HEIGHT = 18;

export const TreeFoliage = () => {
  const meshRef = useRef<any>(null);
  const mode = useStore((state) => state.mode);

  const { chaosPositions, targetPositions, randoms, sizes } = useMemo(() => {
    const chaos = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);
    const sz = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 25 + Math.random() * 20;
      chaos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaos[i * 3 + 2] = r * Math.cos(phi);

      const y = (i / COUNT) * HEIGHT;
      const radiusAtY = ((HEIGHT - y) / HEIGHT) * RADIUS;
      const angle = i * 2.4;
      
      target[i * 3] = Math.cos(angle) * radiusAtY;
      target[i * 3 + 1] = y - HEIGHT / 2;
      target[i * 3 + 2] = Math.sin(angle) * radiusAtY;

      rnd[i] = Math.random();
      sz[i] = Math.random() * 0.5 + 0.5;
    }
    return { chaosPositions: chaos, targetPositions: target, randoms: rnd, sizes: sz };
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetProgress = mode === 'FORMED' ? 1 : 0;
      easing.damp(meshRef.current.uniforms.uProgress, 'value', targetProgress, 0.5, delta);
      meshRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(COUNT * 3), 3]} />
        <bufferAttribute attach="attributes-aChaosPos" args={[chaosPositions, 3]} />
        <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <luxuryShaderMaterial
        ref={meshRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
