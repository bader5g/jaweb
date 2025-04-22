import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QuestionForm, { QuestionFormValues } from '@/components/forms/QuestionForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question?: {
    id: number;
    text: string;
    answer: string;
    difficulty: string;
    categoryId: number;
    isActive: boolean;
    mediaType?: string;
    mediaUrl?: string;
    points: number;
  };
  isEdit?: boolean;
}

export default function QuestionDialog({ isOpen, onClose, question, isEdit = false }: QuestionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // إضافة سؤال جديد
  const createQuestionMutation = useMutation({
    mutationFn: async (values: QuestionFormValues) => {
      const response = await apiRequest('POST', '/api/admin/questions', {
        ...values,
        categoryId: parseInt(values.categoryId),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة السؤال بنجاح',
        variant: 'default',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة السؤال',
        variant: 'destructive',
      });
    }
  });

  // تعديل سؤال
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: QuestionFormValues }) => {
      const response = await apiRequest('PUT', `/api/admin/questions/${id}`, {
        ...values,
        categoryId: parseInt(values.categoryId),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تعديل السؤال بنجاح',
        variant: 'default',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تعديل السؤال',
        variant: 'destructive',
      });
    }
  });

  // معالجة تقديم النموذج
  const handleSubmit = (values: QuestionFormValues) => {
    if (isEdit && question) {
      updateQuestionMutation.mutate({ id: question.id, values });
    } else {
      createQuestionMutation.mutate(values);
    }
  };

  // القيم الافتراضية للنموذج
  const defaultValues = isEdit && question ? {
    text: question.text,
    answer: question.answer,
    difficulty: question.difficulty,
    categoryId: question.categoryId.toString(),
    isActive: question.isActive,
    mediaType: question.mediaType || '',
    mediaUrl: question.mediaUrl || '',
    points: question.points,
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row justify-between items-start">
          <div>
            <DialogTitle>{isEdit ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'قم بتعديل بيانات السؤال ثم اضغط على حفظ' : 'أدخل بيانات السؤال الجديد هنا'}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <QuestionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}