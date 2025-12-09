import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useStore } from './store';
import { TreeFoliage } from './components/TreeBuilder';
import { Polaroids } from './components/Polaroids';
import { HandTracker } from './components/HandTracker';
import * as THREE from 'three';

const CameraRig = () => {
  const handPos = useStore((state) => state.handPosition);
  useFrame((state) => {
    // 基础位置
    const baseX = 0;
    const baseY = 4;
    const baseZ = 20;
    
    // 混合手势输入 (反向移动以模拟视差)
    const targetX = baseX - handPos[0] * 5;
    const targetY = baseY - handPos[1] * 5;
    
    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, baseZ), 0.05);
    state.camera.lookAt(0, 4, 0); // 始终看向树中心
  });
  return null;
};

export default function App() {
  return (
    <div className="w-full h-screen bg-black relative">
      <HandTracker />
      
      <div className="absolute top-10 left-10 z-10 text-white font-serif pointer-events-none select-none">
        <h1 className="text-6xl text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] font-bold">
          GRAND LUXURY
        </h1>
        <p className="text-xl tracking-[0.5em] text-emerald-400 mt-2">CHRISTMAS EXPERIENCE</p>
      </div>

      <Canvas dpr={[1, 2]} gl={{ antialias: false }}> 
        <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
        <CameraRig />
        
        {/* 【修改点 1】背景改成纯黑，突出金属感 */}
        <color attach="background" args={['#010101']} /> 
        
        {/* 【修改点 2】灯光大换血：增强反射，加入红光 */}
        <ambientLight intensity={0.2} /> {/* 环境光暗一点 */}
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={5} color="#fff" castShadow />
        <pointLight position={[-10, 5, -10]} intensity={5} color="#ff0000" /> {/* 侧面红光补光 */}
        
        <Environment preset="lobby" background={false} blur={1} />

        <Suspense fallback={null}>
          <group position={[0, -5, 0]}>
            <TreeFoliage />
            <Polaroids />
            
            {/* 地板反射 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial 
                color="#021008" 
                roughness={0.1} 
                metalness={0.8} 
              />
            </mesh>
          </group>
        </Suspense>

        <EffectComposer disableNormalPass>
          {/* 【修改点 3】Bloom 微调：让高光更集中 */}
          <Bloom 
            luminanceThreshold={1} 
            mipmapBlur 
            intensity={0.6}
            radius={0.4}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
