import React from 'react';
import { Trash2, Plus, CheckSquare, Square } from 'lucide-react';

interface ShoppingListProps {
  items: string[];
  onRemove: (item: string) => void;
  onAddItem: (item: string) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onRemove, onAddItem }) => {
  const [newItem, setNewItem] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 w-full h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Shopping List</h2>
        <p className="text-slate-500">Don't forget these for your next culinary adventure.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item (e.g., Milk)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
        />
        <button 
          type="submit"
          className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={24} />
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
          <CheckSquare size={64} className="text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">Your list is empty</p>
          <p className="text-slate-500">Add missing ingredients from recipes or add them manually.</p>
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-y-auto pb-20">
          {items.map((item, index) => (
            <li 
              key={`${item}-${index}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center">
                <Square size={20} className="text-slate-300 mr-3" />
                <span className="text-slate-700 font-medium text-lg">{item}</span>
              </div>
              <button
                onClick={() => onRemove(item)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Remove item"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShoppingList;