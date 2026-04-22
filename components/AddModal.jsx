const React = window.React;
const { useEffect } = React;

import { Close } from './Icons.jsx';
import { SearchModal } from './SearchModal.jsx';
import { FormRenderer } from './FormRenderer.jsx';

export const AddModal = ({ isOpen, onClose, activeTab, onAdd }) => {
  useEffect(() => {}, [isOpen]);

  const isMediaType = [
    'movies',
    'tvshows',
    'books',
    'movie',
    'tvshow',
    'book'
  ].includes(activeTab?.toLowerCase());

  if (!isOpen) return null;

  if (isMediaType) {
    return (
      <SearchModal
        isOpen={isOpen}
        onClose={onClose}
        category={activeTab}
        onAdd={(item) => {
          onAdd(item);
          onClose();
        }}
      />
    );
  }

  const getAddTypeLabel = (tab) => {
    const labels = {
      tasks: 'Task',
      calendar: 'Activity',
      trips: 'Trip',
      dates: 'Date Spot',
      recipes: 'Recipe'
    };
    return labels[tab] || 'Item';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-gradient-to-br from-slate-800 to-slate-900 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Add New {getAddTypeLabel(activeTab)}
            </h2>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <Close size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <FormRenderer type={activeTab} onAdd={onAdd} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};