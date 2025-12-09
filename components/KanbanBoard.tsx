
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, Stage, Asset, Task, Comment, RolePermissions, ExpenseItem, Transaction, ProjectActivity } from '../types';
import { checkStorageQuota, simulateCloudUpload, determineAssetType } from '../services/storageService';
import { 
  CheckCircle2, Circle, Users, 
  ChevronRight, Image as ImageIcon, FileText, Box, 
  Upload, Plus, MessageSquare, Download, Lock,
  X, Calendar, User, Layout, ArrowRight, Eye, MoreHorizontal, Pencil,
  Link as LinkIcon, AlertCircle, Loader2, HardDrive, Trash2, ExternalLink, ListChecks, Target,
  Paperclip, Send, Square, CheckSquare, Check, Clock, ChevronDown, AlertTriangle, Coins, Receipt, DollarSign, ShoppingCart, Truck, PlayCircle, StopCircle, History, RotateCcw
} from 'lucide-react';

interface KanbanBoardProps {
  project: Project;
  userRole: Role;
  isCoreAccount: boolean;
  rolePermissions: Record<Role, RolePermissions>;
  onUpdateProject: (project: Project) => void;
  onPreview: (file: Asset) => void;
}

interface NewTaskForm {
  title: string;
  description: string;
  benchmark: string;
  requirements: string; 
  assignedRole: Role;
  assigneeName: string;
  dueDate: string;
  dependencies: string[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  project, 
  userRole, 
  isCoreAccount, 
  rolePermissions,
  onUpdateProject,
  onPreview
}) => {
  const [stages, setStages] = useState<Stage[]>(project.stages);
  const [selectedStageId, setSelectedStageId] = useState<string>(project.currentStageId);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'assets' | 'chat' | 'financials' | 'history'>('tasks');
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null); 
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [pendingChatFile, setPendingChatFile] = useState<File | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeAssetMenu, setActiveAssetMenu] = useState<string | null>(null);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [deleteStep, setDeleteStep] = useState<number>(0);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<ExpenseItem>>({
      description: '',
      category: 'Material',
      totalAmount: 0, 
      quantity: 1,
      unit: 'pc',
      unitPrice: 0
  });
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    benchmark: '',
    requirements: '',
    assignedRole: Role.ARCHITECT_HEAD,
    assigneeName: '',
    dueDate: '',
    dependencies: []
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStages(project.stages);
  }, [project]);

  const selectedStage = stages.find(s => s.id === selectedStageId) || stages[0];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedStage.discussions, selectedStageId, activeTab]); 

  const updateProjectStages = (updatedStages: Stage[], newTransactions?: Transaction[], newHistoryItem?: ProjectActivity) => {
    setStages(updatedStages);
    let updatedProject = { ...project, stages: updatedStages };
    
    if (newTransactions) {
        const currentTx = project.financials.transactions || [];
        const addedTotalInvoiced = newTransactions.filter(t => t.type === 'invoice').reduce((sum, t) => sum + t.amount, 0);
        updatedProject = {
            ...updatedProject,
            financials: {
                ...updatedProject.financials,
                transactions: [...currentTx, ...newTransactions],
                totalInvoiced: updatedProject.financials.totalInvoiced + addedTotalInvoiced,
                pendingBills: updatedProject.financials.pendingBills + addedTotalInvoiced
            }
        };
    }

    if (newHistoryItem) {
        updatedProject = {
            ...updatedProject,
            history: [newHistoryItem, ...(updatedProject.history || [])]
        };
    }

    onUpdateProject(updatedProject);
  };

  const createHistoryItem = (action: string, target?: string): ProjectActivity => ({
      id: `h-${Date.now()}`,
      user: userRole,
      action,
      target,
      timestamp: Date.now()
  });

  const permissions = rolePermissions[userRole] || { canEdit: false, canUpload: false, canViewFinancials: false };
  const canEdit = isCoreAccount || permissions.canEdit;
  const canUpload = isCoreAccount || permissions.canUpload;
  const canViewFinancials = isCoreAccount || permissions.canViewFinancials;
  const isReadOnly = userRole === Role.CLIENT && !isCoreAccount;

  const checkStageAccess = (stage: Stage) => {
    if (isCoreAccount) return true;
    const currentUserName = project.team[userRole]; 
    if (currentUserName && stage.participants?.includes(currentUserName)) return true;
    const hasAssignedTask = stage.tasks.some(t => t.assignedTo === userRole || (t.assigneeName && t.assigneeName === currentUserName));
    if (hasAssignedTask) return true;
    if (userRole === Role.CLIENT || userRole === Role.ARCHITECT_HEAD || userRole === Role.PROJECT_MANAGER) return true;
    return false;
  };

  const hasAccess = checkStageAccess(selectedStage);
  const teamMembers = Object.entries(project.team).map(([role, name]) => ({ role: role as Role, name: (name || '') as string }));
  const availableRoles = Object.values(Role);
  const availableAssignees = teamMembers.filter(m => m.role === newTask.assignedRole);
  const currentStageIndex = stages.findIndex(s => s.id === selectedStageId);
  const groupedDependencies = stages.filter((_, index) => index <= currentStageIndex).reduce((acc, stage) => {
        const stageTasks = stage.tasks.filter(t => t.id !== editingTaskId);
        if (stageTasks.length > 0) acc.push({ stageName: stage.name, tasks: stageTasks });
        return acc;
    }, [] as { stageName: string, tasks: Task[] }[]);

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'cad': return <Box className="text-slate-800" size={18} />;
      case '3d': return <Box className="text-indigo-600" size={18} />;
      case 'image': return <ImageIcon className="text-emerald-500" size={18} />;
      case 'pdf': return <FileText className="text-red-500" size={18} />;
      default: return <FileText className="text-slate-400" size={18} />;
    }
  };

  const isOverdue = (dateString: string) => {
    const due = new Date(dateString);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return due < today;
  };

  const handleTaskPropertyChange = (taskId: string, property: keyof Task, value: any) => {
      if (!canEdit) return;
      
      const task = stages.flatMap(s => s.tasks).find(t => t.id === taskId);
      const historyItem = createHistoryItem(`Updated ${property}`, task?.title || 'Unknown Task');

      const updatedStages = stages.map(stage => {
          if (stage.id === selectedStageId) {
              const updatedTasks = stage.tasks.map(t => t.id === taskId ? { ...t, [property]: value } : t);
              return { ...stage, tasks: updatedTasks };
          }
          return stage;
      });
      updateProjectStages(updatedStages, undefined, historyItem);
  };

  const cycleTaskStatus = (task: Task) => {
      if (!canEdit) return;
      const statusOrder: Task['status'][] = ['pending', 'in-progress', 'completed'];
      const currentIndex = statusOrder.indexOf(task.status);
      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
      handleTaskPropertyChange(task.id, 'status', nextStatus);
      if (nextStatus === 'completed') handleTaskPropertyChange(task.id, 'completedAt', Date.now());
  };

  const handleRevertHistory = (activityId: string) => {
      if (window.confirm("Revert project state to this point? This will undo subsequent actions.")) {
          alert("Project state reverting... (Simulation)");
          const historyItem = createHistoryItem('Reverted State', `to Activity ${activityId.split('-')[1]}`);
          updateProjectStages(stages, undefined, historyItem);
      }
  };

  const openNewTaskModal = () => { setEditingTaskId(null); setNewTask({ title: '', description: '', benchmark: '', requirements: '', assignedRole: Role.ARCHITECT_HEAD, assigneeName: '', dueDate: '', dependencies: [] }); setIsTaskModalOpen(true); };
  const openEditTaskModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({ title: task.title, description: task.description || '', benchmark: task.benchmark || '', requirements: (task.requirements || []).join('\n'), assignedRole: task.assignedTo, assigneeName: task.assigneeName || '', dueDate: task.dueDate, dependencies: task.dependencies || [] });
    setIsTaskModalOpen(true);
  };
  const closeModal = () => { setIsTaskModalOpen(false); setEditingTaskId(null); };
  
  const handleQuickAddTask = () => { 
      if (!quickAddTitle.trim()) return;
      const newTask: Task = {
        id: `t-${Date.now()}`,
        title: quickAddTitle,
        assignedTo: Role.ARCHITECT_HEAD,
        status: 'pending',
        dueDate: 'ASAP'
      };
      
      const updatedStages = stages.map(stage => {
          if (stage.id === selectedStageId) {
              return { ...stage, tasks: [...stage.tasks, newTask] };
          }
          return stage;
      });
      updateProjectStages(updatedStages, undefined, createHistoryItem('Added Quick Task', quickAddTitle));
      setQuickAddTitle('');
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { /* */ };
  const handleDeleteAsset = (assetId: string) => { /* */ };
  const formatChatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const getStageNumber = (index: number) => (index + 1).toString().padStart(2, '0');
  
  const getStatusColor = (status: Task['status']) => {
      switch (status) {
          case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          case 'in-progress': return 'bg-white text-slate-800 border-black';
          default: return 'bg-white text-slate-500 border-slate-200';
      }
  };

  const getStatusLabel = (status: Task['status']) => {
      switch (status) {
          case 'completed': return 'Done';
          case 'in-progress': return 'Active';
          default: return 'Pending';
      }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* 2. Compact Timeline */}
      <div className="relative overflow-hidden py-2 -mx-2 px-2">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 no-scrollbar snap-x snap-mandatory pb-2"
        >
          {stages.map((stage, index) => {
            const isCurrent = stage.id === project.currentStageId;
            const isSelected = stage.id === selectedStageId;
            const totalStageTasks = stage.tasks.length;
            const completedStageTasks = stage.tasks.filter(t => t.status === 'completed').length;
            const progressPercentage = totalStageTasks > 0 ? (completedStageTasks / totalStageTasks) * 100 : (stage.status === 'completed' ? 100 : 0);
            
            return (
              <div 
                id={`stage-node-${stage.id}`}
                key={stage.id} 
                onClick={() => setSelectedStageId(stage.id)}
                className={`
                  flex-shrink-0 relative cursor-pointer snap-start transition-all duration-300 w-36
                  bg-white rounded p-3 border hover:shadow hover:border-slate-400
                  ${isSelected ? 'border-black ring-1 ring-black shadow' : 'border-slate-200 opacity-80 hover:opacity-100'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-lg font-display font-bold ${isSelected ? 'text-black' : 'text-slate-300'}`}>
                     {getStageNumber(index)}
                   </span>
                   {progressPercentage === 100 && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
                
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 truncate" title={stage.name}>
                  {stage.name}
                </h4>
                
                <div className="w-full bg-slate-100 h-0.5 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-black transition-all duration-1000" 
                     style={{ width: `${progressPercentage}%` }}
                   ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Stage Command Center - Compact Card */}
      <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500 min-h-[500px]">
        
        {/* Stage Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{selectedStage.name}</h2>
              <p className="text-slate-500 text-xs mt-0.5 max-w-xl leading-relaxed">{selectedStage.description}</p>
           </div>
           
           <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-100">
              {['tasks', 'assets', 'chat', 'history'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-white shadow-sm text-black border border-slate-200' : 'text-slate-400 hover:text-black'}`}
                >
                    {tab === 'history' ? 'Timeline' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              {canViewFinancials && (
                <button 
                  onClick={() => setActiveTab('financials')}
                  className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-all ${activeTab === 'financials' ? 'bg-white shadow-sm text-black border border-slate-200' : 'text-slate-400 hover:text-black'}`}
                >
                  $$$
                </button>
              )}
           </div>
        </div>

        {hasAccess ? (
          <div className="flex-1 bg-white p-0">
             
             {/* CONTENT: TASKS */}
             {activeTab === 'tasks' && (
                 <div className="p-0">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <tr>
                             <th className="p-3 pl-6 w-[40%]">Task Specification</th>
                             <th className="p-3 text-center">Owner</th>
                             <th className="p-3 text-center">Status</th>
                             <th className="p-3 text-center">Due</th>
                             <th className="p-3">Ref</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 text-xs">
                          {selectedStage.tasks.map((task) => (
                             <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-3 pl-6">
                                   <input 
                                      disabled={!canEdit}
                                      value={task.title}
                                      onChange={(e) => handleTaskPropertyChange(task.id, 'title', e.target.value)}
                                      className="w-full bg-transparent font-bold text-slate-900 outline-none placeholder:text-slate-400"
                                   />
                                </td>
                                <td className="p-3 text-center">
                                   <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold mx-auto text-slate-600 uppercase" title={task.assigneeName}>
                                      {task.assigneeName ? task.assigneeName.charAt(0) : <User size={12} />}
                                   </div>
                                </td>
                                <td className="p-3 text-center">
                                   <button 
                                      onClick={() => cycleTaskStatus(task)}
                                      className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border shadow-sm transition-all w-24 ${getStatusColor(task.status)}`}
                                   >
                                      {getStatusLabel(task.status)}
                                   </button>
                                </td>
                                <td className="p-3 text-center">
                                   <span className={`font-mono text-[10px] ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-slate-500'}`}>
                                      {task.dueDate}
                                   </span>
                                </td>
                                <td className="p-3">
                                   <div className="flex gap-2 items-center">
                                      {task.benchmark && <span className="text-[10px] text-slate-400 border border-slate-200 px-1 rounded-sm">Ref</span>}
                                      <button onClick={() => openEditTaskModal(task)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all text-slate-400 hover:text-black">
                                         <Pencil size={12} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                          {canEdit && (
                             <tr className="bg-slate-50/50">
                                <td colSpan={5} className="p-0">
                                   <input 
                                      className="w-full p-3 pl-6 bg-transparent outline-none text-xs placeholder:text-slate-400 placeholder:italic"
                                      placeholder="+ Quick Add Task..."
                                      value={quickAddTitle}
                                      onChange={(e) => setQuickAddTitle(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
                                   />
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
             )}

             {/* CONTENT: ASSETS */}
             {activeTab === 'assets' && (
                 <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-900 uppercase text-xs">Documentation</h4>
                        {canUpload && (
                            <button onClick={handleUploadClick} disabled={isUploading} className="border border-slate-300 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-all flex items-center gap-2">
                                {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {selectedStage.assets.map(asset => (
                            <div key={asset.id} onClick={() => onPreview(asset)} className="bg-white border border-slate-200 p-3 rounded hover:border-black hover:shadow-md transition-all cursor-pointer group relative flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    {getAssetIcon(asset.type)}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity">
                                       <Trash2 size={12} />
                                    </button>
                                </div>
                                <div>
                                   <h5 className="font-bold text-[10px] text-slate-900 truncate" title={asset.title}>{asset.title}</h5>
                                   <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold tracking-wider">{asset.type}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             {/* CONTENT: HISTORY / TIMELINE */}
             {activeTab === 'history' && (
                <div className="p-6 relative">
                    <div className="absolute left-9 top-0 bottom-0 w-px bg-slate-200"></div>
                    
                    <h4 className="font-bold text-black uppercase text-xs mb-6 pl-8 flex items-center gap-2">
                        <History size={14} /> Activity Log
                    </h4>

                    <div className="space-y-4">
                        {(project.history || []).map((item, index) => (
                            <div key={item.id} className="relative pl-8 group">
                                <div className="absolute left-[-5px] top-1.5 w-2 h-2 bg-black rounded-full border-2 border-white ring-1 ring-slate-200"></div>
                                <div className="bg-white border border-slate-200 p-3 hover:border-black transition-colors rounded-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-black uppercase mb-0.5">{item.action}</p>
                                        <p className="text-[9px] text-slate-500">
                                            <span className="font-bold text-slate-700">{item.user}</span> • {item.target || 'General'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] text-slate-400 font-mono">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                        {canEdit && index > 0 && (
                                            <button 
                                                onClick={() => handleRevertHistory(item.id)}
                                                className="text-[9px] font-bold uppercase border border-slate-200 px-2 py-0.5 text-slate-500 hover:bg-black hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                            >
                                                <RotateCcw size={10} /> Revert
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(project.history || []).length === 0 && (
                             <div className="pl-8 text-slate-400 text-[10px] italic">No activity recorded yet.</div>
                        )}
                    </div>
                </div>
             )}

             {(activeTab === 'chat' || activeTab === 'financials') && (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 m-6 rounded-lg bg-slate-50">
                   <p className="text-xs font-medium">Content for {activeTab} loaded in container.</p>
                </div>
             )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
            <Lock size={32} className="mb-2 opacity-50" />
            <p className="text-xs font-bold uppercase tracking-widest">Restricted Access</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
