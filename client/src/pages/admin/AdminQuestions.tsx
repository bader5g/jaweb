import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, PlusCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminQuestions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  // جلب الأسئلة
  const { data: questions = [], isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ['/api/admin/questions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/questions');
      return response.json();
    }
  });
  
  // في حالة وجود خطأ
  if (questionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات الأسئلة. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 text-blue-900 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>ملاحظة</AlertTitle>
        <AlertDescription>
          هذه الصفحة قيد التطوير. يمكنك إضافة وتعديل الأسئلة بعد اكتمال التطوير.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة سؤال جديد
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="ml-2 h-4 w-4" />
            استيراد من ملف Excel
          </Button>
          <Button variant="outline">
            <Upload className="ml-2 h-4 w-4" />
            تصدير الأسئلة
          </Button>
        </div>
        
        <div className="flex">
          <Input
            placeholder="بحث في الأسئلة..."
            className="w-full max-w-sm"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">جميع الأسئلة</TabsTrigger>
          <TabsTrigger value="text">أسئلة نصية</TabsTrigger>
          <TabsTrigger value="image">أسئلة مع صور</TabsTrigger>
          <TabsTrigger value="audio">أسئلة مع صوتيات</TabsTrigger>
          <TabsTrigger value="video">أسئلة مع فيديو</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoadingQuestions ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>لا توجد أسئلة</CardTitle>
                <CardDescription>
                  لم يتم العثور على أسئلة. يمكنك إضافة أسئلة جديدة باستخدام الزر أعلاه.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <AlertCircle className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-muted-foreground">
                  قم بإضافة أسئلة جديدة لاستخدامها في الألعاب المختلفة. <br />
                  يمكنك إضافة أسئلة نصية أو أسئلة مع وسائط متعددة مثل الصور والصوت والفيديو.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة سؤال جديد
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">قائمة الأسئلة</h3>
              <p className="text-muted-foreground mb-4">
                سيتم عرض قائمة الأسئلة هنا بعد اكتمال التطوير.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-32 flex items-center justify-center">
                    <p className="text-muted-foreground">سؤال تجريبي #{index + 1}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة النصية</CardTitle>
              <CardDescription>
                عرض جميع الأسئلة النصية فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                سيتم عرض الأسئلة النصية هنا بعد اكتمال التطوير.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة مع صور</CardTitle>
              <CardDescription>
                عرض جميع الأسئلة التي تحتوي على صور
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                سيتم عرض الأسئلة مع صور هنا بعد اكتمال التطوير.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة مع صوتيات</CardTitle>
              <CardDescription>
                عرض جميع الأسئلة التي تحتوي على ملفات صوتية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                سيتم عرض الأسئلة مع صوتيات هنا بعد اكتمال التطوير.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة مع فيديو</CardTitle>
              <CardDescription>
                عرض جميع الأسئلة التي تحتوي على ملفات فيديو
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                سيتم عرض الأسئلة مع فيديو هنا بعد اكتمال التطوير.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}