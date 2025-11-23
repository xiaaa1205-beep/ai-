import React, { useState, useEffect } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { AiLearningPlan, DailyTask } from '../types';
import { Calendar, CheckCircle, Circle, Clock, Loader2, Plus, RefreshCw } from 'lucide-react';

const StudyPlanner = () => {
  const [plan, setPlan] = useState<AiLearningPlan | null>(null);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_learning_plan');
    if (saved) {
        setPlan(JSON.parse(saved));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (plan) {
        localStorage.setItem('ai_learning_plan', JSON.stringify(plan));
    }
  }, [plan]);

  const handleCreatePlan = async () => {
    if (!goal) return;
    setLoading(true);
    try {
        const newPlan = await generateStudyPlan(goal, level, 7); // Default 7 days
        setPlan(newPlan);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const toggleTask = (dayIndex: number, taskIdx: number) => { // Simplification: just toggling the day for demo
     if (!plan) return;
     const newPlan = { ...plan };
     newPlan.dailyTasks[dayIndex].completed = !newPlan.dailyTasks[dayIndex].completed;
     
     // Recalculate progress
     const total = newPlan.dailyTasks.length;
     const done = newPlan.dailyTasks.filter(t => t.completed).length;
     newPlan.progress = Math.round((done / total) * 100);
     
     setPlan(newPlan);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Study Planner</h1>
            <p className="text-slate-500">AI-generated schedules tailored to your pace.</p>
        </div>
        {!plan && (
            <div className="w-full md:w-auto bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-1">GOAL</label>
                    <input 
                        className="w-full p-2 border border-slate-200 rounded-md text-sm" 
                        placeholder="e.g. Master Java Basics"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-32">
                    <label className="block text-xs font-bold text-slate-500 mb-1">LEVEL</label>
                    <select 
                        className="w-full p-2 border border-slate-200 rounded-md text-sm"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                    >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                </div>
                <button 
                    onClick={handleCreatePlan} 
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full md:w-auto flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={16} />}
                    <span>Create Plan</span>
                </button>
            </div>
        )}
      </div>

      {plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Status */}
            <div className="lg:col-span-1 space-y-6 print:hidden">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{plan.goal}</h3>
                    <p className="text-sm text-slate-500 mb-4">Level: {plan.currentLevel}</p>
                    
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="font-bold text-slate-700">Progress</span>
                        <span className="text-primary font-bold">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${plan.progress}%` }}></div>
                    </div>

                    <button 
                        onClick={() => setPlan(null)}
                        className="mt-6 w-full py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} /> Reset Plan
                    </button>
                </div>
            </div>

            {/* Right Col: Timeline */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 print:bg-white print:border-none">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Clock size={18} /> 7-Day Schedule
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 print:divide-slate-300">
                        {plan.dailyTasks.map((task, idx) => (
                            <div key={idx} className={`p-4 transition-colors ${task.completed ? 'bg-slate-50 opacity-60 print:opacity-100 print:bg-transparent' : 'hover:bg-blue-50/50'}`}>
                                <div className="flex items-start gap-4">
                                    <button 
                                        onClick={() => toggleTask(idx, 0)}
                                        className={`mt-1 print:hidden ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-primary'}`}
                                    >
                                        {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                                {task.day}
                                            </h4>
                                            {task.completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full print:border print:border-slate-400 print:bg-transparent">Done</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {task.topics.map((t, i) => (
                                                <span key={i} className="text-xs border border-slate-200 px-2 py-1 rounded text-slate-600 bg-white">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 print:hidden">
              <Calendar className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No active study plan.</p>
              <p className="text-slate-400 text-sm">Set a goal above to get started.</p>
          </div>
      )}
    </div>
  );
};

export default StudyPlanner;