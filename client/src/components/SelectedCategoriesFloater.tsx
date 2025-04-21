import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { CategoryUI } from '@shared/schema';

interface SelectedCategoriesFloaterProps {
  selectedCategories: number[];
  onRemoveCategory: (id: number) => void;
  maxSelectedCategories?: number;
}

const SelectedCategoriesFloater = ({
  selectedCategories,
  onRemoveCategory,
  maxSelectedCategories = 8
}: SelectedCategoriesFloaterProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // احضار بيانات التصنيفات
  const { data: categories } = useQuery<CategoryUI[]>({
    queryKey: ['/api/categories']
  });
  
  // تصفية التصنيفات المختارة فقط
  const selectedCategoryData = categories?.filter(category => 
    selectedCategories.includes(category.id)
  ) || [];

  // عند عدم وجود فئات مختارة، نخفي العنصر
  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 top-1/3 transform transition-all duration-300 shadow-lg bg-white dark:bg-gray-800 rounded-l-none rounded-r-lg max-w-xs ${
        isCollapsed ? '-translate-x-[calc(100%-2rem)]' : 'translate-x-0'
      } z-50 border-2 border-primary`}
      style={{ maxHeight: 'calc(60vh)', overflowY: 'auto' }}
    >
      {/* زر الطي والبسط */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-14 bg-primary text-white rounded-l-none rounded-r-md flex items-center justify-center"
        aria-label={isCollapsed ? "عرض الفئات المحددة" : "إخفاء الفئات المحددة"}
      >
        {isCollapsed ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>

      <div className="p-3">
        <div className="flex justify-between items-center mb-4 bg-primary/10 p-2 rounded-lg">
          <h3 className="font-bold text-primary text-lg">الفئات المحددة</h3>
          <span className="px-3 py-1 bg-primary/20 rounded-full font-bold text-primary">
            {selectedCategories.length}/{maxSelectedCategories}
          </span>
        </div>
        
        <div className="space-y-2">
          {selectedCategoryData.map((category) => (
            <div 
              key={category.id}
              className="flex items-center justify-between gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                >
                  {category.nameAr[0]}
                </div>
                <span className="text-sm font-bold truncate text-blue-800 dark:text-blue-200">
                  {category.nameAr}
                </span>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full flex-shrink-0 hover:bg-red-600"
                onClick={() => onRemoveCategory(category.id)}
              >
                <X size={14} className="text-white" />
              </Button>
            </div>
          ))}
        </div>
        
        {selectedCategories.length >= 4 && (
          <div className="mt-4 space-y-2">
            <div className="text-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              يمكنك بدء اللعب الآن
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-2 shadow-md hover:shadow-lg transition-all duration-200 font-bold"
              onClick={() => window.location.href = "/setup"}
            >
              ابدأ اللعب
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedCategoriesFloater;