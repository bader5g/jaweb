import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnswerTimerProps {
  duration: number; // بالثواني
  onTimeEnd: () => void;
  isRunning: boolean;
}

export default function AnswerTimer({ duration, onTimeEnd, isRunning }: AnswerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    // إعادة تعيين المؤقت عند تغيير المدة
    setTimeLeft(duration);
    setProgress(100);
  }, [duration]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // حساب النسبة المئوية للوقت المتبقي
          setProgress((newTime / duration) * 100);
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
  }, [timeLeft, isRunning, duration, onTimeEnd]);
  
  // تحديد لون الشريط بناءً على الوقت المتبقي
  const getColorClass = () => {
    if (progress > 66) return 'bg-green-500';
    if (progress > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="h-5 w-5 text-primary" />
        <span className="font-bold">الوقت المتبقي: {timeLeft} ثانية</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={cn("h-2.5 rounded-full", getColorClass())}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}