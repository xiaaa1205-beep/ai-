import React, { useState } from 'react';
import { recommendResources } from '../services/geminiService';
import { Book, Video, FileText, ExternalLink, Bookmark, Search, Loader2 } from 'lucide-react';

const ResourceHub = () => {
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
        const results = await recommendResources(query);
        setResources(results);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'Video': return <Video size={16} className="text-red-500" />;
          case 'Book': return <Book size={16} className="text-blue-500" />;
          default: return <FileText size={16} className="text-green-500" />;
      }
  };

  return (
    <div className="space-y-6">
       <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
           <div className="relative z-10 max-w-2xl">
               <h1 className="text-3xl font-bold mb-4">Resource Library</h1>
               <p className="mb-6 text-blue-100">Find textbooks, videos, and articles recommended by AI based on your learning needs.</p>
               
               <form onSubmit={handleSearch} className="relative">
                   <input 
                    className="w-full p-4 pl-12 rounded-xl text-slate-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30"
                    placeholder="What are you looking for? (e.g. Linear Algebra)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors"
                   >
                       {loading ? <Loader2 className="animate-spin" /> : 'Search'}
                   </button>
               </form>
           </div>
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 right-20 w-32 h-32 bg-yellow-400 opacity-10 rounded-full translate-y-1/2"></div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {resources.map((res, idx) => (
               <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col h-full group">
                   <div className="flex justify-between items-start mb-3">
                       <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded">
                           {getTypeIcon(res.type)}
                           {res.type}
                       </span>
                       <button className="text-slate-300 hover:text-yellow-500 transition-colors">
                           <Bookmark size={20} />
                       </button>
                   </div>
                   <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-primary transition-colors">{res.title}</h3>
                   <p className="text-slate-600 text-sm mb-4 flex-1">{res.description}</p>
                   
                   <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-auto w-full py-2 bg-slate-50 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2"
                   >
                       Access Resource <ExternalLink size={14} />
                   </a>
               </div>
           ))}
       </div>
       
       {!loading && resources.length === 0 && (
           <div className="text-center py-20 text-slate-400">
               <p>Enter a topic above to discover resources.</p>
           </div>
       )}
    </div>
  );
};

export default ResourceHub;