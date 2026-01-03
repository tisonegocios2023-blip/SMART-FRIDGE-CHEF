import React, { useState } from 'react';
import { Camera, Filter } from 'lucide-react';
import Layout from './components/Layout';
import RecipeList from './components/RecipeList';
import Sidebar from './components/Sidebar';
import CookingView from './components/CookingView';
import ShoppingList from './components/ShoppingList';
import { analyzeFridgeAndGetRecipes } from './services/geminiService';
import { Recipe, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter Handling
  const handleToggleFilter = (filter: string) => {
    setFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  // Image Upload Handling
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setView(ViewState.RECIPES);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const newRecipes = await analyzeFridgeAndGetRecipes(base64String, filters);
        setRecipes(newRecipes);
      } catch (error) {
        console.error("Failed to analyze fridge:", error);
        alert("Failed to analyze image. Please try again.");
        setView(ViewState.HOME);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Shopping List Handling
  const addToShoppingList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList(prev => [...prev, item]);
    }
  };

  const removeFromShoppingList = (item: string) => {
    setShoppingList(prev => prev.filter(i => i !== item));
  };

  // View Routing
  const renderContent = () => {
    switch (view) {
      case ViewState.COOKING:
        if (!selectedRecipe) return null;
        return (
          <CookingView 
            recipe={selectedRecipe} 
            onBack={() => setView(ViewState.RECIPES)}
            onAddIngredient={addToShoppingList}
            shoppingList={shoppingList}
          />
        );
      
      case ViewState.SHOPPING:
        return (
          <ShoppingList 
            items={shoppingList}
            onRemove={removeFromShoppingList}
            onAddItem={addToShoppingList}
          />
        );

      case ViewState.RECIPES:
        return (
          <div className="flex h-full">
             <Sidebar 
                selectedFilters={filters}
                onToggleFilter={handleToggleFilter}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
               {/* Mobile Filter Toggle */}
               <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex justify-end">
                 <button 
                   onClick={() => setIsSidebarOpen(true)}
                   className="flex items-center text-slate-600 font-medium"
                 >
                   <Filter size={20} className="mr-2" />
                   Filters
                 </button>
               </div>
              <RecipeList 
                recipes={recipes} 
                onSelectRecipe={(recipe) => {
                  setSelectedRecipe(recipe);
                  setView(ViewState.COOKING);
                }}
                isLoading={isAnalyzing}
              />
            </div>
          </div>
        );

      case ViewState.HOME:
      default:
        return (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 flex flex-col lg:flex-row h-full">
              {/* Sidebar visible on desktop for pre-selecting filters */}
              <div className="hidden lg:block h-full border-r border-slate-200">
                <Sidebar 
                  selectedFilters={filters}
                  onToggleFilter={handleToggleFilter}
                  isOpen={true} // Always open on desktop home
                  onClose={() => {}}
                />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50">
                <div className="max-w-2xl w-full text-center space-y-8">
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                      What's in your fridge?
                    </h2>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                      Don't know what to cook? Snap a photo of your ingredients and let AI generate delicious recipes instantly.
                    </p>
                  </div>

                  {/* Mobile Filters Toggle Button */}
                  <div className="lg:hidden">
                     <button
                       onClick={() => setIsSidebarOpen(true)}
                       className="inline-flex items-center text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
                     >
                       <Filter size={18} className="mr-2"/>
                       {filters.length > 0 ? `${filters.length} Filters Active` : 'Add Dietary Filters'}
                     </button>
                  </div>

                  <div className="relative group cursor-pointer w-full max-w-md mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                          <Camera size={40} />
                        </div>
                        <p className="mb-2 text-xl font-bold text-slate-700">Tap to Scan Fridge</p>
                        <p className="text-sm text-slate-500">or upload a photo</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        capture="environment" // Hints mobile to use camera
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 justify-center flex-wrap">
                    {filters.map(f => (
                       <span key={f} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                         {f}
                       </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Sidebar */}
            <Sidebar 
                selectedFilters={filters}
                onToggleFilter={handleToggleFilter}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        );
    }
  };

  return (
    <Layout 
      currentView={view} 
      onNavigate={(v) => {
        // If navigating away from cooking, reset selection? Optional. 
        // Keeping it simple.
        setView(v);
      }}
      shoppingListCount={shoppingList.length}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;