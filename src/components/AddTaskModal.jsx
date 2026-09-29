import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  ListPlus, 
  Trash2, 
  Plus, 
  Bell, 
  Repeat as RepeatIcon, 
  FileText, 
  Sparkles
} from 'lucide-react';
import { PRIORITY_MAP, REPEAT_OPTIONS, REMINDER_OPTIONS } from '../utils/taskUtils';
import { toISODateString } from '../utils/dateUtils';

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
  categories,
  onAddCategory,
  initialDate,
}) {
  const titleInputRef = useRef(null);
  const todayStr = toISODateString(new Date());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(initialDate || todayStr);
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState('none');
  const [repeat, setRepeat] = useState('none');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Custom category creation state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setPriority('medium');
    setDueDate(initialDate || todayStr);
    setDueTime('');
    setReminder('none');
    setRepeat('none');
    setNotes('');
    setTags([]);
    setTagInput('');
    setSubtasks([]);
    setNewSubtaskTitle('');
    setShowNewCatInput(false);
    setNewCatName('');
  };

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (idx) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags((prev) => [...prev, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleCreateCustomCategory = () => {
    if (!newCatName.trim()) return;
    const created = onAddCategory({
      name: newCatName.trim(),
      color: 'indigo',
      emoji: '📁',
    });
    setCategory(created.id);
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || todayStr,
      dueTime: dueTime || '',
      reminder,
      repeat,
      tags,
      subtasks,
      notes: notes.trim(),
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={handleClose} />

        {/* Modal / Bottom Sheet Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-3xl glass-dropdown shadow-2xl border-t md:border border-slate-200/90 dark:border-zinc-700/60 overflow-hidden z-10"
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create New Task</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
            {/* Task Title (Autofocused) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Task Title *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be accomplished?"
                required
                className="w-full px-4 py-3 rounded-2xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-base md:text-lg font-medium focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details or context..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Priority & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PRIORITY_MAP).map(([key, val]) => (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={key}
                      type="button"
                      onClick={() => setPriority(key)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        priority === key
                          ? `${val.badge} ring-1 ring-indigo-500/30 font-semibold shadow-sm`
                          : 'bg-slate-100/70 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <span>{val.emoji}</span>
                      <span>{val.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Custom</span>
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomCategory}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                ) : null}

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Reminder & Repeat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Reminder
                </label>
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <RepeatIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Repeat
                </label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  {REPEAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subtasks Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <ListPlus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
                </label>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
                  {subtasks.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/5 text-xs text-zinc-800 dark:text-zinc-300"
                    >
                      <span className="truncate">□ {sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="text-zinc-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask(e);
                  }}
                  placeholder="Add a subtask step..."
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
                >
                  Add Step
                </button>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Tags (Press Enter or comma)
              </label>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-mono bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag (e.g. urgent, exam) and press Enter"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Important links, references, reminders..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-white/5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Task
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
