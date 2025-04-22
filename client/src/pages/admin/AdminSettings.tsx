import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save, Clock, Gift, Timer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  
  // حالة الإعدادات العامة
  const [gameName, setGameName] = useState('جاوب');
  const [welcomeMessage, setWelcomeMessage] = useState('مرحبًا بك في لعبة جاوب!');
  const [defaultAnswerTime, setDefaultAnswerTime] = useState(30);
  const [minCategoryCount, setMinCategoryCount] = useState(4);
  const [maxCategoryCount, setMaxCategoryCount] = useState(8);
  
  // حالة إعدادات المكافآت
  const [pointsPerWin, setPointsPerWin] = useState(10);
  const [pointsPerCorrectAnswer, setPointsPerCorrectAnswer] = useState(5);
  const [bonusPointsEasy, setBonusPointsEasy] = useState(1);
  const [bonusPointsMedium, setBonusPointsMedium] = useState(2);
  const [bonusPointsHard, setBonusPointsHard] = useState(3);
  
  // حالة إعدادات أخرى
  const [enableHelpSystem, setEnableHelpSystem] = useState(true);
  const [enableLeaderboard, setEnableLeaderboard] = useState(true);
  const [moderateQuestions, setModerateQuestions] = useState(true);
  const [allowAiGeneration, setAllowAiGeneration] = useState(true);
  
  const handleSaveSettings = () => {
    // هنا سيتم حفظ الإعدادات في قاعدة البيانات
    // حاليًا نقوم فقط بإظهار رسالة بالنجاح
    alert('تم حفظ الإعدادات بنجاح!');
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 text-yellow-900 border-yellow-200">
        <SettingsIcon className="h-4 w-4" />
        <AlertTitle>ملاحظة</AlertTitle>
        <AlertDescription>
          هذه الصفحة قيد التطوير. تغييرات الإعدادات لن يتم حفظها حاليًا.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="general" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">إعدادات عامة</TabsTrigger>
          <TabsTrigger value="rewards">نظام المكافآت</TabsTrigger>
          <TabsTrigger value="other">إعدادات أخرى</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>
                تحكم في الإعدادات الأساسية للتطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gameName">اسم اللعبة</Label>
                <Input 
                  id="gameName" 
                  value={gameName} 
                  onChange={e => setGameName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                <Input 
                  id="welcomeMessage" 
                  value={welcomeMessage} 
                  onChange={e => setWelcomeMessage(e.target.value)} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultAnswerTime">وقت الإجابة الافتراضي (ثانية)</Label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="defaultAnswerTime" 
                      type="number" 
                      min={5} 
                      max={120} 
                      value={defaultAnswerTime} 
                      onChange={e => setDefaultAnswerTime(parseInt(e.target.value) || 30)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minCategoryCount">الحد الأدنى للفئات</Label>
                  <Input 
                    id="minCategoryCount" 
                    type="number" 
                    min={1} 
                    max={20} 
                    value={minCategoryCount} 
                    onChange={e => setMinCategoryCount(parseInt(e.target.value) || 4)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxCategoryCount">الحد الأقصى للفئات</Label>
                  <Input 
                    id="maxCategoryCount" 
                    type="number" 
                    min={1} 
                    max={20} 
                    value={maxCategoryCount} 
                    onChange={e => setMaxCategoryCount(parseInt(e.target.value) || 8)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>خيارات وقت الإجابة (ثانية)</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">15</Button>
                  <Button variant="outline" size="sm">30</Button>
                  <Button variant="outline" size="sm">60</Button>
                  <Button variant="outline" size="sm">90</Button>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-1" />
                    إضافة
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نظام المكافآت والنقاط</CardTitle>
              <CardDescription>
                تحكم في طريقة احتساب النقاط والمكافآت للمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pointsPerWin">نقاط الفوز بالمباراة</Label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="pointsPerWin" 
                    type="number" 
                    min={0} 
                    value={pointsPerWin} 
                    onChange={e => setPointsPerWin(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pointsPerCorrectAnswer">نقاط الإجابة الصحيحة</Label>
                <Input 
                  id="pointsPerCorrectAnswer" 
                  type="number" 
                  min={0} 
                  value={pointsPerCorrectAnswer} 
                  onChange={e => setPointsPerCorrectAnswer(parseInt(e.target.value) || 0)} 
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label className="text-base">نقاط إضافية حسب المستوى</Label>
                <p className="text-sm text-muted-foreground">
                  نقاط إضافية تُمنح حسب مستوى صعوبة السؤال
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bonusPointsEasy">المستوى السهل</Label>
                  <Input 
                    id="bonusPointsEasy" 
                    type="number" 
                    min={0} 
                    value={bonusPointsEasy} 
                    onChange={e => setBonusPointsEasy(parseInt(e.target.value) || 0)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bonusPointsMedium">المستوى المتوسط</Label>
                  <Input 
                    id="bonusPointsMedium" 
                    type="number" 
                    min={0} 
                    value={bonusPointsMedium} 
                    onChange={e => setBonusPointsMedium(parseInt(e.target.value) || 0)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bonusPointsHard">المستوى الصعب</Label>
                  <Input 
                    id="bonusPointsHard" 
                    type="number" 
                    min={0} 
                    value={bonusPointsHard} 
                    onChange={e => setBonusPointsHard(parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label className="text-base">متطلبات الترقية</Label>
                <p className="text-sm text-muted-foreground">
                  النقاط المطلوبة للترقية إلى المستويات المختلفة
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المستوى الفضي</Label>
                  <Input type="number" min={0} defaultValue={100} />
                </div>
                <div className="space-y-2">
                  <Label>المستوى الذهبي</Label>
                  <Input type="number" min={0} defaultValue={300} />
                </div>
                <div className="space-y-2">
                  <Label>المستوى البلاتيني</Label>
                  <Input type="number" min={0} defaultValue={1000} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات أخرى</CardTitle>
              <CardDescription>
                إعدادات إضافية للتطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="enableHelpSystem">تمكين نظام المساعدة</Label>
                <Switch
                  id="enableHelpSystem"
                  checked={enableHelpSystem}
                  onCheckedChange={setEnableHelpSystem}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="enableLeaderboard">تمكين لوحة المتصدرين</Label>
                <Switch
                  id="enableLeaderboard"
                  checked={enableLeaderboard}
                  onCheckedChange={setEnableLeaderboard}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="moderateQuestions">مراجعة الأسئلة قبل النشر</Label>
                <Switch
                  id="moderateQuestions"
                  checked={moderateQuestions}
                  onCheckedChange={setModerateQuestions}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="allowAiGeneration">السماح بتوليد أسئلة بالذكاء الاصطناعي</Label>
                <Switch
                  id="allowAiGeneration"
                  checked={allowAiGeneration}
                  onCheckedChange={setAllowAiGeneration}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="defaultLocale">اللغة الافتراضية</Label>
                <Select defaultValue="ar">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر اللغة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cacheDuration">مدة تخزين البيانات المؤقتة (بالدقائق)</Label>
                <Input
                  id="cacheDuration"
                  type="number"
                  min={0}
                  defaultValue={60}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                حفظ الإعدادات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}