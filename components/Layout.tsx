import React from 'react';
import { ChefHat, ShoppingCart, Home } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  shoppingListCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, shoppingListCount }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onNavigate(ViewState.HOME)}
            >
              <div className="bg-emerald-500 p-2 rounded-lg text-white mr-3">
                <ChefHat size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Fridge Chef</h1>
                <p className="text-xs text-slate-500">AI Culinary Assistant</p>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate(ViewState.HOME)}
                className={`p-2 rounded-full transition-colors ${currentView === ViewState.HOME ? 'bg-slate-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
                aria-label="Home"
              >
                <Home size={24} />
              </button>
              <button 
                onClick={() => onNavigate(ViewState.SHOPPING)}
                className={`p-2 rounded-full transition-colors relative ${currentView === ViewState.SHOPPING ? 'bg-slate-100 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
                aria-label="Shopping List"
              >
                <ShoppingCart size={24} />
                {shoppingListCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {shoppingListCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;