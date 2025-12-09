
import React, { useState, useRef, useEffect } from 'react';
import { Project, Role, TeamMember } from '../types';
import { 
  Users, Shield, Crown, HardHat, User, Check, X, Lock, Unlock, 
  UserPlus, Trash2, Search, ZoomIn, ZoomOut, Maximize, Minus, Plus
} from 'lucide-react';

interface ProjectHierarchyProps {
  project: Project;
  isCoreAccount: boolean;
  onUpdateStageAccess: (stageId: string, userName: string, hasAccess: boolean) => void;
  onUpdateTeam?: (action: 'add' | 'remove', role: Role, memberName?: string) => void;
  allTeamMembers?: TeamMember[];
}

interface NodeCardProps {
  name: string;
  role: string;
  type: 'core' | 'exec' | 'ext';
  isSelected: boolean;
  isMatch: boolean;
  isCoreAccount: boolean;
  onSelect: () => void;
  onRemove?: (e: React.MouseEvent) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ 
  name, role, type, isSelected, isMatch, isCoreAccount, onSelect, onRemove 
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative w-56 p-4 border-2 transition-all cursor-pointer group shadow-sm flex items-center gap-3
        ${isSelected ? 'border-black bg-black text-white z-10 scale-105 shadow-xl' : 'border-slate-200 bg-white hover:border-black hover:shadow-md'}
        ${!isMatch ? 'opacity-30 blur-[1px]' : 'opacity-100'}
      `}
    >
      <div className={`
        w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border-2 
        ${isSelected ? 'border-white bg-white text-black' : 'border-black bg-black text-white'}
      `}>
        {type === 'core' && <Crown size={16} />}
        {type === 'exec' && <HardHat size={16} />}
        {type === 'ext' && <User size={16} />}
      </div>
      <div className="min-w-0">
         <p className="font-bold text-xs truncate w-full">{name}</p>
         <p className={`text-[9px] uppercase font-bold tracking-wider truncate w-full ${isSelected ? 'text-zinc-400' : 'text-slate-500'}`}>{role}</p>
      </div>
      
      {/* Access Indicator / Remove */}
      {isCoreAccount && onRemove && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button 
              onClick={onRemove}
              className={`p-1 rounded-sm transition-colors ${isSelected ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
              title="Remove User"
            >
                <Trash2 size={12} />
            </button>
        </div>
      )}
    </div>
  );
};

