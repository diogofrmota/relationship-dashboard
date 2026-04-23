const React = window.React;
const { useState } = React;

import { ThreeDots } from './Icons.jsx';
import { getStatusOptions, formatStatusLabel } from '../utils/helpers.js';

export const MediaCard = ({ item, onStatusChange, onProgressChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(item.progress || '');
  const statusOptions = getStatusOptions(item.category);

  const isTvWatching = item.category === 'tvshows' && item.status === 'watching';

  const commitProgress = () => {
    setEditingProgress(false);
    const val = progressInput.trim();
    if (val !== (item.progress || '')) {
      onProgressChange?.(item.id, val);
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20">
      {/* Image */}
      <div className="aspect-2/3 overflow-hidden bg-slate-900 rounded-t-xl">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
        <div>
          <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2 leading-tight mb-1">
            {item.title}
          </h3>
          {item.author && (
            <p className="text-xs sm:text-xs text-slate-400">{item.author}</p>
          )}

          {/* Metadata and Menu */}
          <div className="flex items-center justify-between mt-1 sm:mt-2">
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 whitespace-nowrap">
                ⭐ {item.rating}
              </span>
              <span>•</span>
              <span>{item.year}</span>
              {item.type && (
                <>
                  <span>•</span>
                  <span className="text-xs">{item.type}</span>
                </>
              )}
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ThreeDots size={16} />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mb-2 bottom-full w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-20">
                    {statusOptions.map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange(item.id, status);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {formatStatusLabel(status)}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onStatusChange(item.id, 'remove');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 transition-colors border-t border-slate-700 mt-1"
                    >
                      Remove from list
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress tracker — only for TV shows currently watching */}
          {isTvWatching && (
            <div className="mt-1.5" onClick={e => e.stopPropagation()}>
              {editingProgress ? (
                <input
                  type="text"
                  value={progressInput}
                  onChange={e => setProgressInput(e.target.value)}
                  placeholder="e.g. S2 E5"
                  className="w-full px-2 py-1 text-xs bg-slate-700 border border-purple-500 rounded text-white placeholder-slate-500 focus:outline-none"
                  autoFocus
                  onBlur={commitProgress}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitProgress();
                    if (e.key === 'Escape') { setEditingProgress(false); setProgressInput(item.progress || ''); }
                  }}
                />
              ) : (
                <button
                  onClick={() => { setProgressInput(item.progress || ''); setEditingProgress(true); }}
                  className="text-xs text-blue-300 hover:text-blue-100 bg-blue-500/20 hover:bg-blue-500/30 px-2 py-0.5 rounded-full transition-colors w-full text-left truncate"
                >
                  {item.progress ? `📺 ${item.progress}` : '+ Track episode'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};