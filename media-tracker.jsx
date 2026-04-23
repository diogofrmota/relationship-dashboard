const React = window.React;
const { useState, useEffect } = React;

function MediaTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentShelf, setCurrentShelf] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCategory, setAddCategory] = useState(null);
  const [globalAddOpen, setGlobalAddOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editRecipeModalOpen, setEditRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editTripModalOpen, setEditTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Online/offline listener
  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  // On mount, try to restore session from token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUser(token)
        .then(user => {
          if (user) {
            setCurrentUser(user);
          } else {
            clearAuthToken();
          }
        })
        .catch(() => clearAuthToken())
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  // When user changes, load shelves if needed? That happens in ShelfSelector
  // But we can just pass user to ShelfSelector, it handles shelves.

  // Set document title based on state
  useEffect(() => {
    if (!currentUser) {
      document.title = 'Shared Shelf - Homepage';
    } else if (!currentShelf) {
      document.title = 'Shared Shelf - Join your Shelf';
    } else {
      document.title = `Shared Shelf - ${currentShelf.name}`;
    }
  }, [currentUser, currentShelf]);

  // Load data when shelf is selected
  useEffect(() => {
    if (!currentShelf) return;
    const loadData = async () => {
      setLoading(true);
      const shelfData = await getShelfData(currentShelf.id);
      if (shelfData) {
        // Migrate anime to tvshows and ensure all keys
        const migrated = {
          tasks: shelfData.tasks || [],
          movies: shelfData.movies || [],
          tvshows: [...(shelfData.tvshows || []), ...(shelfData.anime || [])],
          books: shelfData.books || [],
          calendarEvents: shelfData.calendarEvents || [],
          trips: shelfData.trips || [],
          recipes: shelfData.recipes || [],
          dates: shelfData.dates || [],
          profile: shelfData.profile || {
            users: [
              { id: 'user-1', name: 'Diogo', avatar: '', color: '#8b5cf6' },
              { id: 'user-2', name: 'Mónica', avatar: '', color: '#ec4899' }
            ]
          }
        };
        setData(migrated);
      } else {
        setData(defaultShelfData());
      }
      setLoading(false);
    };
    loadData();
  }, [currentShelf]);

  // Persist data whenever it changes
  useEffect(() => {
    if (!currentShelf || !data) return;
    saveShelfData(currentShelf.id, data).then(() => setLastSynced(Date.now()));
  }, [data, currentShelf]);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setCurrentShelf(null);
    setData(null);
  };

  const handleShelfSelect = (shelf) => {
    setCurrentShelf(shelf);
  };

  const handleBackToShelves = () => {
    setCurrentShelf(null);
    setData(null);
  };

  // Handlers for data mutations (same as before but using current shelf data)
  const handleAddMedia = (item) => {
    const defaultStatus = getDefaultStatus(item.category);
    const newItem = { ...item, status: defaultStatus };
    setData(prev => ({ ...prev, [item.category]: [...prev[item.category], newItem] }));
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'remove') {
      setData(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) }));
    } else {
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(i => i.id === id ? { ...i, status: newStatus } : i)
      }));
    }
  };

  const handleProgressChange = (id, progress) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(i => i.id === id ? { ...i, progress } : i)
    }));
  };

  const handleAddEvent = (event) => {
    setData(prev => ({ ...prev, calendarEvents: [...(prev.calendarEvents || []), event] }));
  };

  const handleDeleteEvent = (id) => {
    setData(prev => ({ ...prev, calendarEvents: prev.calendarEvents.filter(e => e.id !== id) }));
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEditEventModalOpen(true);
  };

  const handleSaveEvent = (updatedEvent) => {
    setData(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    }));
  };

  const handleAddTrip = (trip) => {
    setData(prev => ({ ...prev, trips: [...(prev.trips || []), trip] }));
  };

  const handleDeleteTrip = (id) => {
    setData(prev => ({ ...prev, trips: prev.trips.filter(t => t.id !== id) }));
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setEditTripModalOpen(true);
  };

  const handleSaveTrip = (updatedTrip) => {
    setData(prev => ({ ...prev, trips: prev.trips.map(t => t.id === updatedTrip.id ? updatedTrip : t) }));
  };

  const handleAddRecipe = (recipe) => {
    setData(prev => ({ ...prev, recipes: [...(prev.recipes || []), recipe] }));
  };

  const handleDeleteRecipe = (id) => {
    setData(prev => ({ ...prev, recipes: prev.recipes.filter(r => r.id !== id) }));
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setEditRecipeModalOpen(true);
  };

  const handleSaveRecipe = (updatedRecipe) => {
    setData(prev => ({ ...prev, recipes: prev.recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r) }));
  };

  const handleAddDate = (place) => {
    setData(prev => ({ ...prev, dates: [...(prev.dates || []), place] }));
  };

  const handleDeleteDate = (id) => {
    setData(prev => ({ ...prev, dates: prev.dates.filter(p => p.id !== id) }));
  };

  const handleToggleFavouriteDate = (id) => {
    setData(prev => ({
      ...prev,
      dates: prev.dates.map(p => p.id === id ? { ...p, isFavourite: !p.isFavourite } : p)
    }));
  };

  const handleUpdateDate = (id, updates) => {
    setData(prev => ({ ...prev, dates: prev.dates.map(p => p.id === id ? { ...p, ...updates } : p) }));
  };

  const handleAddTask = (task) => {
    setData(prev => ({ ...prev, tasks: [...(prev.tasks || []), task] }));
  };

  const handleToggleTask = (id) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
  };

  const handleDeleteTask = (id) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const handleUpdateTask = (taskId, newTitle, newDescription) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, title: newTitle, description: newDescription } : t)
    }));
  };

  const handleReorderTasks = (reorderedTasks) => {
    setData(prev => ({ ...prev, tasks: reorderedTasks }));
  };

  const handleSaveProfile = (profileData) => {
    setData(prev => ({ ...prev, profile: profileData }));
  };

  const handleGlobalAddSelect = (category) => {
    setAddCategory(category);
    setGlobalAddOpen(false);
    setAddModalOpen(true);
  };

  // Auth loading
  if (authLoading) return <LoadingScreen />;

  // Not authenticated → login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Authenticated but no shelf selected → shelf selector
  if (!currentShelf) {
    return (
      <ShelfSelector
        userId={currentUser.id}
        token={getAuthToken()}
        onSelectShelf={handleShelfSelect}
        onBackToLogin={() => {
          clearAuthToken();
          setCurrentUser(null);
        }}
      />
    );
  }

  // Inside a shelf
  if (loading || !data) return <LoadingScreen />;

  const isMediaTab = MEDIA_TABS.includes(activeTab);
  const tabs = getDefaultTabs();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.5); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.7); }
        input[type="time"], input[type="date"] { color-scheme: dark; }
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.7; }
      `}</style>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onGlobalAddClick={() => setGlobalAddOpen(true)}
        onProfileClick={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
        tabs={tabs}
        profile={data?.profile}
        lastSynced={lastSynced}
        isOnline={isOnline}
        showMediaActions={true}
        shelfName={currentShelf.name}
        onBackToShelves={handleBackToShelves}
      />

      <div className="flex-1 max-w-8xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {activeTab === 'tasks' && (
          <TasksView
            tasks={data.tasks || []}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onReorderTasks={handleReorderTasks}
            onAddClick={() => setAddModalOpen(true)}
            profile={data?.profile}
          />
        )}
        {isMediaTab && (
          <MediaSectionsView
            activeTab={activeTab}
            items={data[activeTab] || []}
            onStatusChange={handleStatusChange}
            onAddClick={() => setAddModalOpen(true)}
            onProgressChange={handleProgressChange}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            events={data.calendarEvents || []}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />
        )}
        {activeTab === 'trips' && (
          <TripsView
            trips={data.trips || []}
            onDeleteTrip={handleDeleteTrip}
            onEditTrip={handleEditTrip}
          />
        )}
        {activeTab === 'dates' && (
          <DatesView
            places={data.dates || []}
            onDeletePlace={handleDeleteDate}
            onToggleFavourite={handleToggleFavouriteDate}
            onUpdateDate={handleUpdateDate}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesView
            recipes={data.recipes || []}
            onDeleteRecipe={handleDeleteRecipe}
            onEditRecipe={handleEditRecipe}
          />
        )}
      </div>

      <GlobalSearchModal isOpen={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} data={data} setActiveTab={setActiveTab} />
      <AddModal isOpen={addModalOpen} onClose={() => { setAddModalOpen(false); setAddCategory(null); }} activeTab={addCategory || activeTab} onAddMedia={handleAddMedia} onAddEvent={handleAddEvent} onAddTrip={handleAddTrip} onAddRecipe={handleAddRecipe} onAddDate={handleAddDate} onAddTask={handleAddTask} profile={data?.profile} />
      <EditEventModal isOpen={editEventModalOpen} onClose={() => setEditEventModalOpen(false)} event={editingEvent} onSave={handleSaveEvent} />
      <GlobalAddModal isOpen={globalAddOpen} onClose={() => setGlobalAddOpen(false)} onSelect={handleGlobalAddSelect} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} profile={data?.profile} onSave={handleSaveProfile} />
      <EditRecipeModal isOpen={editRecipeModalOpen} onClose={() => setEditRecipeModalOpen(false)} recipe={editingRecipe} onSave={handleSaveRecipe} />
      <EditTripModal isOpen={editTripModalOpen} onClose={() => setEditTripModalOpen(false)} trip={editingTrip} onSave={handleSaveTrip} />
    </div>
  );
}

function defaultShelfData() {
  return {
    tasks: [],
    movies: [],
    tvshows: [],
    books: [],
    calendarEvents: [],
    trips: [],
    recipes: [],
    dates: [],
    profile: {
      users: [
        { id: 'user-1', name: 'Diogo', avatar: '', color: '#8b5cf6' },
        { id: 'user-2', name: 'Mónica', avatar: '', color: '#ec4899' }
      ]
    }
  };
}

async function fetchUser(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json().then(d => d.user);
  } catch {}
  return null;
}

window.MediaTracker = MediaTracker;