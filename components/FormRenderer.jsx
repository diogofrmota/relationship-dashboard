const React = window.React;
const { useState } = React;

import { CalendarIcon } from './Icons.jsx';

/** Format DD/MM/YYYY */
const formatDateInput = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

/** Reusable Field */
const FormField = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

export const FormRenderer = ({ type, onAdd, onClose }) => {
  const [formData, setFormData] = useState({});
  const [dateInput, setDateInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, id: Date.now() });
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500";

  const selectClass =
    "w-full px-3 py-2 bg-white border border-slate-600 rounded-lg text-black focus:outline-none focus:border-purple-500 cursor-pointer";

  switch (type) {

    case 'tasks':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Title" required>
            <input
              type="text"
              placeholder="Enter task title"
              className={inputClass}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value, completed: false })
              }
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              placeholder="Enter task description"
              className={inputClass}
              rows="3"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value, completed: false })
              }
            />
          </FormField>

          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
            Add Task
          </button>
        </form>
      );

    case 'calendar':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Title" required>
            <input
              type="text"
              placeholder="e.g., Movie Night"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Date" required>
            <div className="relative">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={dateInput}
                className={`${inputClass} pl-10`}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setDateInput(formatted);
                  if (formatted.length === 10) {
                    const [d, m, y] = formatted.split('/');
                    setFormData({ ...formData, date: `${y}-${m}-${d}` });
                  }
                }}
                maxLength={10}
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={16} />
            </div>
            <p className="text-xs text-slate-500">Format: DD/MM/YYYY</p>
          </FormField>

          <FormField label="Time">
            <select
              className={selectClass}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="none">None</option>
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = `${i.toString().padStart(2, '0')}:00`;
                return <option key={hour} value={hour}>{hour}</option>;
              })}
            </select>
          </FormField>

          <FormField label="Description">
            <textarea
              placeholder="Add details"
              className={inputClass}
              rows="3"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>

          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
            Add Activity
          </button>
        </form>
      );

    case 'trips':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Destination" required>
            <input
              type="text"
              placeholder="e.g., Paris"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Start Date" required>
            <div className="relative">
              <input
                type="text"
                value={startDateInput}
                placeholder="DD/MM/YYYY"
                className={`${inputClass} pl-10`}
                onChange={(e) => {
                  const f = formatDateInput(e.target.value);
                  setStartDateInput(f);
                  if (f.length === 10) {
                    const [d, m, y] = f.split('/');
                    setFormData({ ...formData, startDate: `${y}-${m}-${d}` });
                  }
                }}
                maxLength={10}
                required
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={16} />
            </div>
          </FormField>

          <FormField label="End Date">
            <div className="relative">
              <input
                type="text"
                value={endDateInput}
                placeholder="DD/MM/YYYY"
                className={`${inputClass} pl-10`}
                onChange={(e) => {
                  const f = formatDateInput(e.target.value);
                  setEndDateInput(f);
                  if (f.length === 10) {
                    const [d, m, y] = f.split('/');
                    setFormData({ ...formData, endDate: `${y}-${m}-${d}` });
                  }
                }}
                maxLength={10}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={16} />
            </div>
          </FormField>

          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
            Add Trip
          </button>
        </form>
      );

    case 'dates':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Category" required>
            <select
              className={selectClass}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option value="restaurant">🍽️ Restaurant</option>
              <option value="cafe">☕ Café</option>
              <option value="park">🌳 Park</option>
              <option value="museum">🏛️ Museum</option>
              <option value="beach">🏖️ Beach</option>
              <option value="viewpoint">🌅 Viewpoint</option>
            </select>
          </FormField>

          <FormField label="Place Name" required>
            <input
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Address">
            <input
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              className={inputClass}
              rows="3"
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormField>

          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
            Add Date Spot
          </button>
        </form>
      );

    case 'recipes':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">

          <FormField label="Recipe Name" required>
            <input
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Prep Time">
            <input
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
            />
          </FormField>

          <FormField label="Photo URL">
            <input
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
            />
          </FormField>

          <FormField label="Recipe Link">
            <input
              type="url"
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </FormField>

          <FormField label="Ingredients">
            <textarea
              className={`${inputClass} font-mono text-sm`}
              rows="4"
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            />
          </FormField>

          <FormField label="Instructions">
            <textarea
              className={inputClass}
              rows="4"
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </FormField>

          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
            Add Recipe
          </button>
        </form>
      );

    default:
      return <p className="text-slate-400">Form coming soon...</p>;
  }
};