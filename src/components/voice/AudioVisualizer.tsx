//src/components/voice/AudioVisulizer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isActive: boolean;
  type: 'input' | 'output';
  className?: string;
}

export function AudioVisualizer({ isActive, type, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      if (!isActive) return;

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (type === 'input') {
        // Draw input visualization (microphone levels)
        drawInputVisualization(ctx, width, height);
      } else {
        // Draw output visualization (speaker waveform)
        drawOutputVisualization(ctx, width, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type]);

  const drawInputVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate microphone input levels
    const level = Math.random() * 0.8 + 0.1; // Simulate audio level
    setAudioLevel(level);

    const barCount = 20;
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.8;

    ctx.fillStyle = '#10b981'; // Green color for input

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * maxBarHeight * level;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    }
  };

  const drawOutputVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw waveform for output
    const centerY = height / 2;
    const amplitude = height * 0.3;
    const frequency = 0.02;
    const time = Date.now() * 0.005;

    ctx.strokeStyle = '#3b82f6'; // Blue color for output
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const y = centerY + Math.sin((x * frequency) + time) * amplitude * Math.random();
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-16 rounded-lg bg-gray-50"
        style={{ width: '100%', height: '64px' }}
      />
      
      {/* Audio level indicator */}
      {type === 'input' && (
        <div className="absolute top-1 right-1">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: audioLevel > 0.5 ? '#ef4444' : audioLevel > 0.2 ? '#f59e0b' : '#10b981'
            }}
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isActive ? Infinity : 0,
            }}
          />
        </div>
      )}

      {/* Type indicator */}
      <div className="absolute bottom-1 left-1 text-xs text-gray-500 bg-white px-1 rounded">
        {type === 'input' ? 'Listening' : 'Speaking'}
      </div>
    </div>
  );
}