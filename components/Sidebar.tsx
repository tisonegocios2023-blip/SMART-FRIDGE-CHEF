import React from 'react';
import { Filter, X } from 'lucide-react';
import { DIETARY_OPTIONS } from '../types';

interface SidebarProps {
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedFilters, onToggleFilter, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full
        `}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center text-slate-800 font-semibold">
            <Filter size={20} className="mr-2" />
            Filters
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Dietary</h3>
            <div className="space-y-2">
              {DIETARY_OPTIONS.map(option => (
                <label key={option} className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    checked={selectedFilters.includes(option)}
                    onChange={() => onToggleFilter(option)}
                  />
                  <span className="ml-3 text-slate-700 group-hover:text-emerald-700 transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg text-sm text-emerald-800">
            <p><strong>Tip:</strong> Select filters before snapping your fridge for better accuracy!</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;