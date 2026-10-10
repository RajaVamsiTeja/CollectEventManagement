import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  targetDate: string | Date;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - new Date().getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ targetDate, compact = false }: Props) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {timeLeft.days > 0 && <span className="font-semibold">{timeLeft.days}d</span>}
        <span className="font-semibold">{timeLeft.hours}h</span>
        <span className="font-semibold">{timeLeft.minutes}m</span>
        <span className="font-semibold text-brand-600 dark:text-brand-400">{timeLeft.seconds}s</span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center overflow-hidden">
            <motion.span
              key={unit.value}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl font-display font-bold text-brand-600 dark:text-brand-400 tabular-nums"
            >
              {String(unit.value).padStart(2, "0")}
            </motion.span>
          </div>
          <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
