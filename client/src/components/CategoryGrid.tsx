import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { CategoryUI, DifficultyLevel } from '@shared/schema';
import CategoryCard from './CategoryCard';
import { Search, Loader2, Filter, X } from 'lucide-react';

interface CategoryGridProps {
  maxSelections?: number;
  selectedCategories?: number[];
  onSelectCategory?: (id: number) => void;
}

export default function CategoryGrid({ 
  maxSelections = 0, 
  selectedCategories = [], 
  onSelectCategory 
}: CategoryGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<CategoryUI[]>([]);

  // استعلام للحصول على التصنيفات من الخادم
  const { data: categories, isLoading, error } = useQuery<CategoryUI[]>({
    queryKey: ['/api/categories'],
    staleTime: 1000 * 60 * 5, // 5 دقائق
  });

  // تحديث القائمة المصفاة عند تغير البيانات أو المصفيات
  useEffect(() => {
    if (!categories) return;

    let result = [...categories];

    // تطبيق مصفي البحث
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(category => 
        category.nameAr.toLowerCase().includes(term) || 
        category.name.toLowerCase().includes(term) ||
        (category.descriptionAr?.toLowerCase().includes(term) || false) ||
        (category.description?.toLowerCase().includes(term) || false)
      );
    }

    // تطبيق مصفي الصعوبة
    if (difficultyFilter) {
      result = result.filter(category => category.difficultyLevel === difficultyFilter);
    }

    setFilteredCategories(result);
  }, [categories, searchTerm, difficultyFilter]);

  // معالجة تحديد الفئة عند النقر عليها
  const handleSelectCategory = (id: number) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  // التحقق مما إذا كان يمكن تحديد المزيد من الفئات
  const canSelectMore = maxSelections === 0 || selectedCategories.length < maxSelections;

  // التحقق مما إذا كانت الفئة محددة
  const isCategorySelected = (id: number) => selectedCategories.includes(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحميل التصنيفات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <p className="text-red-700 mb-2 text-lg font-semibold">حدث خطأ أثناء تحميل التصنيفات</p>
        <p className="text-red-600">يرجى تحديث الصفحة والمحاولة مرة أخرى</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات البحث والتصفية */}
      <div className="bg-white p-4 rounded-xl shadow-md dark:bg-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          {/* حقل البحث */}
          <div className="flex-grow relative">
            <Input
              placeholder="ابحث عن تصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6"
            />
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* مصفي الصعوبة */}
          <div className="flex-shrink-0">
            <Tabs 
              defaultValue={difficultyFilter || 'all'} 
              onValueChange={(value) => setDifficultyFilter(value === 'all' ? null : value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" /> الكل
                </TabsTrigger>
                <TabsTrigger value={DifficultyLevel.EASY}>سهل</TabsTrigger>
                <TabsTrigger value={DifficultyLevel.MEDIUM}>متوسط</TabsTrigger>
                <TabsTrigger value={DifficultyLevel.HARD}>صعب</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* عدد النتائج */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {filteredCategories.length} تصنيف{filteredCategories.length !== 1 ? 'ات' : ''}
          </div>
          {maxSelections > 0 && (
            <div 
              className={`text-sm ${selectedCategories.length === maxSelections ? 'text-green-600' : selectedCategories.length > 0 ? 'text-amber-600' : 'text-gray-500'}`}
            >
              تم اختيار {selectedCategories.length} من {maxSelections}
            </div>
          )}
        </div>
      </div>

      {/* عرض التصنيفات */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={isCategorySelected(category.id)}
              onSelect={canSelectMore || isCategorySelected(category.id) ? handleSelectCategory : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 text-lg">لا توجد تصنيفات مطابقة لبحثك</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchTerm('');
              setDifficultyFilter(null);
            }}
          >
            إعادة ضبط البحث
          </Button>
        </div>
      )}

      {/* رسالة عند الوصول إلى الحد الأقصى من الاختيارات */}
      {maxSelections > 0 && selectedCategories.length === maxSelections && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center my-4">
          <p className="text-green-700 dark:text-green-300">
            لقد وصلت إلى الحد الأقصى من التصنيفات المسموح باختيارها ({maxSelections})
          </p>
        </div>
      )}
    </div>
  );
}