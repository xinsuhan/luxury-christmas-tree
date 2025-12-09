/// <reference types="vite/client" />
import { Object3DNode } from '@react-three/fiber'
import { ShaderMaterial } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      luxuryShaderMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & {
        uTime?: number;
        uProgress?: number;
        uColorHigh?: THREE.Color;
        uColorLow?: THREE.Color;
      }
    }
  }
}
