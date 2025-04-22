import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { apiRequest } from '@/lib/queryClient';
import { Phone, Users, Clock, SkipForward } from 'lucide-react';

interface TeamHelpOptionsProps {
  teamId: number;
  gameId: string;
}

// أنواع وسائل المساعدة المتاحة
const HELP_TYPES = {
  PHONE_FRIEND: 'phone_friend',
  ASK_AUDIENCE: 'ask_audience',
  EXTRA_TIME: 'extra_time',
  SKIP_QUESTION: 'skip_question'
};

export default function TeamHelpOptions({ teamId, gameId }: TeamHelpOptionsProps) {
  // حالة وسائل المساعدة لهذا الفريق
  const [usedHelps, setUsedHelps] = useState<Record<string, boolean>>({
    [HELP_TYPES.PHONE_FRIEND]: false,
    [HELP_TYPES.ASK_AUDIENCE]: false,
    [HELP_TYPES.EXTRA_TIME]: false,
    [HELP_TYPES.SKIP_QUESTION]: false
  });
  
  // استخدام سياق اللعبة
  const { game, createGameLog } = useGame();
  
  // التحقق من أن اللعبة موجودة وأن الفريق هو الفريق النشط
  const isActive = game?.currentTeamId === teamId;
  
  // الحصول على اسم الفريق
  const teamName = teamId === game?.team1.id ? game?.team1.name : game?.team2.name;
  
  // استخدام وسيلة مساعدة
  const useHelp = async (helpType: string) => {
    if (usedHelps[helpType] || !gameId) return;
    
    try {
      // إنشاء سجل لاستخدام وسيلة المساعدة باستخدام createGameLog
      await createGameLog('use_help', {
        helpType,
        helpName: getHelpName(helpType),
        teamName
      }, teamId);
      
      // تحديث الحالة المحلية
      setUsedHelps(prev => ({
        ...prev,
        [helpType]: true
      }));
      
      // لتنفيذ التأثير الفعلي للمساعدة (مثل إضافة وقت، تخطي سؤال، إلخ) يمكن إضافة مزيد من المنطق هنا
      
    } catch (error) {
      console.error('Error using help:', error);
    }
  };
  
  // الحصول على اسم وسيلة المساعدة بناءً على النوع
  const getHelpName = (helpType: string): string => {
    switch (helpType) {
      case HELP_TYPES.PHONE_FRIEND:
        return 'اتصال بصديق';
      case HELP_TYPES.ASK_AUDIENCE:
        return 'سؤال الجمهور';
      case HELP_TYPES.EXTRA_TIME:
        return 'وقت إضافي';
      case HELP_TYPES.SKIP_QUESTION:
        return 'تخطي السؤال';
      default:
        return helpType;
    }
  };
  
  // الحصول على أيقونة وسيلة المساعدة
  const getHelpIcon = (helpType: string) => {
    switch (helpType) {
      case HELP_TYPES.PHONE_FRIEND:
        return <Phone className="h-4 w-4" />;
      case HELP_TYPES.ASK_AUDIENCE:
        return <Users className="h-4 w-4" />;
      case HELP_TYPES.EXTRA_TIME:
        return <Clock className="h-4 w-4" />;
      case HELP_TYPES.SKIP_QUESTION:
        return <SkipForward className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {Object.values(HELP_TYPES).map((helpType) => (
        <button
          key={helpType}
          onClick={() => useHelp(helpType)}
          disabled={usedHelps[helpType] || !isActive}
          className={`
            flex flex-col items-center justify-center gap-2 p-3 rounded-full text-xs font-medium transition-all
            transform hover:scale-105 hover:shadow-lg
            ${usedHelps[helpType]
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isActive
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {getHelpIcon(helpType)}
          <span>{getHelpName(helpType)}</span>
        </button>
      ))}
    </div>
  );
}