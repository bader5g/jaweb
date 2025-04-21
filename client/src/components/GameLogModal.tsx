import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX, Clock, Users, Phone, SkipForward, Trophy, PlusCircle, User, Category } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

interface GameLog {
  id: number;
  gameId: string;
  timestamp: string;
  action: string;
  teamId?: number;
  questionId?: number;
  categoryId?: number;
  details?: Record<string, any>;
}

export default function GameLogModal({ isOpen, onClose, gameId }: GameLogModalProps) {
  const { toast } = useToast();
  
  // استعلام للحصول على سجلات اللعبة
  const { data: gameLogs, isLoading, error } = useQuery<GameLog[]>({
    queryKey: [`/api/games/${gameId}/logs`],
    enabled: isOpen && !!gameId,
    refetchInterval: isOpen ? 5000 : false, // تحديث كل 5 ثوانٍ أثناء فتح المودال
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ في تحميل سجلات اللعبة",
        description: "تعذر تحميل سجلات اللعبة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // وظيفة للحصول على العنوان المناسب للإجراء
  const getActionTitle = (action: string): string => {
    switch (action) {
      case 'start_game':
        return 'بدء اللعبة';
      case 'end_game':
        return 'انتهاء اللعبة';
      case 'select_category':
        return 'اختيار فئة';
      case 'select_difficulty':
        return 'اختيار مستوى الصعوبة';
      case 'answer_question':
        return 'إجابة سؤال';
      case 'update_score':
        return 'تعديل النقاط';
      case 'use_help':
        return 'استخدام وسيلة مساعدة';
      default:
        return action;
    }
  };
  
  // وظيفة للحصول على الأيقونة المناسبة للإجراء
  const getActionIcon = (log: GameLog) => {
    switch (log.action) {
      case 'start_game':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'end_game':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'select_category':
        return <Category className="h-4 w-4 text-purple-600" />;
      case 'select_difficulty':
        return <User className="h-4 w-4 text-indigo-600" />;
      case 'answer_question':
        return log.details?.isCorrect ? 
          <CircleCheck className="h-4 w-4 text-green-600" /> : 
          <CircleX className="h-4 w-4 text-red-600" />;
      case 'update_score':
        return <PlusCircle className="h-4 w-4 text-blue-600" />;
      case 'use_help':
        if (log.details?.helpType === 'phone_friend') {
          return <Phone className="h-4 w-4 text-blue-600" />;
        } else if (log.details?.helpType === 'ask_audience') {
          return <Users className="h-4 w-4 text-blue-600" />;
        } else if (log.details?.helpType === 'extra_time') {
          return <Clock className="h-4 w-4 text-blue-600" />;
        } else if (log.details?.helpType === 'skip_question') {
          return <SkipForward className="h-4 w-4 text-blue-600" />;
        }
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // وظيفة للحصول على تفاصيل الإجراء
  const getActionDetails = (log: GameLog): string => {
    switch (log.action) {
      case 'start_game':
        return `بدأت اللعبة "${log.details?.gameName || 'لعبة جديدة'}" بين ${log.details?.team1} و ${log.details?.team2}`;
      case 'end_game':
        return `انتهت اللعبة بنتيجة: ${log.details?.winner} فائز!`;
      case 'select_category':
        return `اختار ${log.details?.teamName} فئة "${log.details?.categoryName}"`;
      case 'select_difficulty':
        return `اختار ${log.details?.teamName} مستوى الصعوبة "${log.details?.difficulty}"`;
      case 'answer_question':
        return log.details?.isCorrect 
          ? `أجاب ${log.details?.teamName} إجابة صحيحة على سؤال في "${log.details?.categoryName}" (+${log.details?.points} نقطة)` 
          : `أجاب ${log.details?.teamName} إجابة خاطئة على سؤال في "${log.details?.categoryName}"`;
      case 'update_score':
        const change = log.details?.changeAmount > 0 ? 
          `+${log.details?.changeAmount}` : 
          `${log.details?.changeAmount}`;
        return `تم تعديل نقاط ${log.details?.teamName} (${change}) = ${log.details?.newScore}`;
      case 'use_help':
        return `استخدم ${log.details?.teamName} وسيلة المساعدة "${log.details?.helpName}"`;
      default:
        return JSON.stringify(log.details || {});
    }
  };
  
  // تنسيق الوقت المعروض
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">سجل اللعبة</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="mr-2">جاري التحميل...</span>
            </div>
          ) : !gameLogs || gameLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد سجلات لهذه اللعبة
            </div>
          ) : (
            <div className="space-y-3">
              {gameLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log) => (
                  <div key={log.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log)}
                      <span className="font-medium text-sm">{getActionTitle(log.action)}</span>
                      <span className="text-gray-400 text-xs mr-auto">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{getActionDetails(log)}</p>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
        
        <Separator className="my-2" />
        
        <DialogFooter className="flex justify-center sm:justify-end">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}