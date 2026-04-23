const React = window.React;

import { Search, Plus, Film, Tv, Book, CalendarIcon, MapPin, Utensils, ChefHat } from './Icons.jsx';
import { TAB_CONFIG } from '../config.js';

// Add a simple Logout icon component
const LogoutIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    stroke="white"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/**
 * Navigation Tabs Component
 */
export const Tabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-1 sm:gap-2 -mb-px overflow-x-auto">
    {tabs.map(tab => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base rounded-t-xl transition-all duration-300 whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-slate-900/50 text-white border-b-2 border-purple-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
          }`}
        >
          <Icon size={16} />
          {tab.label}
        </button>
      );
    })}
  </div>
);

/**
 * Get dynamic button text based on active tab
 */
const getAddButtonText = (activeTab) => {
  switch(activeTab) {
    case 'tasks':
      return 'Add Task';
    case 'movies':
      return 'Add Movie';
    case 'tvshows':
      return 'Add TV Show';
    case 'books':
      return 'Add Book';
    case 'calendar':
      return 'Add Activity';
    case 'trips':
      return 'Add Trip';
    case 'dates':
      return 'Add Place';
    case 'recipes':
      return 'Add Recipe';
    default:
      return 'Add New';
  }
};

/**
 * Application Header Component
 */
export const Header = ({
  activeTab,
  onTabChange,
  onAddClick,
  onLogout,
  tabs,
  showMediaActions = true
}) => (
  <div className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-40">
    <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-8">
      {/* Title and Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Diogo & Mónica - Shared Shelf
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showMediaActions && (
            <button
              onClick={onAddClick}
              className="flex-1 sm:flex-none px-3 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center sm:gap-2 gap-1 text-sm sm:text-base shadow-lg shadow-purple-900/30 hover:shadow-xl hover:shadow-purple-900/40 hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{getAddButtonText(activeTab)}</span>
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-3 bg-slate-700/30 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center sm:gap-2 gap-1 text-sm sm:text-base border border-slate-700 hover:border-red-500"
              title="Logout"
            >
              <LogoutIcon size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  </div>
);

/**
 * Get default tab configuration
 */
export const getDefaultTabs = () => [
  { id: TAB_CONFIG.TASKS.id, label: TAB_CONFIG.TASKS.label, icon: CheckSquare },
  { id: TAB_CONFIG.CALENDAR.id, label: TAB_CONFIG.CALENDAR.label, icon: CalendarIcon },
  { id: TAB_CONFIG.DATES.id, label: TAB_CONFIG.DATES.label, icon: Utensils },
  { id: TAB_CONFIG.TRIPS.id, label: TAB_CONFIG.TRIPS.label, icon: MapPin },
  { id: TAB_CONFIG.RECIPES.id, label: TAB_CONFIG.RECIPES.label, icon: ChefHat },
  { id: TAB_CONFIG.TV_SHOWS.id, label: TAB_CONFIG.TV_SHOWS.label, icon: Tv },
  { id: TAB_CONFIG.MOVIES.id, label: TAB_CONFIG.MOVIES.label, icon: Film },
  { id: TAB_CONFIG.BOOKS.id, label: TAB_CONFIG.BOOKS.label, icon: Book }
];