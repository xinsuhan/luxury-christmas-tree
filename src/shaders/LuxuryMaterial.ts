import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

export const LuxuryShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColorHigh: new THREE.Color('#ffdb70'), // 更亮的金色
    uColorLow: new THREE.Color('#1a5c38'),  // 更透亮的祖母绿
  },
  // Vertex Shader
  `
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    attribute float aSize;
    
    varying float vRandom;
    varying float vDepth; // 增加深度变量
    
    uniform float uProgress;
    uniform float uTime;

    void main() {
      vRandom = aRandom;

      float t = uProgress;
      float ease = t * t * (3.0 - 2.0 * t);
      
      vec3 noise = vec3(
        sin(uTime * aRandom * 0.5 + aChaosPos.x),
        cos(uTime * aRandom * 0.5 + aChaosPos.y),
        sin(uTime * aRandom * 0.5 + aChaosPos.z)
      ) * 0.2 * (1.0 - ease);

      vec3 pos = mix(aChaosPos + noise, aTargetPos, ease);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // 【关键修改】把 300.0 改成 1200.0，粒子放大4倍，手机上看才清楚！
      gl_PointSize = aSize * (400.0 / -mvPosition.z); 

      vDepth = -mvPosition.z;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    varying float vRandom;

    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;

      // 混合颜色
      vec3 color = mix(uColorLow, uColorHigh, vRandom);
      
      // 增加中心高光，让每个粒子看起来像小灯泡
      float glow = 1.0 - (r * 1.5);
      glow = pow(glow, 2.0);
      
      gl_FragColor = vec4(color + vec3(glow * 0.5), 1.0);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ LuxuryShaderMaterial });
