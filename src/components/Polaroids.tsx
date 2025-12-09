import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const COUNT = 100;

export const Polaroids = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mode = useStore((state) => state.mode);
  
  const dummy = new THREE.Object3D();
  const { chaosData, targetData } = useMemo(() => {
    const c = [];
    const t = [];
    for (let i = 0; i < COUNT; i++) {
        c.push({
            pos: new THREE.Vector3((Math.random()-0.5)*50, (Math.random()-0.5)*50, (Math.random()-0.5)*50),
            rot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0)
        });
        
        const y = Math.random() * 16 - 8;
        const r = ((8 - (y + 8)) / 16) * 7 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        t.push({
            pos: new THREE.Vector3(Math.cos(angle)*r, y, Math.sin(angle)*r),
            rot: new THREE.Euler(0, -angle, Math.random()*0.4 - 0.2)
        });
    }
    return { chaosData: c, targetData: t };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const targetP = mode === 'FORMED' ? 1 : 0;
    const currentP = THREE.MathUtils.lerp(meshRef.current.userData.progress || 0, targetP, delta * 2);
    meshRef.current.userData.progress = currentP;

    for (let i = 0; i < COUNT; i++) {
        const c = chaosData[i];
        const t = targetData[i];
        
        dummy.position.lerpVectors(c.pos, t.pos, currentP);
        
        const qC = new THREE.Quaternion().setFromEuler(c.rot);
        const qT = new THREE.Quaternion().setFromEuler(t.rot);
        dummy.quaternion.slerpQuaternions(qC, qT, currentP);
        
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <planeGeometry args={[1.2, 1.5]} />
      <meshStandardMaterial 
        color="#fffaea" 
        emissive="#fffaea"
        emissiveIntensity={0.2}
        roughness={0.2} 
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};
