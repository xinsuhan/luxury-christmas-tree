import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

export const LuxuryShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColorHigh: new THREE.Color('#fff0a0'), // 改成：亮白色带点金
    uColorLow: new THREE.Color('#2eff90'),  // 改成：荧光绿/翡翠绿（关键！）
  },
  // Vertex Shader (顶点着色器保持不变，不用改)
  `...此处省略，保持原样...`, 
  // Fragment Shader (片元着色器要改！看下面)
  `
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    varying float vRandom;

    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;

      vec3 color = mix(uColorLow, uColorHigh, vRandom);
      
      // 【关键修改】暴力提亮！把颜色强度乘以 3.0
      float glow = 1.0 - (r * 1.8);
      glow = pow(glow, 2.0);
      
      gl_FragColor = vec4(color * 4.0 * glow, 1.0); // 强度 x4
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);


extend({ LuxuryShaderMaterial });
