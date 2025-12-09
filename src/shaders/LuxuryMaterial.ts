import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

export const LuxuryShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uColorHigh: new THREE.Color('#D4AF37'),
    uColorLow: new THREE.Color('#004225'),
  },
  // Vertex Shader
  `
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    attribute float aSize;
    
    varying float vRandom;
    
    uniform float uProgress;
    uniform float uTime;

    void main() {
      vRandom = aRandom;

      float t = uProgress;
      float ease = t * t * (3.0 - 2.0 * t);
      
      vec3 noise = vec3(
        sin(uTime * aRandom + aChaosPos.x),
        cos(uTime * aRandom + aChaosPos.y),
        sin(uTime * aRandom + aChaosPos.z)
      ) * 0.2 * (1.0 - ease);

      vec3 pos = mix(aChaosPos + noise, aTargetPos, ease);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      gl_PointSize = aSize * (300.0 / -mvPosition.z); 
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

      vec3 color = mix(uColorLow, uColorHigh, vRandom);
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      gl_FragColor = vec4(color * glow * 2.0, 1.0);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ LuxuryShaderMaterial });
