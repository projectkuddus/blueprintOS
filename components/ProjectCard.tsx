

import React from 'react';
import { Project } from '../types';
import { MapPin, Calendar, DollarSign, ArrowRight, Lock, Building, Users } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  canViewFinancials: boolean;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, canViewFinancials, onClick }) => {
  const currentStageName = project.stages.find(s => s.id === project.currentStageId)?.name || 'Unknown Stage';
  const stageIndex = project.stages.findIndex(s => s.id === project.currentStageId);
  // Calculate percentage, ensure valid number
  const totalStages = project.stages.length || 1;
  const progressPercent = Math.round(((stageIndex + 1) / totalStages) * 100);

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.googleMapLink) {
        window.open(project.googleMapLink, '_blank');
    }
  };

  return (
    <div 
      onClick={() => onClick(project)}
      className="group bg-white border border-slate-200 hover:border-black transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md relative"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={project.thumbnailUrl} 
          alt={project.name} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
             <div className="bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-black uppercase tracking-wider shadow-sm">
                {currentStageName}
             </div>
        </div>

        {/* Categories Overlay */}
        <div className="absolute bottom-3 left-4 flex gap-2">
            <span className="bg-black/80 text-white px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm flex items-center gap-1">
                <Building size={10} /> {project.type}
            </span>
            <span className="bg-white/90 text-black px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm flex items-center gap-1">
                <Users size={10} /> {project.classification}
            </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col bg-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-black group-hover:underline decoration-1 underline-offset-4 leading-tight">
            {project.name}
          </h3>
        </div>
        
        <div className="space-y-3 text-sm text-slate-600 mb-8 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                {project.location}
            </div>
            {project.googleMapLink && (
                <button 
                    onClick={handleMapClick}
                    className="p-1 hover:bg-zinc-100 rounded-full text-emerald-600 transition-colors"
                    title="View on Map"
                >
                    <MapPin size={14} className="fill-current" />
                </button>
            )}
          </div>
          <div className="flex items-center gap-3">
             <DollarSign size={16} className="text-slate-400" />
             <span className="flex items-center gap-2">
               Budget: 
               {canViewFinancials ? (
                 <span className="font-mono font-bold">${project.budget.toLocaleString()}</span>
               ) : (
                 <span className="flex items-center text-slate-300 bg-slate-100 px-1 rounded-sm">
                   <Lock size={10} className="mr-1"/> HIDDEN
                 </span>
               )}
             </span>
          </div>
          <div className="flex items-center gap-3">
             <Calendar size={16} className="text-slate-400" />
             Client: {project.clientName}
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
           <div className="flex -space-x-2">
             {/* Mock avatars */}
             {Object.entries(project.team).slice(0, 3).map(([role, name], i) => (
                <div key={i} title={`${name} (${role})`} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                  {typeof name === 'string' ? name.substring(0, 2) : '??'}
                </div>
             ))}
             {Object.keys(project.team).length > 3 && (
               <div className="w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                 +{Object.keys(project.team).length - 3}
               </div>
             )}
           </div>
           
           <span className="flex items-center gap-1 text-xs font-bold text-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
             Details <ArrowRight size={14} />
           </span>
        </div>
      </div>

      {/* Progress Bar at Bottom of Card */}
      <div className="w-full bg-zinc-100 h-1.5">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
      </div>
    </div>
  );
};

export default ProjectCard;