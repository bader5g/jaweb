import React, { useState, useEffect } from 'react';
import { X, Info, Award, AlertCircle } from 'lucide-react';
import { useGame } from '@/lib/gameContext';
import { GameLogType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface GameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

export default function GameLogModal({ isOpen, onClose, gameId }: GameLogModalProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>(gameId);
  const [previousGames, setPreviousGames] = useState<{ id: string, name: string }[]>([]);
  
  // Fetch game logs for the selected game
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/games', selectedGameId, 'logs'], 
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/games/${selectedGameId}/logs`);
      return await res.json() as GameLogType[];
    },
    enabled: isOpen && !!selectedGameId
  });
  
  // Fetch previous games
  useEffect(() => {
    const fetchPreviousGames = async () => {
      try {
        // Note: In a real implementation, you would have an API endpoint to fetch previous games
        // For now, we'll just add the current game
        setPreviousGames([{ id: gameId, name: 'اللعبة الحالية' }]);
      } catch (error) {
        console.error('Error fetching previous games:', error);
      }
    };
    
    if (isOpen) {
      fetchPreviousGames();
    }
  }, [isOpen, gameId]);
  
  // بدون وجود المشغل، تستخدم هذه الدالة لترجمة نوع الإجراء إلى نص مفهوم
  const getActionText = (action: string, details?: Record<string, any>): string => {
    switch (action) {
      case 'select_category':
        return `اختيار فئة: ${details?.categoryName || ''}`;
      case 'select_difficulty':
        return `اختيار مستوى صعوبة: ${details?.difficulty || ''}`;
      case 'answer_question':
        return `إجابة سؤال ${details?.isCorrect ? 'صحيحة' : 'خاطئة'}`;
      case 'update_score':
        return `تغيير النقاط: ${details?.changeAmount > 0 ? '+' : ''}${details?.changeAmount || 0}`;
      case 'start_game':
        return 'بدء اللعبة';
      case 'end_game':
        return 'انتهاء اللعبة';
      case 'change_team':
        return `تغيير الدور إلى: ${details?.teamName || ''}`;
      case 'use_help':
        return `استخدام مساعدة: ${details?.helpType || ''}`;
      default:
        return action;
    }
  };
  
  // رمز لنوع الإجراء
  const getActionIcon = (action: string, details?: Record<string, any>) => {
    switch (action) {
      case 'answer_question':
        return details?.isCorrect 
          ? <div className="p-1 bg-green-100 rounded-full"><Award className="h-4 w-4 text-green-600" /></div>
          : <div className="p-1 bg-red-100 rounded-full"><AlertCircle className="h-4 w-4 text-red-600" /></div>;
      default:
        return <div className="p-1 bg-blue-100 rounded-full"><Info className="h-4 w-4 text-blue-600" /></div>;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">سجل اللعبة</h2>
          
          <button 
            className="p-1 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <select 
            className="w-full p-2 border border-gray-200 rounded-lg"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
          >
            {previousGames.map((game) => (
              <option key={game.id} value={game.id}>{game.name || game.id}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3 text-right">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ar })}
                    </span>
                    <div className="flex items-center">
                      {getActionIcon(log.action, log.details as Record<string, any>)}
                      <span className="mr-2 font-medium text-gray-800">
                        {getActionText(log.action, log.details as Record<string, any>)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono mt-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              لا توجد سجلات متاحة لهذه اللعبة
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}