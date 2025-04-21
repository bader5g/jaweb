import { useEffect, useState } from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AnswerTimerProps {
  duration: number; // بالثواني
  onTimeEnd: () => void;
  isRunning: boolean;
}

export default function AnswerTimer({ duration, onTimeEnd, isRunning }: AnswerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    // إعادة تعيين المؤقت عند تغيير المدة
    setTimeLeft(duration);
    setProgress(100);
    setIsWarning(false);
  }, [duration]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // حساب النسبة المئوية للوقت المتبقي
          const newProgress = (newTime / duration) * 100;
          setProgress(newProgress);
          
          // إظهار تنبيه عندما يقترب الوقت من النهاية
          if (newProgress <= 20 && !isWarning) {
            setIsWarning(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    if (timeLeft === 0 && isRunning) {
      onTimeEnd();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isRunning, duration, onTimeEnd, isWarning]);
  
  // تحديد لون الشريط بناءً على الوقت المتبقي
  const getColorClass = () => {
    if (progress > 66) return 'from-green-400 to-green-600';
    if (progress > 33) return 'from-yellow-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };
  
  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isWarning ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
          <span className={`font-bold ${isWarning ? 'text-red-500' : 'text-gray-800'}`}>
            الوقت المتبقي: {timeLeft} ثانية
          </span>
        </div>
        
        {isWarning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-red-500"
          >
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">الوقت ينفد!</span>
          </motion.div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
        <motion.div 
          className={`h-full bg-gradient-to-r ${getColorClass()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isWarning && (
            <div className="h-full w-full bg-stripes-white opacity-30"></div>
          )}
        </motion.div>
      </div>
      
      {/* رموز القياس على شريط التقدم */}
      <div className="flex justify-between mt-1 px-0.5 text-xs text-gray-500">
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
        <span>|</span>
      </div>
    </div>
  );
}