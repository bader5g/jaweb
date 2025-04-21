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
      } z-50`}
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
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-primary">الفئات المحددة</h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {selectedCategories.length}/{maxSelectedCategories}
          </span>
        </div>
        
        <div className="space-y-2">
          {selectedCategoryData.map((category) => (
            <div 
              key={category.id}
              className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                >
                  {category.nameAr[0]}
                </div>
                <span className="text-sm font-medium truncate">
                  {category.nameAr}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-500 hover:text-red-500 flex-shrink-0"
                onClick={() => onRemoveCategory(category.id)}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
        
        {selectedCategories.length >= 4 && (
          <div className="mt-3 text-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            يمكنك بدء اللعب الآن
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedCategoriesFloater;