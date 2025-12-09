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
              const thumbTip = landmarks[4];
              const pinkyTip = landmarks[20];
              const wrist = landmarks[0];
              
              const spread = Math.hypot(thumbTip[0] - pinkyTip[0], thumbTip[1] - pinkyTip[1]);
              
              const x = (wrist[0] / video.videoWidth) * 2 - 1;
              const y = -(wrist[1] / video.videoHeight) * 2 + 1;
              setHandPosition([x, y]);

              if (spread > 100) { // ãÐÖµµ÷Õû
                  setMode('CHAOS');
              } else {
                  setMode('FORMED');
              }
            }
          }
        }, 100);
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
      />
    </div>
  );
};
