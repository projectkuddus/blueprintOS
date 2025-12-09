
import React, { useState } from 'react';
import { Project, TeamMember, StudioProfile, Role, Asset } from '../types';
import { MOCK_STUDIO_PROFILE } from '../constants';
import { 
  Building, MapPin, Globe, Mail, Save, Calendar, 
  Award, Briefcase, Layout, Pencil, Share2, Crown,
  Database, HardDrive, FileText, Image as ImageIcon, Box, Plus, ArrowUpRight
} from 'lucide-react';

interface StudioSettingsProps {
  projects: Project[];
  teamMembers: TeamMember[];
  isCoreAccount: boolean;
  onEditProject: (project: Project) => void;
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
}

const StudioSettings: React.FC<StudioSettingsProps> = ({ 
  projects, 
  teamMembers, 
  isCoreAccount,
  onEditProject,
  onCreateProject,
  onViewProject
}) => {
  const [profile, setProfile] = useState<StudioProfile>(MOCK_STUDIO_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  // Filter for Architects only
  const architects = teamMembers.filter(m => 
    m.role === Role.ARCHITECT_HEAD || 
    m.role === Role.ARCHITECT_SENIOR || 
    m.role === Role.ARCHITECT_JUNIOR
  );
  
  // Calculate Metrics
  const completedProjects = projects.filter(p => {
    // Determine if project is complete based on 'handover' stage being active or past
    const handoverStageIndex = p.stages.findIndex(s => s.id.includes('handover'));
    const currentStageIndex = p.stages.findIndex(s => s.id === p.currentStageId);
    return currentStageIndex >= handoverStageIndex;
  }).length;

  const totalSqFt = projects.reduce((acc, p) => acc + p.squareFootage, 0);

  // Storage Calculation Logic
  const STORAGE_LIMIT_GB = 500;
  const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024;
  
  let usedBytes = 0;
  let cadBytes = 0;
  let modelBytes = 0;
  let imageBytes = 0;
  let docBytes = 0;

  projects.forEach(project => {
    project.stages.forEach(stage => {
      stage.assets.forEach(asset => {
        const size = asset.size || 0;
        usedBytes += size;
        if (asset.type === 'cad') cadBytes += size;
        else if (asset.type === '3d') modelBytes += size;
        else if (asset.type === 'image') imageBytes += size;
        else docBytes += size;
      });
    });
  });

  const percentUsed = Math.min((usedBytes / STORAGE_LIMIT_BYTES) * 100, 100);

  const formatBytes = (bytes: number, decimals = 1) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleSave = () => {
    // In a real app, this would make an API call to save profile details
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Hero / Cover Section */}
      <div className="relative h-64 bg-black overflow-hidden group">
        <img 
          src={profile.heroImageUrl} 
          alt="Studio Cover" 
          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end">
           <div className="flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-sm border-4 border-black flex items-center justify-center text-4xl font-black text-black">
                {profile.name.charAt(0)}
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <input 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="text-4xl font-black text-white/90 bg-transparent border-b border-white/50 outline-none w-full placeholder:text-zinc-500"
                  />
                ) : (
                  <h1 className="text-4xl font-black text-white uppercase tracking-tight">{profile.name}</h1>
                )}
                
                {isEditing ? (
                  <input 
                    value={profile.tagline}
                    onChange={(e) => setProfile({...profile, tagline: e.target.value})}
                    className="text-zinc-300 bg-transparent border-b border-white/30 outline-none w-full mt-1 text-sm"
                  />
                ) : (
                   <p className="text-zinc-300 font-medium text-lg">{profile.tagline}</p>
                )}
              </div>
           </div>

           <div className="flex gap-3">
              {isCoreAccount && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
              )}
              {isEditing && (
                <button 
                  onClick={handleSave}
                  className="bg-emerald-500 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <Save size={14} /> Done Editing
                </button>
              )}
              <button className="bg-black border border-zinc-700 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-900 transition-colors flex items-center gap-2">
                 <Share2 size={14} /> Share
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Info */}
        <div className="space-y-8">
          
          {/* Metrics Bar */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
             <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Projects</p>
                   <p className="text-3xl font-bold text-black">{projects.length}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Built</p>
                   <p className="text-3xl font-bold text-emerald-600">{completedProjects}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Total Area</p>
                   <p className="text-xl font-bold text-black">{(totalSqFt / 1000).toFixed(1)}k <span className="text-sm text-slate-400">sq ft</span></p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Est.</p>
                   <p className="text-xl font-bold text-black">{profile.foundedYear}</p>
                </div>
             </div>
          </div>

          {/* Data & Storage Section */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
             <h3 className="text-sm font-bold text-black uppercase mb-4 flex items-center gap-2">
               <HardDrive size={16} /> Data & Storage
             </h3>

             <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-black uppercase">Studio Storage</span>
                    <span className="text-xs font-bold text-slate-500">{formatBytes(usedBytes)} / {STORAGE_LIMIT_GB} GB</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 border border-slate-200">
                    <div className="h-full bg-black transition-all duration-700" style={{ width: `${percentUsed}%` }}></div>
                </div>
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                     <span className="flex items-center gap-2 text-slate-600"><Box size={12} /> 3D Models / Renders</span>
                     <span className="font-mono text-black">{formatBytes(modelBytes)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                     <span className="flex items-center gap-2 text-slate-600"><Layout size={12} /> CAD / Drawings</span>
                     <span className="font-mono text-black">{formatBytes(cadBytes)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                     <span className="flex items-center gap-2 text-slate-600"><ImageIcon size={12} /> Site Photos</span>
                     <span className="font-mono text-black">{formatBytes(imageBytes)}</span>
                 </div>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-100 bg-zinc-50 p-3 text-[10px] text-slate-500 leading-relaxed">
                 <p className="font-bold uppercase mb-1 flex items-center gap-1"><Database size={10} /> Storage Policy</p>
                 <ul className="list-disc pl-4 space-y-1">
                     <li>Standard Studio Limit: <strong>500 GB</strong> Total.</li>
                     <li>Recommended per Project: <strong>10 GB - 50 GB</strong>.</li>
                     <li>Large 3D files (Revit/Max) are compressed on upload.</li>
                     <li>Contact Enterprise Support for 2TB+ Custom Plans.</li>
                 </ul>
             </div>
          </div>

          {/* Contact & Bio */}
          <div className="bg-black text-white border border-black p-6 shadow-sm">
             <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
               <Building size={16} /> Studio Details
             </h3>
             
             <div className="space-y-4 text-sm">
                {isEditing ? (
                  <textarea 
                    value={profile.description}
                    onChange={(e) => setProfile({...profile, description: e.target.value})}
                    className="w-full border border-zinc-700 bg-zinc-900 text-white p-2 text-sm h-32 focus:border-white outline-none"
                  />
                ) : (
                  <p className="text-zinc-300 leading-relaxed">{profile.description}</p>
                )}

                <div className="pt-4 border-t border-zinc-800 space-y-3">
                   <div className="flex items-center gap-3 text-zinc-300">
                      <MapPin size={16} className="text-zinc-500" />
                      {isEditing ? (
                        <input value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="border-b border-zinc-700 bg-transparent focus:border-white outline-none flex-1 text-white" />
                      ) : profile.location}
                   </div>
                   <div className="flex items-center gap-3 text-zinc-300">
                      <Globe size={16} className="text-zinc-500" />
                      {isEditing ? (
                        <input value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} className="border-b border-zinc-700 bg-transparent focus:border-white outline-none flex-1 text-white" />
                      ) : <a href={`https://${profile.website}`} className="hover:text-white">{profile.website}</a>}
                   </div>
                   <div className="flex items-center gap-3 text-zinc-300">
                      <Mail size={16} className="text-zinc-500" />
                      {isEditing ? (
                        <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="border-b border-zinc-700 bg-transparent focus:border-white outline-none flex-1 text-white" />
                      ) : <a href={`mailto:${profile.email}`} className="hover:text-white">{profile.email}</a>}
                   </div>
                </div>
             </div>
          </div>

          {/* Full Team Roster */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
             <h3 className="text-sm font-bold text-black uppercase mb-4 flex items-center gap-2">
               <Crown size={16} /> Full Team
             </h3>
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {member.name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-black">{member.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{member.role}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Portfolio */}
        <div className="lg:col-span-2">
           <div className="bg-white border border-slate-200 p-6 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-black uppercase tracking-tight flex items-center gap-2">
                   <Briefcase size={20} /> Selected Works
                 </h3>
                 <div className="flex gap-2">
                    <button className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1 rounded-full">All</button>
                    <button className="text-[10px] font-bold uppercase bg-zinc-100 text-slate-500 hover:text-black px-3 py-1 rounded-full">Residential</button>
                    <button className="text-[10px] font-bold uppercase bg-zinc-100 text-slate-500 hover:text-black px-3 py-1 rounded-full">Commercial</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {projects.map(project => (
                    <div 
                        key={project.id} 
                        className="group relative cursor-pointer"
                        onClick={() => isEditing ? onEditProject(project) : onViewProject(project)}
                    >
                       <div className="relative aspect-[4/3] overflow-hidden mb-3 bg-zinc-100">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                            {project.stages.find(s => s.id === project.currentStageId)?.status === 'completed' ? 'Completed' : 'In Progress'}
                          </div>
                          
                          {/* Edit Overlay */}
                          {isEditing && (
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                <span className="bg-white text-black px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-2 shadow-lg">
                                   <Pencil size={12} /> Edit Details
                                </span>
                             </div>
                          )}

                          {/* View Overlay */}
                          {!isEditing && (
                             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                                <span className="bg-white text-black px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                   View Project <ArrowUpRight size={12} />
                                </span>
                             </div>
                          )}
                       </div>
                       <h4 className="font-bold text-black text-lg group-hover:underline decoration-1 underline-offset-4">{project.name}</h4>
                       <p className="text-xs text-slate-500 uppercase">{project.location}</p>
                       <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-sm text-slate-600 font-medium">
                             {project.squareFootage.toLocaleString()} sqft
                          </span>
                       </div>
                    </div>
                 ))}
                 
                 {/* Empty State / Add New */}
                 {isEditing && (
                   <div 
                     onClick={onCreateProject}
                     className="border-2 border-dashed border-slate-200 flex flex-col items-center justify-center aspect-[4/3] text-slate-400 hover:border-black hover:text-black cursor-pointer transition-colors group"
                   >
                      <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-colors">
                         <Plus size={24} />
                      </div>
                      <p className="text-xs font-bold uppercase">Add Project to Portfolio</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StudioSettings;
