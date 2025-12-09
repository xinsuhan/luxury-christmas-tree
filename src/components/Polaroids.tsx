import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

const COUNT = 30; // 减少数量，提升质量

// 这里用几个在线图片做演示，你可以换成你自己的图片URL
// 如果你有本地图片，放在 public/ 文件夹下，然后写 './my-photo.jpg'
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', // 狗狗
  'https://images.unsplash.com/photo-1596727147705-54a9d0c2067d?w=400&q=80', // 圣诞
  'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=400&q=80', // 圣诞树
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80', // 快乐
];

export const Polaroids = () => {
  const groupRef = useRef<THREE.Group>(null);
  const mode = useStore((state) => state.mode);
  
  // 加载纹理
  const textures = useTexture(IMAGE_URLS);

  // 生成数据
  const { items } = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
        // Chaos: 随机炸开
        const cPos = new THREE.Vector3((Math.random()-0.5)*40, (Math.random()-0.5)*40, (Math.random()-0.5)*40);
        const cRot = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0);

        // Target: 树表面
        const y = Math.random() * 14 - 7;
        const r = ((8 - (y + 8)) / 16) * 6 + 1.5; // 稍微靠外一点
        const angle = Math.random() * Math.PI * 2;
        
        const tPos = new THREE.Vector3(Math.cos(angle)*r, y, Math.sin(angle)*r);
        // 让照片面朝外，并且稍微随机歪一点，像挂上去的
        const tRot = new THREE.Euler(0, -angle + Math.PI/2, Math.random() * 0.2 - 0.1);

        arr.push({ cPos, cRot, tPos, tRot, texture: textures[i % textures.length] });
    }
    return { items: arr };
  }, [textures]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 简单的动画逻辑
    const targetP = mode === 'FORMED' ? 1 : 0;
    // 使用 group.userData 来存进度，简单粗暴
    groupRef.current.userData.progress = THREE.MathUtils.lerp(groupRef.current.userData.progress || 0, targetP, delta * 2);
    const progress = groupRef.current.userData.progress;

    // 手动更新每个子物体的位置
    groupRef.current.children.forEach((child, i) => {
        const item = items[i];
        
        // 插值位置
        child.position.lerpVectors(item.cPos, item.tPos, progress);
        
        // 插值旋转
        const qC = new THREE.Quaternion().setFromEuler(item.cRot);
        const qT = new THREE.Quaternion().setFromEuler(item.tRot);
        child.quaternion.slerpQuaternions(qC, qT, progress);
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <group key={i}>
          {/* 1. 白色的拍立得底纸（带厚度） */}
          <mesh>
            <boxGeometry args={[1.2, 1.5, 0.05]} />
            <meshStandardMaterial color="#fff" roughness={0.5} metalness={0.1} />
          </mesh>

          {/* 2. 照片内容（贴在正面） */}
          <mesh position={[0, 0.15, 0.03]}> {/* 向上移一点，留出底部写字的地方 */}
            <planeGeometry args={[1.0, 1.0]} />
            <meshBasicMaterial map={item.texture} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
