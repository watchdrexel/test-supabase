import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, RefreshCw, Layout, MoreHorizontal, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'zinc' },
  { id: 'in-progress', title: 'In Progress', color: 'emerald' },
  { id: 'done', title: 'Done', color: 'blue' }
];

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', note: '', status: 'todo' });
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setFormData({ title: '', priority: 'Medium', note: '', status: 'todo' });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    const task = tasks.find(t => t.id === id);
    const updatedData = { ...task, ...updates };
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      setTasks(tasks.map(t => t.id === id ? result : t));
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Layout className="w-8 h-8 text-emerald-500" />
            Kanban Board
          </h1>
          <p className="text-zinc-500">Manage your tasks, priorities, and notes efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTasks}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Task
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-zinc-400 uppercase tracking-wider text-sm">{column.title}</h2>
                <span className="bg-white/5 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full border border-white/5">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-zinc-600" />
            </div>

            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-4">
              <AnimatePresence mode="popLayout">
                {tasks.filter(t => t.status === column.id).map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-[#121212] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingTask(task)} className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-100">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-2 text-zinc-100 leading-snug">{task.title}</h3>
                    {task.note && <p className="text-xs text-zinc-500 mb-4 line-clamp-3 leading-relaxed">{task.note}</p>}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                        <Clock className="w-3 h-3" />
                        {new Date(task.created_at).toLocaleDateString()}
                      </div>
                      <select 
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
                        className="bg-transparent text-[10px] font-bold text-zinc-400 hover:text-emerald-400 cursor-pointer outline-none uppercase tracking-tighter"
                      >
                        {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-[#121212]">{c.title}</option>)}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingTask) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingTask(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="p-2 rounded-full hover:bg-white/5 text-zinc-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingTask ? (e) => { e.preventDefault(); handleUpdateTask(editingTask.id, editingTask); } : handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Task Title</label>
                  <input 
                    autoFocus
                    type="text"
                    required
                    value={editingTask ? editingTask.title : formData.title}
                    onChange={(e) => editingTask ? setEditingTask({...editingTask, title: e.target.value}) : setFormData({...formData, title: e.target.value})}
                    placeholder="What needs to be done?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Priority</label>
                    <select 
                      value={editingTask ? editingTask.priority : formData.priority}
                      onChange={(e) => editingTask ? setEditingTask({...editingTask, priority: e.target.value}) : setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p} className="bg-[#121212]">{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                    <select 
                      value={editingTask ? editingTask.status : formData.status}
                      onChange={(e) => editingTask ? setEditingTask({...editingTask, status: e.target.value}) : setFormData({...formData, status: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all"
                    >
                      {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-[#121212]">{c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Notes</label>
                  <textarea 
                    value={editingTask ? editingTask.note : formData.note}
                    onChange={(e) => editingTask ? setEditingTask({...editingTask, note: e.target.value}) : setFormData({...formData, note: e.target.value})}
                    placeholder="Add some details..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {editingTask ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
