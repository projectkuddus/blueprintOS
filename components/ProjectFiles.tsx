
import React, { useState } from 'react';
import { Project, Asset, AssetType } from '../types';
import { 
  FileText, Image as ImageIcon, Box, Download, 
  Calendar, User, HardDrive, Filter, FolderOpen, Eye, Search, X
} from 'lucide-react';

interface ProjectFilesProps {
  project: Project;
  onPreview?: (file: Asset) => void; // Added handler
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ project, onPreview }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AssetType | 'all'>('all');
  
  // Helper to calculate total project storage usage
  const calculateTotalUsage = () => {
    let bytes = 0;
    let count = 0;
    project.stages.forEach(stage => {
      stage.assets.forEach(asset => {
        bytes += asset.size || 0;
        count++;
      });
    });
    return { bytes, count };
  };

  const { bytes, count } = calculateTotalUsage();

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'cad': return <Box className="text-black" size={20} />;
      case '3d': return <Box className="text-black" size={20} />;
      case 'image': return <ImageIcon className="text-emerald-600" size={20} />;
      case 'pdf': return <FileText className="text-red-500" size={20} />;
      default: return <FileText className="text-slate-400" size={20} />;
    }
  };

  const handleAction = (asset: Asset) => {
    if (onPreview) {
        onPreview(asset);
    } else {
        window.open(asset.url, '_blank');
    }
  };

  // Check if any files exist after filtering
  const hasMatchingFiles = project.stages.some(stage => 
    stage.assets.some(asset => {
      const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeFilter === 'all' || asset.type === activeFilter;
      return matchesSearch && matchesType;
    })
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[600px]">
      
      {/* Header Statistics */}
      <div className="bg-zinc-50 border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <FolderOpen size={24} className="text-black" />
           </div>
           <div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">Project Archives</h2>
              <p className="text-sm text-slate-500 font-medium">Master repository of all drawings, documents, and renders.</p>
           </div>
        </div>
        
        <div className="flex gap-8 border-l border-slate-200 pl-8">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Files</p>
              <p className="text-2xl font-bold text-black">{count}</p>
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Storage Used</p>
              <p className="text-2xl font-bold text-black flex items-center gap-2">
                 <HardDrive size={18} className="text-emerald-500" />
                 {formatBytes(bytes)}
              </p>
           </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-6">
          <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 text-sm focus:border-black outline-none bg-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {(['all', 'cad', '3d', 'pdf', 'image', 'document'] as const).map(type => (
               <button
                 key={type}
                 onClick={() => setActiveFilter(type as AssetType | 'all')}
                 className={`px-4 py-2 text-xs font-bold uppercase border transition-all whitespace-nowrap ${
                    activeFilter === type 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-black hover:text-black'
                 }`}
               >
                 {type === 'all' ? 'All Files' : type}
               </button>
            ))}
          </div>
      </div>

      {/* Files Timeline */}
      <div className="relative pl-8 border-l border-dashed border-slate-300 space-y-12">
         {project.stages.map((stage, index) => {
            // Filter Assets
            const filteredAssets = stage.assets.filter(asset => {
                const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType = activeFilter === 'all' || asset.type === activeFilter;
                return matchesSearch && matchesType;
            });

            // Only show stages that have matching files
            if (filteredAssets.length === 0) return null;

            return (
               <div key={stage.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[39px] top-0 w-5 h-5 bg-white border-2 border-black rounded-full flex items-center justify-center">
                     <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>

                  {/* Stage Header */}
                  <div className="flex items-baseline gap-4 mb-6">
                     <h3 className="text-lg font-bold text-black uppercase tracking-tight">
                        <span className="text-slate-400 mr-2 text-sm">Phase {(index + 1).toString().padStart(2, '0')}</span>
                        {stage.name}
                     </h3>
                     <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${stage.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-slate-500'}`}>
                        {stage.status}
                     </span>
                  </div>

                  {/* Assets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {filteredAssets.map((asset) => (
                        <div 
                           key={asset.id} 
                           className="group bg-white border border-slate-200 p-4 hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                           <div className="flex justify-between items-start mb-3">
                              {getAssetIcon(asset.type)}
                              <span className="text-[9px] font-bold uppercase bg-zinc-50 text-slate-500 px-1.5 py-0.5 border border-slate-100">
                                 {asset.type}
                              </span>
                           </div>
                           
                           <h4 className="text-xs font-bold text-black uppercase truncate mb-1" title={asset.title}>
                              {asset.title}
                           </h4>
                           
                           <div className="mt-auto pt-4 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                 <User size={10} /> {asset.uploadedBy}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-2">
                                 <span className="flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(asset.uploadDate).toLocaleDateString()}
                                 </span>
                                 <span>{formatBytes(asset.size || 0)}</span>
                              </div>
                              
                              <button 
                                 onClick={() => handleAction(asset)}
                                 className="w-full mt-2 bg-black text-white text-[10px] font-bold uppercase py-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <Eye size={12} /> View File
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            );
         })}

         {/* Empty State */}
         {!hasMatchingFiles && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
               <Filter size={48} className="mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-wider">No matching files found</p>
               <p className="text-xs mt-2">Try adjusting your filters or upload new files in the Workflow view.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ProjectFiles;
