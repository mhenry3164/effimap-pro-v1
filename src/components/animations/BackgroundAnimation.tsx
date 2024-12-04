import React, { useEffect, useRef, memo } from 'react';
import { motion, useAnimation } from 'framer-motion';

const BackgroundAnimation: React.FC = () => {
  const controls = useAnimation();
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useRef(true);

  // Memoized grid points to prevent unnecessary recalculations
  const gridPoints = React.useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
  })), []);

  // Memoized connections to prevent unnecessary recalculations
  const connections = React.useMemo(() => Array.from({ length: 15 }, (_, i) => {
    const start = gridPoints[Math.floor(Math.random() * gridPoints.length)];
    const end = gridPoints[Math.floor(Math.random() * gridPoints.length)];
    return {
      id: i,
      start,
      end,
    };
  }), [gridPoints]);

  // Handle visibility changes to pause animations when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            controls.start("visible");
          } else {
            controls.stop();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (svgRef.current) {
      observer.observe(svgRef.current);
    }

    return () => {
      if (svgRef.current) {
        observer.unobserve(svgRef.current);
      }
    };
  }, [controls]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Animated connections with reduced motion */}
        {connections.map((connection) => (
          <motion.line
            key={connection.id}
            x1={`${connection.start.x}%`}
            y1={`${connection.start.y}%`}
            x2={`${connection.end.x}%`}
            y2={`${connection.end.y}%`}
            stroke="#003f88"
            strokeWidth="0.2"
            initial={{ pathLength: 0 }}
            animate={controls}
            variants={{
              visible: {
                pathLength: [0, 1],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }
              }
            }}
          />
        ))}

        {/* Animated grid points with reduced motion */}
        {gridPoints.map((point) => (
          <motion.circle
            key={point.id}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r={point.size}
            fill="#003f88"
            initial={{ scale: 0 }}
            animate={controls}
            variants={{
              visible: {
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.9, 0.7],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }
              }
            }}
          />
        ))}

        {/* Territory shapes with reduced motion */}
        <motion.path
          d="M20,20 L30,15 L40,25 L35,35 L25,30 Z"
          fill="none"
          stroke="#f68b24"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={controls}
          variants={{
            visible: {
              pathLength: [0, 1],
              transition: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }
            }
          }}
        />

        <motion.path
          d="M60,60 L70,55 L80,65 L75,75 L65,70 Z"
          fill="none"
          stroke="#003f88"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={controls}
          variants={{
            visible: {
              pathLength: [0, 1],
              transition: {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }
            }
          }}
        />
      </svg>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white" />
    </div>
  );
};

export default memo(BackgroundAnimation);
