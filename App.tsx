import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, BrainCircuit, Calendar, LayoutDashboard, Menu, X } from 'lucide-react';
import QuestionSolver from './components/QuestionSolver';
import KnowledgeMap from './components/KnowledgeMap';
import StudyPlanner from './components/StudyPlanner';
import ResourceHub from './components/ResourceHub';

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <BrainCircuit className="w-8 h-8" />
            <span>AI Scholar</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarLink to="/" icon={LayoutDashboard} label="AI Solver" />
          <SidebarLink to="/knowledge" icon={BrainCircuit} label="Knowledge Map" />
          <SidebarLink to="/plan" icon={Calendar} label="Study Plan" />
          <SidebarLink to="/resources" icon={BookOpen} label="Resource Hub" />
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
          <div className="bg-slate-100 p-3 rounded-md">
            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Current User</p>
            <p className="text-sm font-medium text-slate-700">Student User</p>
            <p className="text-xs text-slate-500">Computer Science</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 lg:hidden shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
             <Menu size={24} />
           </button>
           <span className="ml-4 font-bold text-slate-800">Campus AI</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<QuestionSolver />} />
          <Route path="/knowledge" element={<KnowledgeMap />} />
          <Route path="/plan" element={<StudyPlanner />} />
          <Route path="/resources" element={<ResourceHub />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;