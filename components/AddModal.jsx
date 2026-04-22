// components/AddModal.jsx

const React = window.React;
const { useState, useEffect } = React;

import { Close } from './Icons.jsx';
import { SearchModal } from './SearchModal.jsx';

export const AddModal = ({ isOpen, onClose, activeTab, onAdd }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSearchModal(false);
    }
  }, [isOpen]);

  // For media types (movies, tvshows, books) - show search modal
  const handleAddMedia = () => {
    setShowSearchModal(true);
  };

  // For other types (calendar, trips, places, recipes) - show form modal
  const handleAddOther = () => {
    // You'll implement specific forms for each type
    console.log('Open form for:', activeTab);
  };

  if (!isOpen) return null;

  // Determine if current tab is a media type
  const isMediaType = ['movies', 'tvshows', 'books'].includes(activeTab);

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
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
            {isMediaType ? (
              <button
                onClick={handleAddMedia}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                Search & Add {getAddTypeLabel(activeTab)}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400">
                  Add a new {getAddTypeLabel(activeTab).toLowerCase()}:
                </p>
                {/* Form fields for different types */}
                {renderFormByType(activeTab, onAdd, onClose)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal for media types */}
      {showSearchModal && (
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => {
            setShowSearchModal(false);
            onClose();
          }}
          category={activeTab}
          onAdd={(item) => {
            onAdd(item);
            setShowSearchModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

// Helper function to get label based on tab
const getAddTypeLabel = (tab) => {
  const labels = {
    movies: 'Movie',
    tvshows: 'TV Show',
    books: 'Book',
    calendar: 'Activity',
    trips: 'Trip',
    places: 'Place',
    recipes: 'Recipe'
  };
  return labels[tab] || 'Item';
};

// Render specific form based on type
const renderFormByType = (type, onAdd, onClose) => {
  const [formData, setFormData] = React.useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, id: Date.now() });
    onClose();
  };

  switch(type) {
    case 'calendar':
      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Activity name"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <input
            type="date"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            rows="3"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
            Add Activity
          </button>
        </form>
      );
    
    case 'trips':
      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Destination"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            required
          />
          <input
            type="date"
            placeholder="Start date"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <input
            type="date"
            placeholder="End date"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
            Add Trip
          </button>
        </form>
      );
    
    case 'recipes':
      return (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Recipe name"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Ingredients"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            rows="3"
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          />
          <textarea
            placeholder="Instructions"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            rows="3"
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          />
          <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
            Add Recipe
          </button>
        </form>
      );
    
    default:
      return <p className="text-slate-400">Form coming soon...</p>;
  }
};