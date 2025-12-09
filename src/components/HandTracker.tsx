import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';
import { useStore } from '../store';

export const HandTracker = () => {
  const webcamRef = useRef<Webcam>(null);
  const setMode = useStore((state) => state.setMode);
  const setHandPosition = useStore((state) => state.setHandPosition);

  useEffect(() => {
    const runHandpose = async () => {
      try {
        const net = await handpose.load();
        console.log("Handpose loaded");
        
        // 【修改 1】把时间间隔从 100ms 改成 40ms，让它更流畅
        const interval = setInterval(async () => {
          if (
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4
          ) {
            const video = webcamRef.current.video;
            const predictions = await net.estimateHands(video);

            if (predictions.length > 0) {
              const hand = predictions[0];
              // @ts-ignore
              const landmarks = hand.landmarks;
              const thumbTip = landmarks[4];  // 大拇指指尖
              const pinkyTip = landmarks[20]; // 小拇指指尖
              const wrist = landmarks[0];     // 手腕
              
              // 计算张开幅度
              const spread = Math.hypot(thumbTip[0] - pinkyTip[0], thumbTip[1] - pinkyTip[1]);
              
              const x = (wrist[0] / video.videoWidth) * 2 - 1;
              const y = -(wrist[1] / video.videoHeight) * 2 + 1;
              setHandPosition([x, y]);

              // 【修改 2】把阈值从 100 降到 50，轻轻张手就能触发！
              if (spread > 50) { 
                  setMode('CHAOS');
              } else {
                  setMode('FORMED');
              }
            }
          }
        }, 40); 
        return () => clearInterval(interval);
      } catch (e) {
        console.error("Handpose error:", e);
      }
    };

    runHandpose();
  }, []);

  return (
    <div className="absolute top-4 right-4 w-32 h-24 border-2 border-[#D4AF37] rounded-lg overflow-hidden z-50 opacity-50 hover:opacity-100 transition-opacity">
      <Webcam
        ref={webcamRef}
        className="w-full h-full object-cover transform scale-x-[-1]"
        videoConstraints={{
          width: 320,  // 强制低分辨率以提高速度
          height: 240,
          facingMode: "user"
        }}
      />
    </div>
  );
};