const ProjectHierarchy: React.FC<ProjectHierarchyProps> = ({ project, isCoreAccount, onUpdateStageAccess, onUpdateTeam, allTeamMembers }) => {
  const [selectedUser, setSelectedUser] = useState<{name: string, role: string} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState<{role: string, name: string}>({ role: '', name: '' });
  
  // Interactive Canvas State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Collapsible State
  const [showExecution, setShowExecution] = useState(true);
  const [showExternal, setShowExternal] = useState(true);

  // Grouping Logic
  const management = [
    { role: Role.ARCHITECT_HEAD, name: project.team[Role.ARCHITECT_HEAD] },
    { role: Role.PROJECT_MANAGER, name: project.team[Role.PROJECT_MANAGER] },
    { role: Role.ACCOUNT_MANAGER, name: project.team[Role.ACCOUNT_MANAGER] },
  ].filter(p => p.name);

  const execution = [
    { role: Role.ARCHITECT_SENIOR, name: project.team[Role.ARCHITECT_SENIOR] },
    { role: Role.ARCHITECT_JUNIOR, name: project.team[Role.ARCHITECT_JUNIOR] },
    { role: Role.ENGINEER_MAIN, name: project.team[Role.ENGINEER_MAIN] },
    { role: Role.ENGINEER_STRUCTURAL, name: project.team[Role.ENGINEER_STRUCTURAL] },
    { role: Role.ENGINEER_SITE, name: project.team[Role.ENGINEER_SITE] },
    { role: Role.CONSTRUCTION_MANAGER, name: project.team[Role.CONSTRUCTION_MANAGER] },
    { role: Role.SUPERVISOR, name: project.team[Role.SUPERVISOR] },
    { role: Role.CARPENTER, name: project.team[Role.CARPENTER] },
  ].filter(p => p.name);

  const external = [
    { role: Role.CLIENT, name: project.team[Role.CLIENT] },
    { role: Role.DEVELOPER, name: project.team[Role.DEVELOPER] },
    { role: Role.MARKETING, name: project.team[Role.MARKETING] },
    { role: Role.PHOTOGRAPHER, name: project.team[Role.PHOTOGRAPHER] },
    { role: Role.SITE_DOCUMENTATION, name: project.team[Role.SITE_DOCUMENTATION] },
    { role: Role.AWARD_SUBMISSION, name: project.team[Role.AWARD_SUBMISSION] },
    { role: Role.BUSINESS_ANALYST, name: project.team[Role.BUSINESS_ANALYST] },
  ].filter(p => p.name);

  // Pan & Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(Math.max(scale + delta, 0.5), 2);
      setScale(newScale);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleAddMember = () => {
      if (onUpdateTeam && newMemberData.role && newMemberData.name) {
          onUpdateTeam('add', newMemberData.role as Role, newMemberData.name);
          setIsAddModalOpen(false);
          setNewMemberData({ role: '', name: '' });
      }
  };

  const handleRemoveMember = (role: Role, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUpdateTeam && window.confirm(`Are you sure you want to remove the ${role} from this project?`)) {
          onUpdateTeam('remove', role);
          if (selectedUser?.role === role) setSelectedUser(null);
      }
  };

  const availableRoles = Object.values(Role).filter(r => !project.team[r]);

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[700px] border border-slate-200 bg-zinc-50 overflow-hidden relative">
      
      {/* LEFT: Interactive Tree Canvas */}
      <div 
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-paper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        ref={containerRef}
      >
         {/* Toolbar */}
         <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-white border border-slate-200 p-1 flex flex-col gap-1 shadow-md">
                <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-zinc-100 text-slate-600" title="Zoom In"><ZoomIn size={16} /></button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-zinc-100 text-slate-600" title="Zoom Out"><ZoomOut size={16} /></button>
                <button onClick={resetView} className="p-2 hover:bg-zinc-100 text-slate-600" title="Reset View"><Maximize size={16} /></button>
            </div>
         </div>

         {/* Search Bar */}
         <div className="absolute top-4 left-16 z-20 w-64">
            <div className="relative shadow-md">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Find member..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase focus:border-black outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-black"><X size={14}/></button>}
            </div>
         </div>

         {/* Add Button */}
         {isCoreAccount && onUpdateTeam && (
             <div className="absolute top-4 right-4 z-20">
                 <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2.5 text-xs font-bold uppercase hover:bg-zinc-800 shadow-lg"
                 >
                     <UserPlus size={14} /> Add Member
                 </button>
             </div>
         )}

         {/* The Tree Content */}
         <div 
            className="absolute origin-center transition-transform duration-75 ease-out w-full h-full flex items-center justify-center"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
         >
            <div className="flex flex-col items-center">
                {/* Root: Project Name */}
                <div className="mb-16 border-2 border-black bg-white px-8 py-4 shadow-xl z-10 text-center min-w-[300px]">
                    <h3 className="font-black text-xl uppercase tracking-tight">{project.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Project Hierarchy Root</p>
                </div>
                
                {/* Connector to Level 1 */}
                <div className="w-0.5 h-16 bg-black -mt-16 mb-0"></div>

                {/* Level 1: Management (Horizontal Row) */}
                <div className="relative flex justify-center gap-8 mb-20 pt-8 border-t-2 border-black">
                    {/* Vertical Connectors up to parent line */}
                    {management.map((p, i) => (
                        <div key={i} className="relative flex flex-col items-center">
                            <div className="w-0.5 h-8 bg-black absolute -top-8"></div>
                            <NodeCard 
                              name={p.name!} 
                              role={p.role} 
                              type="core" 
                              isSelected={selectedUser?.name === p.name!}
                              isMatch={searchQuery ? (p.name!.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase())) : true}
                              isCoreAccount={isCoreAccount}
                              onSelect={() => setSelectedUser({ name: p.name!, role: p.role })}
                              onRemove={onUpdateTeam ? (e) => handleRemoveMember(p.role as Role, e) : undefined}
                            />
                            
                            {/* Down Connector */}
                            <div className="w-0.5 h-12 bg-black absolute -bottom-12"></div>
                        </div>
                    ))}
                </div>

                {/* Branch Splitter */}
                <div className="relative w-[600px] border-t-2 border-black flex justify-between -mt-8">
                    {/* Left Branch: Execution */}
                    <div className="flex flex-col items-center -ml-px">
                        <div className="w-0.5 h-8 bg-black"></div>
                        <button 
                            onClick={() => setShowExecution(!showExecution)}
                            className="bg-white border-2 border-black rounded-full p-1 z-10 hover:bg-zinc-100 mb-2"
                        >
                            {showExecution ? <Minus size={12}/> : <Plus size={12}/>}
                        </button>
                        <div className="bg-zinc-100 border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase text-slate-500 mb-4">
                            Execution Team
                        </div>
                        
                        {showExecution && (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-8 relative animate-in fade-in slide-in-from-top-4">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200 -z-10"></div>
                                {execution.map((p, i) => (
                                    <NodeCard 
                                      key={i} 
                                      name={p.name!} 
                                      role={p.role} 
                                      type="exec" 
                                      isSelected={selectedUser?.name === p.name!}
                                      isMatch={searchQuery ? (p.name!.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase())) : true}
                                      isCoreAccount={isCoreAccount}
                                      onSelect={() => setSelectedUser({ name: p.name!, role: p.role })}
                                      onRemove={onUpdateTeam ? (e) => handleRemoveMember(p.role as Role, e) : undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Branch: External */}
                    <div className="flex flex-col items-center -mr-px">
                        <div className="w-0.5 h-8 bg-black"></div>
                        <button 
                            onClick={() => setShowExternal(!showExternal)}
                            className="bg-white border-2 border-black rounded-full p-1 z-10 hover:bg-zinc-100 mb-2"
                        >
                            {showExternal ? <Minus size={12}/> : <Plus size={12}/>}
                        </button>
                        <div className="bg-zinc-100 border border-slate-300 px-3 py-1 text-[10px] font-bold uppercase text-slate-500 mb-4">
                            External / Partners
                        </div>

                        {showExternal && (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-8 relative animate-in fade-in slide-in-from-top-4">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200 -z-10"></div>
                                {external.map((p, i) => (
                                    <NodeCard 
                                      key={i} 
                                      name={p.name!} 
                                      role={p.role} 
                                      type="ext" 
                                      isSelected={selectedUser?.name === p.name!}
                                      isMatch={searchQuery ? (p.name!.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase())) : true}
                                      isCoreAccount={isCoreAccount}
                                      onSelect={() => setSelectedUser({ name: p.name!, role: p.role })}
                                      onRemove={onUpdateTeam ? (e) => handleRemoveMember(p.role as Role, e) : undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* RIGHT: Access Control Panel (Collapsible/Overlay on Mobile, Fixed on Desktop) */}
      <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-30">
         {selectedUser ? (
           <>
             <div className="p-6 border-b border-black bg-black text-white">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={16}/></button>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl border-4 border-zinc-800">
                      {selectedUser.name[0]}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg leading-tight w-40">{selectedUser.name}</h3>
                      <p className="text-[10px] uppercase text-emerald-400 font-bold mt-1 tracking-wider">{selectedUser.role}</p>
                   </div>
                </div>
                {isCoreAccount && (
                  <div className="flex items-center gap-2 text-[10px] bg-zinc-900 p-2 rounded border border-zinc-800 text-zinc-300">
                    <Shield size={12} />
                    <span>Permission Manager</span>
                  </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto p-0 bg-zinc-50">
                <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
                   <h4 className="text-[10px] font-bold uppercase text-slate-500">Stage Access</h4>
                   <span className="text-[10px] font-bold text-black">{project.stages.length} Phases</span>
                </div>
                
                {project.stages.map((stage) => {
                   const hasAccess = stage.participants?.includes(selectedUser.name) || 
                                     stage.tasks.some(t => t.assignedTo === selectedUser.role || t.assigneeName === selectedUser.name);
                   
                   return (
                      <div key={stage.id} className={`p-3 border-b border-slate-100 flex items-center justify-between ${hasAccess ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                         <div className="flex-1 min-w-0 pr-2">
                            <p className={`text-xs font-bold truncate ${hasAccess ? 'text-black' : 'text-slate-400'}`}>{stage.name}</p>
                            <p className="text-[9px] text-slate-400 uppercase">{stage.status}</p>
                         </div>
                         
                         {isCoreAccount ? (
                           <button 
                             onClick={() => onUpdateStageAccess(stage.id, selectedUser.name, !hasAccess)}
                             className={`
                               flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border transition-all
                               ${hasAccess 
                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500' 
                                 : 'border-slate-200 bg-white text-slate-300 hover:border-black hover:text-black'}
                             `}
                             title={hasAccess ? "Revoke Access" : "Grant Access"}
                           >
                             {hasAccess ? <Unlock size={14} /> : <Lock size={14} />}
                           </button>
                         ) : (
                           <div className="text-slate-300">
                              {hasAccess ? <Check size={14} className="text-emerald-500" /> : <Lock size={14} />}
                           </div>
                         )}
                      </div>
                   )
                })}
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-zinc-50/50">
              <Users size={48} className="mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-wider text-xs text-black">Member Details</p>
              <p className="text-[10px] mt-2 max-w-[200px] leading-relaxed">Select any node on the hierarchy map to view permissions and access levels.</p>
           </div>
         )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm border-2 border-black p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold uppercase flex items-center gap-2"><UserPlus size={18}/> Add to Hierarchy</h3>
                      <button onClick={() => setIsAddModalOpen(false)}><X size={20} className="text-slate-400 hover:text-black" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Role (Level)</label>
                          <select 
                             className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none"
                             value={newMemberData.role}
                             onChange={e => setNewMemberData({...newMemberData, role: e.target.value})}
                          >
                             <option value="">Select Role</option>
                             {availableRoles.map(r => (
                                 <option key={r} value={r}>{r}</option>
                             ))}
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Team Member</label>
                          <select 
                             className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none"
                             value={newMemberData.name}
                             onChange={e => setNewMemberData({...newMemberData, name: e.target.value})}
                          >
                             <option value="">Select Person</option>
                             {allTeamMembers?.map(m => (
                                 <option key={m.id} value={m.name}>{m.name} ({m.email})</option>
                             ))}
                          </select>
                      </div>

                      <button 
                        onClick={handleAddMember}
                        disabled={!newMemberData.role || !newMemberData.name}
                        className="w-full bg-black text-white py-3 text-xs font-bold uppercase hover:bg-zinc-800 disabled:opacity-50 mt-2"
                      >
                          Confirm Assignment
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProjectHierarchy;
