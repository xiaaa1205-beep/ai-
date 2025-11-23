import React, { useState } from 'react';
import { Search, Download, Share2, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { generateKnowledgeTree } from '../services/geminiService';
import { KnowledgeNode } from '../types';

const TreeNode = ({ node, depth = 0 }: { node: KnowledgeNode; depth?: number }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="relative print:break-inside-avoid">
      <div 
        className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
            ${depth === 0 ? 'bg-primary text-white mb-4 shadow-md print:bg-slate-800 print:text-white' : 'hover:bg-slate-100'}
            ${node.isWeakPoint ? 'ring-2 ring-red-400 bg-red-50' : ''}
        `}
        onClick={() => setExpanded(!expanded)}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className={`w-3 h-3 rounded-full ${depth === 0 ? 'bg-white' : 'bg-primary'}`}></div>
        <span className={`font-medium ${depth === 0 ? 'text-lg' : 'text-sm'}`}>{node.name}</span>
        {node.children && (
            <span className="text-xs opacity-60 ml-auto print:hidden">{expanded ? '−' : '+'}</span>
        )}
      </div>
      
      {expanded && node.children && (
        <div className="relative">
             {/* Vertical Line Connector (Simple CSS hack) */}
            <div 
                className="absolute left-0 border-l border-slate-200 h-full print:border-slate-400" 
                style={{ left: `${(depth * 24) + 13}px`, top: '-10px' }}
            ></div>
            <div>
                {node.children.map((child, idx) => (
                    <TreeNode key={idx} node={child} depth={depth + 1} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

const KnowledgeMap = () => {
  const [subject, setSubject] = useState('');
  const [treeData, setTreeData] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject) return;
    setLoading(true);
    try {
        const data = await generateKnowledgeTree(subject);
        setTreeData(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleExport = () => {
      window.print();
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Knowledge Map</h1>
          <p className="text-slate-500">Visualize structure and identify weak points.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Enter subject (e.g. Calculus)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <span>Generate</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 overflow-auto relative print:border-none print:shadow-none print:p-0">
        {treeData ? (
          <div className="max-w-3xl mx-auto">
             <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button 
                    onClick={handleExport}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-md flex items-center gap-1 text-sm font-medium" 
                    title="Export PDF"
                >
                    <Download size={18} /> Export
                </button>
             </div>
             <div className="hidden print:block mb-4 text-center">
                <h2 className="text-xl font-bold">{subject} - Knowledge Map</h2>
             </div>
             
             <TreeNode node={treeData} />
             
             {/* Simulated Weak Point Suggestion */}
             <div className="mt-12 p-4 bg-orange-50 border border-orange-200 rounded-lg print:border-slate-300 print:bg-transparent">
                <h4 className="text-orange-800 font-bold mb-2 print:text-black">Recommended Practice</h4>
                <p className="text-sm text-orange-700 mb-2 print:text-slate-600">Based on your recent questions, we recommend practicing these sub-topics found in the map:</p>
                <div className="flex gap-2 print:hidden">
                    <button className="text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100">
                        Take Quiz: {treeData.children?.[0]?.name || "Basics"}
                    </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 print:hidden">
            <Share2 className="w-16 h-16 mb-4 opacity-20" />
            <p>Enter a subject to generate a mind map</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeMap;