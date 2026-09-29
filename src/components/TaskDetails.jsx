import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Bell, 
  Repeat, 
  Tag, 
  Edit3, 
  Trash2, 
  Pin, 
  History, 
  Plus, 
  ListChecks, 
  FileText, 
  Save,
  Check
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { TagBadge } from './TagBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { PRIORITY_MAP, REPEAT_OPTIONS, REMINDER_OPTIONS } from '../utils/taskUtils';
import { formatRelativeDueDate, isTaskOverdue, getDaysOverdue, formatDueTime } from '../utils/dateUtils';

export function TaskDetails({
  task,
  isOpen,
  onClose,
  categories,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onTogglePin,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onReschedule,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Editable fields state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editReminder, setEditReminder] = useState('');
  const [editRepeat, setEditRepeat] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // When task changes or edit mode enters
  const startEditing = () => {
    if (!task) return;
    setEditTitle(task.title || '');
    setEditDesc(task.description || '');
    setEditCategory(task.category || 'personal');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setEditDueTime(task.dueTime || '');
    setEditReminder(task.reminder || 'none');
    setEditRepeat(task.repeat || 'none');
    setEditNotes(task.notes || '');
    setEditTags(task.tags || []);
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    onUpdateTask(task.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDueDate,
      dueTime: editDueTime,
      reminder: editReminder,
      repeat: editRepeat,
      notes: editNotes.trim(),
      tags: editTags,
    });

    setIsEditing(false);
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !editTags.includes(cleaned)) {
        setEditTags([...editTags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    onAddSubtask(task.id, newSubtaskInput);
    setNewSubtaskInput('');
  };

  if (!isOpen || !task) return null;

  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const overdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
  const daysOverdue = overdue ? getDaysOverdue(task.dueDate) : 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/65 backdrop-blur-sm p-0 md:p-4">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col rounded-t-3xl md:rounded-3xl glass-dropdown shadow-2xl border-t md:border border-slate-200/90 dark:border-zinc-700/60 overflow-hidden z-10"
        >
          {/* Mobile Handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => onTogglePin(task.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  task.pinned
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
                title={task.pinned ? 'Unpin task' : 'Pin task'}
              >
                <Pin className={`w-4 h-4 ${task.pinned ? 'fill-indigo-500/30 rotate-45' : ''}`} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  task.completed
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{task.completed ? 'Completed' : 'Mark Done'}</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-1.5">
              {!isEditing && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={startEditing}
                  className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Edit task"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {isEditing ? (
              /* Edit Mode Form */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-base text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    >
                      <option value="low" className="bg-white dark:bg-zinc-900">🟢 Low</option>
                      <option value="medium" className="bg-white dark:bg-zinc-900">🟡 Medium</option>
                      <option value="high" className="bg-white dark:bg-zinc-900">🔴 High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900">
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={editDueTime}
                      onChange={(e) => setEditDueTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Repeat
                    </label>
                    <select
                      value={editRepeat}
                      onChange={(e) => setEditRepeat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    >
                      {REPEAT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                      Reminder
                    </label>
                    <select
                      value={editReminder}
                      onChange={(e) => setEditReminder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-sm text-zinc-900 dark:text-zinc-200"
                    >
                      {REMINDER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500" />
                    Tags
                  </label>
                  {editTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editTags.map((tag) => (
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
                    placeholder="Type tag and press Enter"
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </motion.button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <>
                {/* Title & Status */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge categoryId={task.category} categories={categories} />
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${priorityInfo.badge}`}
                    >
                      <span>{priorityInfo.emoji}</span>
                      <span>{priorityInfo.label} Priority</span>
                    </span>
                    {task.repeat && task.repeat !== 'none' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-500/20 capitalize">
                        <Repeat className="w-3 h-3" />
                        {task.repeat}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-bold ${
                      task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Overdue alert banner */}
                {overdue && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm font-medium">
                      <span>⚠️ Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => onReschedule && onReschedule(task)}
                      className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-sm"
                    >
                      Reschedule
                    </motion.button>
                  </div>
                )}

                {/* Schedule details grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-white/5 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-1">Due Date</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {task.dueDate ? formatRelativeDueDate(task.dueDate) : 'No date set'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Due Time</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {task.dueTime ? formatDueTime(task.dueTime) : 'Any time'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Reminder</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {REMINDER_OPTIONS.find((r) => r.value === task.reminder)?.label || 'None'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-1">Repeat Schedule</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1.5 capitalize">
                      <Repeat className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {task.repeat || 'None'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {Array.isArray(task.tags) && task.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((t) => (
                        <TagBadge key={t} tag={t} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Subtasks Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-zinc-500" />
                      Subtasks {totalSubtasks > 0 && `(${completedSubtasks} / ${totalSubtasks})`}
                    </h4>
                  </div>

                  {totalSubtasks > 0 && (
                    <div className="space-y-2 mb-3">
                      {task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                        >
                          <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => onToggleSubtask(task.id, sub.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-zinc-600 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-white dark:bg-zinc-800 cursor-pointer"
                            />
                            <span
                              className={`text-sm truncate ${
                                sub.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-200'
                              }`}
                            >
                              {sub.title}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => onDeleteSubtask(task.id, sub.id)}
                            className="text-zinc-400 hover:text-rose-500 p-1 rounded transition-colors ml-2"
                            title="Remove subtask"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add Subtask Input */}
                  <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskInput}
                      onChange={(e) => setNewSubtaskInput(e.target.value)}
                      placeholder="Add subtask step..."
                      className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskInput.trim()}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      Add
                    </button>
                  </form>
                </div>

                {/* Notes */}
                {task.notes && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Notes
                    </h4>
                    <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/5 text-xs text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                      {task.notes}
                    </div>
                  </div>
                )}

                {/* Activity & History Log */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Activity History
                  </h4>
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-white/5">
                    {(task.history || []).slice(-5).reverse().map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                        <span>• {h.text}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-mono">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Task?"
          message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => {
            onDeleteTask(task.id);
            onClose();
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </AnimatePresence>
  );
}
