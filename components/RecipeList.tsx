import React from 'react';
import { Clock, Flame, ChefHat, ArrowRight } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  isLoading: boolean;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onSelectRecipe, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
        <h3 className="text-xl font-semibold text-slate-800 animate-pulse">Analyzing your fridge...</h3>
        <p className="text-slate-500 mt-2">Identifying ingredients and crafting recipes.</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <ChefHat size={48} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No recipes found yet</h3>
        <p className="text-slate-500 mt-1 max-w-sm">Snap a photo of your fridge ingredients to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden transition-all duration-200 flex flex-col cursor-pointer"
            onClick={() => onSelectRecipe(recipe)}
          >
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={`
                  px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                  ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                    recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}
                `}>
                  {recipe.difficulty}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {recipe.title}
              </h3>
              <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                {recipe.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {recipe.prepTime}
                </div>
                <div className="flex items-center">
                  <Flame size={16} className="mr-1" />
                  {recipe.calories} kcal
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-5 py-3 flex justify-between items-center group-hover:bg-emerald-50 transition-colors">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-700">
                {recipe.usedIngredients.length} ingredients available
              </span>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;