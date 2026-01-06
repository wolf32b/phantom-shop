import { useEffect, useState } from "react";

export function SparkBackground() {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSpark = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 20,
      };
      setSparks((prev) => [...prev.slice(-20), newSpark]);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute animate-spark-fade text-secondary/30"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
          }}
        >
          <svg
            width={spark.size}
            height={spark.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="rotate-45"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

export function PhantomShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-10 dark:opacity-5 overflow-hidden">
      <div className="absolute top-10 -left-20 w-96 h-96 bg-primary rotate-12 clip-path-p5-angle" />
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-secondary -rotate-12 clip-path-comic-1" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 border-8 border-primary rotate-45 opacity-20" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 clip-path-comic-2" />
    </div>
  );
}
