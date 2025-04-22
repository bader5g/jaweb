import React from 'react';
import { useLocation } from 'wouter';
import { useGame } from "@/lib/gameContext";
import { Category } from "@/lib/types";
import { motion } from 'framer-motion';
import { Check, Crown, Brain, Book, Utensils, Globe, Music, Palette, Medal, Code, Gamepad2, Heart } from "lucide-react";

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory, selectDifficulty } = useGame();
  const [, navigate] = useLocation();

  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-6 w-6" };
    switch (iconName.toLowerCase()) {
      case 'science': return <Brain {...iconProps} />;
      case 'history': return <Book {...iconProps} />;
      case 'food and cuisine': return <Utensils {...iconProps} />;
      case 'geography': return <Globe {...iconProps} />;
      case 'music': return <Music {...iconProps} />;
      case 'art': return <Palette {...iconProps} />;
      case 'sports': return <Medal {...iconProps} />;
      case 'technology': return <Code {...iconProps} />;
      case 'gaming': return <Gamepad2 {...iconProps} />;
      case 'health': return <Heart {...iconProps} />;
      default: return <Crown {...iconProps} />;
    }
  };

  const isCompleted = false; //This should ideally be determined based on game state

  const handleSelectQuestion = async () => {
    if (!isCompleted) {
      try {
        await selectCategory(category.name);
        await selectDifficulty("easy");
        navigate('/game');
      } catch (error) {
        console.error("خطأ في تحديد السؤال:", error);
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 cursor-pointer ${
        isCompleted ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:shadow-xl'
      }`}
      onClick={handleSelectQuestion}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-primary">
            {getIcon(category.name)}
          </div>
          {isCompleted && (
            <div className="bg-green-100 rounded-full p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.nameAr}</h3> {/* Assuming category.nameAr exists */}
      </div>
    </motion.div>
  );
}