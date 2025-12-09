import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const COUNT = 700; // 球的数量，700个足够堆满
const RADIUS = 7;
const HEIGHT = 16;

// 定义红金配色方案
const PALETTE = [
  new THREE.Color("#FFD700"), // 纯金
  new THREE.Color("#FFD700"), // 纯金
  new THREE.Color("#D4AF37"), // 暗金
  new THREE.Color("#C41E3A"), // 圣诞红
  new THREE.Color("#8A0303"), // 深红
];

export const TreeFoliage = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mode = useStore((state) => state.mode);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 生成球体数据
  const { chaosData, targetData, colors } = useMemo(() => {
    const chaos = [];
    const target = [];
    const cols = new Float32Array(COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // 1. 随机分配颜色
      const baseColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      color.set(baseColor);
      color.toArray(cols, i * 3);

      // 2. 炸开的状态 (Chaos)
      const r = 20 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      chaos.push({
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        scale: Math.random() * 0.4 + 0.3, // 炸开时大小随机
      });

      // 3. 树的状态 (Target) - 螺旋堆叠
      const p = i / COUNT; 
      const y = -HEIGHT / 2 + p * HEIGHT; 
      const radiusAtY = ((HEIGHT / 2 - y) / HEIGHT) * RADIUS; 
      const angle = i * 0.8; // 紧密螺旋
      
      const jitterX = (Math.random() - 0.5) * 0.5; // 稍微不规则一点才像真的
      const jitterZ = (Math.random() - 0.5) * 0.5;

      target.push({
        pos: new THREE.Vector3(
          Math.cos(angle) * (radiusAtY + jitterX),
          y,
          Math.sin(angle) * (radiusAtY + jitterZ)
        ),
        scale: Math.random() * 0.4 + 0.4, // 球体大小 (0.4 - 0.8)
      });
    }
    return { chaosData: chaos, targetData: target, colors: cols };
  }, []);

  // 初始化颜色
  useLayoutEffect(() => {
    if(meshRef.current) {
        for(let i=0; i<COUNT; i++) {
            meshRef.current.setColorAt(i, new THREE.Color(colors[i*3], colors[i*3+1], colors[i*3+2]));
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [colors]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetP = mode === 'FORMED' ? 1 : 0;
    // 增加一点弹性和惯性
    const currentP = THREE.MathUtils.lerp(meshRef.current.userData.progress || 0, targetP, delta * 2.5);
    meshRef.current.userData.progress = currentP;

    for (let i = 0; i < COUNT; i++) {
      const c = chaosData[i];
      const t = targetData[i];

      dummy.position.lerpVectors(c.pos, t.pos, currentP);
      const s = THREE.MathUtils.lerp(c.scale, t.scale, currentP);
      dummy.scale.setScalar(s);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        roughness={0.15}   // 表面非常光滑
        metalness={0.9}    // 金属感极强
        envMapIntensity={2.0} // 反射环境光
      />
    </instancedMesh>
  );
};
