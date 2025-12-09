
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
      className="group bg-white rounded border border-slate-200 overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 hover:shadow-md hover:border-slate-400 relative"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100 border-b border-slate-100">
        <img 
          src={project.thumbnailUrl} 
          alt={project.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
        />
        
        {/* Status Pill */}
        <div className="absolute top-2 left-2">
             <div className="bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-900 uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-slate-100 rounded-sm">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                {currentStageName}
             </div>
        </div>

        {/* Categories Overlay */}
        <div className="absolute bottom-2 left-2 flex gap-1">
            <span className="bg-slate-900 text-white px-1.5 py-0.5 text-[9px] font-bold uppercase flex items-center gap-1 shadow-sm rounded-sm">
                <Building size={8} /> {project.type}
            </span>
            <span className="bg-white text-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase flex items-center gap-1 shadow-sm rounded-sm border border-slate-200">
                <Users size={8} /> {project.classification}
            </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-display font-bold text-base text-slate-900 leading-tight group-hover:text-black transition-colors uppercase truncate w-full">
            {project.name}
          </h3>
        </div>
        
        <div className="space-y-2 text-xs text-slate-600 mb-4 flex-1">
          <div className="flex items-center justify-between p-1.5 rounded-sm bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 max-w-[80%]">
                <MapPin size={12} className="text-slate-400 shrink-0"/>
                <span className="text-[10px] font-medium truncate uppercase">{project.location}</span>
            </div>
            {project.googleMapLink && (
                <button 
                    onClick={handleMapClick}
                    className="p-0.5 hover:bg-white rounded-full text-slate-400 hover:text-black transition-colors"
                >
                    <ArrowRight size={10} className="-rotate-45" />
                </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-1">
             <DollarSign size={12} className="text-slate-400" />
             <span className="flex items-center gap-1 text-[10px] font-medium uppercase">
               Budget: 
               {canViewFinancials ? (
                 <span className="font-mono font-bold text-slate-900">${project.budget.toLocaleString()}</span>
               ) : (
                 <span className="flex items-center text-slate-400 bg-slate-100 px-1 py-0.5 rounded-sm text-[9px]">
                   <Lock size={8} className="mr-1"/> HIDDEN
                 </span>
               )}
             </span>
          </div>
          
          <div className="flex items-center gap-2 px-1">
             <Calendar size={12} className="text-slate-400" />
             <span className="text-[10px] font-medium uppercase truncate">Client: {project.clientName}</span>
          </div>
        </div>

        {/* Footer with Team & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
           <div className="flex -space-x-1.5 pl-1">
             {Object.entries(project.team).slice(0, 3).map(([role, name], i) => (
                <div key={i} title={`${name} (${role})`} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 uppercase">
                  {typeof name === 'string' ? name.substring(0, 2) : '??'}
                </div>
             ))}
             {Object.keys(project.team).length > 3 && (
               <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                 +{Object.keys(project.team).length - 3}
               </div>
             )}
           </div>
           
           <button className="w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-900 hover:bg-black hover:text-white transition-all duration-300">
             <ArrowRight size={12} />
           </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-100">
          <div 
            className="h-full bg-emerald-500" 
            style={{ width: `${progressPercent}%` }}
          />
      </div>
    </div>
  );
};

export default ProjectCard;
