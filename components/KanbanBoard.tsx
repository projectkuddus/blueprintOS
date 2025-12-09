
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, Stage, Asset, Task, Comment, RolePermissions } from '../types';
import { checkStorageQuota, simulateCloudUpload, determineAssetType } from '../services/storageService';
import { 
  CheckCircle2, Circle, Users, 
  ChevronRight, Image as ImageIcon, FileText, Box, 
  Upload, Plus, MessageSquare, Download, Lock,
  X, Calendar, User, Layout, ArrowRight, Eye, MoreHorizontal, Pencil,
  Link as LinkIcon, AlertCircle, Loader2, HardDrive, Trash2, ExternalLink, ListChecks, Target,
  Paperclip, Send, Square, CheckSquare, Check, Clock, ChevronDown, AlertTriangle
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
  requirements: string; // Text area input, split by newline
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
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [pendingChatFile, setPendingChatFile] = useState<File | null>(null);
  const [isSendingChat, setIsSendingChat] = useState(false);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Asset Menu State
  const [activeAssetMenu, setActiveAssetMenu] = useState<string | null>(null);

  // Phase Editing State
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  // Delete Phase Confirmation State
  // 0: Idle, 1: Warning, 2: Final Confirmation
  const [deleteStep, setDeleteStep] = useState<number>(0);

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
    if (scrollContainerRef.current) {
       const activeElement = document.getElementById(`stage-node-${selectedStageId}`);
       // Logic to center if needed
    }
    // Reset delete confirmation when switching stages
    setDeleteStep(0);
  }, [selectedStageId]);

  // Auto-scroll chat to bottom within the container ONLY
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedStage.discussions, selectedStageId]); // Trigger on stage switch or new message

  // Helper to update project state globally
  const updateProjectStages = (updatedStages: Stage[]) => {
    setStages(updatedStages);
    const updatedProject = { ...project, stages: updatedStages };
    onUpdateProject(updatedProject);
  };

  // Dynamic Permission Checks based on Role Configuration passed from App
  const permissions = rolePermissions[userRole] || { canEdit: false, canUpload: false };
  const canEdit = isCoreAccount || permissions.canEdit;
  const canUpload = isCoreAccount || permissions.canUpload;
  
  // Specific override: Clients are read-only unless core
  const isReadOnly = userRole === Role.CLIENT && !isCoreAccount;

  // Check stage access
  const checkStageAccess = (stage: Stage) => {
    if (isCoreAccount) return true;
    const currentUserName = project.team[userRole]; 
    if (currentUserName && stage.participants?.includes(currentUserName)) return true;
    const hasAssignedTask = stage.tasks.some(t => 
      t.assignedTo === userRole || 
      (t.assigneeName && t.assigneeName === currentUserName)
    );
    if (hasAssignedTask) return true;
    if (userRole === Role.CLIENT) return true;
    if (userRole === Role.ARCHITECT_HEAD || userRole === Role.PROJECT_MANAGER) return true;
    return false;
  };

  const hasAccess = checkStageAccess(selectedStage);

  const teamMembers = Object.entries(project.team).map(([role, name]) => ({
    role: role as Role,
    name
  }));

  const availableRoles = Object.values(Role);
  const availableAssignees = teamMembers.filter(m => m.role === newTask.assignedRole);
  
  // Calculate eligible dependencies (tasks from current or previous stages, grouped)
  const currentStageIndex = stages.findIndex(s => s.id === selectedStageId);
  const groupedDependencies = stages
    .filter((_, index) => index <= currentStageIndex) // Only current and previous stages to prevent forward dependencies
    .reduce((acc, stage) => {
        const stageTasks = stage.tasks.filter(t => t.id !== editingTaskId);
        if (stageTasks.length > 0) {
            acc.push({
                stageName: stage.name,
                tasks: stageTasks
            });
        }
        return acc;
    }, [] as { stageName: string, tasks: Task[] }[]);

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'cad': return <Box className="text-black" size={24} />;
      case '3d': return <Box className="text-black" size={24} />;
      case 'image': return <ImageIcon className="text-slate-600" size={24} />;
      case 'pdf': return <FileText className="text-slate-600" size={24} />;
      default: return <FileText className="text-slate-400" size={24} />;
    }
  };

  const isTaskBlocked = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    const allTasks = stages.flatMap(s => s.tasks);
    return task.dependencies.some(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'completed';
    });
  };

  const getBlockingTaskNames = (task: Task) => {
    if (!task.dependencies) return [];
    const allTasks = stages.flatMap(s => s.tasks);
    return allTasks
      .filter(t => task.dependencies?.includes(t.id) && t.status !== 'completed')
      .map(t => t.title);
  };

  const isOverdue = (dateString: string) => {
    const due = new Date(dateString);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return due < today;
  };

  const isDueSoon = (dateString: string) => {
    const due = new Date(dateString);
    if (isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const threeDays = new Date(today);
    threeDays.setDate(today.getDate() + 3);
    return due >= today && due <= threeDays;
  };

  const handleSaveTask = () => {
    if (!newTask.title) return;

    const requirementsList = newTask.requirements.split('\n').filter(r => r.trim() !== '');

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStageId) {
        if (editingTaskId) {
          return {
            ...stage,
            tasks: stage.tasks.map(t => t.id === editingTaskId ? {
              ...t,
              title: newTask.title,
              description: newTask.description,
              benchmark: newTask.benchmark,
              requirements: requirementsList,
              assignedTo: newTask.assignedRole,
              assigneeName: newTask.assigneeName || undefined,
              dueDate: newTask.dueDate || 'ASAP',
              dependencies: newTask.dependencies
            } : t)
          };
        }
        
        const task: Task = {
          id: `t-new-${Date.now()}`,
          title: newTask.title,
          description: newTask.description,
          benchmark: newTask.benchmark,
          requirements: requirementsList,
          assignedTo: newTask.assignedRole,
          assigneeName: newTask.assigneeName || undefined,
          status: 'pending',
          dueDate: newTask.dueDate || 'ASAP',
          dependencies: newTask.dependencies
        };
        return { ...stage, tasks: [...stage.tasks, task] };
      }
      return stage;
    });

    updateProjectStages(updatedStages);
    closeModal();
  };

  const openNewTaskModal = () => {
    setEditingTaskId(null);
    setNewTask({ title: '', description: '', benchmark: '', requirements: '', assignedRole: Role.ARCHITECT_HEAD, assigneeName: '', dueDate: '', dependencies: [] });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description || '',
      benchmark: task.benchmark || '',
      requirements: (task.requirements || []).join('\n'),
      assignedRole: task.assignedTo,
      assigneeName: task.assigneeName || '',
      dueDate: task.dueDate,
      dependencies: task.dependencies || []
    });
    setIsTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsTaskModalOpen(false);
    setEditingTaskId(null);
    setNewTask({ title: '', description: '', benchmark: '', requirements: '', assignedRole: Role.ARCHITECT_HEAD, assigneeName: '', dueDate: '', dependencies: [] });
  };

  const toggleTaskStatus = (task: Task) => {
    if (!canEdit) return;
    if (isTaskBlocked(task)) return;

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStageId) {
        const updatedTasks = stage.tasks.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                status: t.status === 'completed' ? 'pending' : 'completed',
                completedAt: t.status === 'completed' ? undefined : Date.now()
              } as Task
            : t
        );

        const allTasksCompleted = updatedTasks.every(t => t.status === 'completed');
        const newStageStatus: 'pending' | 'active' | 'completed' = allTasksCompleted ? 'completed' : 'active';
        
        return { 
           ...stage, 
           tasks: updatedTasks,
           status: newStageStatus 
        };
      }
      return stage;
    });
    updateProjectStages(updatedStages);
  };

  const handleUpdateStageMeta = (key: 'status' | 'startDate', value: string) => {
    if (!canEdit) return;
    
    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStageId) {
         if (key === 'status') {
             const newStatus = value as 'pending' | 'active' | 'completed';
             return { ...stage, status: newStatus };
         }
         if (key === 'startDate') {
             return { ...stage, startDate: value };
         }
      }
      return stage;
    });
    updateProjectStages(updatedStages);
  };

  const handleAddStage = () => {
    if (!isCoreAccount) return;
    const newId = `stage-new-${Date.now()}`;
    const newStage: Stage = {
      id: newId,
      name: 'New Phase',
      status: 'pending',
      description: 'Newly added project phase.',
      tasks: [],
      assets: [],
      discussions: [],
      startDate: new Date().toISOString().split('T')[0]
    };
    
    const updatedStages = [...stages, newStage];
    updateProjectStages(updatedStages);

    setTimeout(() => {
       const element = document.getElementById(`stage-node-${newId}`);
       element?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }, 100);
  };

  // Improved Delete Logic with Multi-Step Confirmation
  const handleStageDeleteClick = () => {
    if (!isCoreAccount) return;
    
    if (deleteStep === 0) {
      setDeleteStep(1); // Show First Warning
    } else if (deleteStep === 1) {
      setDeleteStep(2); // Show Final Confirmation
    } else if (deleteStep === 2) {
      // Execute Delete
      const updatedStages = stages.filter(s => s.id !== selectedStageId);
      updateProjectStages(updatedStages);
      
      if (updatedStages.length > 0) {
        setSelectedStageId(updatedStages[0].id);
      }
      setDeleteStep(0); // Reset
    }
  };

  // --- Enhanced Chat Handler ---
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingChatFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !pendingChatFile) return;

    setIsSendingChat(true);
    const userName = project.team[userRole] || 'Unknown User';
    let attachments: Asset[] = [];

    if (pendingChatFile) {
       try {
          const url = await simulateCloudUpload(pendingChatFile);
          const newAsset: Asset = {
             id: `att-${Date.now()}`,
             title: pendingChatFile.name,
             type: determineAssetType(pendingChatFile.name),
             url: url,
             uploadedBy: userName,
             uploadDate: new Date().toISOString(),
             size: pendingChatFile.size
          };
          attachments.push(newAsset);
       } catch (e) {
         console.error("Failed to upload chat attachment");
       }
    }
    
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: userName,
      role: userRole,
      text: chatInput,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStageId) {
        return {
          ...stage,
          discussions: [...stage.discussions, newComment]
        };
      }
      return stage;
    });

    updateProjectStages(updatedStages);
    setChatInput('');
    setPendingChatFile(null);
    setIsSendingChat(false);
    if (chatFileRef.current) chatFileRef.current.value = '';
  };

  const formatChatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // --- Upload Handler (Using Storage Service) ---
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasSpace = checkStorageQuota([project], file.size);
    if (!hasSpace) {
      setUploadError("Storage Limit Reached. Contact Administrator to upgrade allocation.");
      setTimeout(() => setUploadError(null), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const userName = project.team[userRole] || 'Unknown User';
    const type = determineAssetType(file.name);

    try {
      const cloudUrl = await simulateCloudUpload(file);
      const newAsset: Asset = {
        id: `a-${Date.now()}`,
        title: file.name,
        type,
        url: cloudUrl,
        uploadedBy: userName,
        uploadDate: new Date().toISOString().split('T')[0],
        size: file.size
      };

      const updatedStages = stages.map(stage => {
        if (stage.id === selectedStageId) {
          return {
            ...stage,
            assets: [...stage.assets, newAsset]
          };
        }
        return stage;
      });
      updateProjectStages(updatedStages);

    } catch (err) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (!canEdit) return;
    if (window.confirm("Delete this file permanently?")) {
        const updatedStages = stages.map(stage => {
            if (stage.id === selectedStageId) {
                return {
                    ...stage,
                    assets: stage.assets.filter(a => a.id !== assetId)
                };
            }
            return stage;
        });
        updateProjectStages(updatedStages);
    }
  };

  const getStageNumber = (index: number) => {
    return (index + 1).toString().padStart(2, '0');
  }

  const pendingTasks = selectedStage.tasks.filter(t => t.status !== 'completed');
  const completedTasks = selectedStage.tasks.filter(t => t.status === 'completed');
  const totalPhaseTasks = selectedStage.tasks.length;
  const completedPhaseTasks = completedTasks.length;
  const phaseProgress = totalPhaseTasks === 0 ? 0 : Math.round((completedPhaseTasks / totalPhaseTasks) * 100);

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex items-end justify-between border-b-2 border-black pb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <Layout size={24} className="text-black" />
             <h3 className="text-2xl font-bold text-black uppercase tracking-tight">Project Workflow</h3>
           </div>
           <p className="text-sm font-medium text-slate-500 max-w-2xl">
             Navigate through the project lifecycle. Each phase contains specific deliverables, drawings, and approval gates.
           </p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="text-right">
             <p className="text-xs uppercase font-bold text-slate-400">Total Phases</p>
             <p className="text-xl font-bold text-black">{stages.length}</p>
          </div>
          <div className="text-right">
             <p className="text-xs uppercase font-bold text-slate-400">Completed</p>
             <p className="text-xl font-bold text-emerald-600">
               {stages.filter(s => s.status === 'completed').length}
             </p>
          </div>
        </div>
      </div>

      {/* Phase Objectives / To-Do List */}
      <div className="bg-white border border-slate-200 p-6 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <ListChecks size={100} />
         </div>

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
             <div>
                <h4 className="font-bold text-black uppercase flex items-center gap-2 text-sm">
                   <ListChecks size={16} /> Phase Objectives: <span className="text-emerald-600">{selectedStage.name}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                   {completedPhaseTasks} of {totalPhaseTasks} tasks completed
                </p>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="w-full md:w-32 h-2 bg-zinc-100 border border-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${phaseProgress}%`}}></div>
                 </div>
                 
                 {canEdit && (
                    <button 
                      onClick={openNewTaskModal}
                      className="flex-shrink-0 bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                    >
                       <Plus size={12} /> New Task
                    </button>
                 )}
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
             {selectedStage.tasks.map(task => {
                const blocked = isTaskBlocked(task);
                const isCompleted = task.status === 'completed';
                const overdue = isOverdue(task.dueDate) && !isCompleted;
                const soon = isDueSoon(task.dueDate) && !isCompleted;

                return (
                  <div 
                    key={task.id}
                    className={`
                      flex items-start gap-3 p-3 border transition-colors relative
                      ${isCompleted ? 'bg-zinc-50 border-slate-200 opacity-70' : 'bg-white border-slate-200 hover:border-black'}
                      ${blocked ? 'border-amber-200 bg-amber-50/50' : ''}
                      ${overdue ? 'border-red-200 bg-red-50/30' : ''}
                    `}
                  >
                     <button 
                        disabled={!canEdit || blocked}
                        onClick={() => toggleTaskStatus(task)}
                        className={`mt-0.5 flex-shrink-0 ${blocked ? 'cursor-not-allowed text-amber-300' : 'cursor-pointer hover:text-emerald-500'} ${isCompleted ? 'text-emerald-500' : 'text-slate-300'} `}
                     >
                        {isCompleted ? <CheckSquare size={16} /> : blocked ? <Lock size={16} /> : <Square size={16} />}
                     </button>
                     
                     <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold uppercase truncate ${isCompleted ? 'text-slate-400 line-through decoration-emerald-500' : 'text-black'}`}>
                           {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[9px] text-slate-500 font-medium bg-zinc-100 px-1.5 rounded-sm">
                              {task.assigneeName || task.assignedTo}
                           </span>
                           {blocked && <span className="text-[9px] text-amber-600 font-bold uppercase">Blocked</span>}
                           {overdue && <span className="text-[9px] text-red-600 font-bold uppercase flex items-center gap-1"><AlertCircle size={8} /> Late</span>}
                        </div>
                     </div>
                  </div>
                );
             })}
             
             {selectedStage.tasks.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-400 italic border border-dashed border-slate-200">
                   No objectives set for this phase yet.
                </div>
             )}
         </div>
      </div>

      {/* 2. Enhanced Timeline */}
      <div className="relative group/timeline">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-12 pt-4 gap-0 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {stages.map((stage, index) => {
            const isCurrent = stage.id === project.currentStageId;
            const isSelected = stage.id === selectedStageId;
            const isAccessible = checkStageAccess(stage);

            const totalStageTasks = stage.tasks.length;
            const completedStageTasks = stage.tasks.filter(t => t.status === 'completed').length;
            
            const progressPercentage = totalStageTasks > 0 
                ? (completedStageTasks / totalStageTasks) * 100 
                : (stage.status === 'completed' ? 100 : 0);
            
            const isFullyComplete = progressPercentage === 100;
            const radius = 20; 
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (progressPercentage / 100) * circumference;
            
            return (
              <div 
                id={`stage-node-${stage.id}`}
                key={stage.id} 
                onClick={() => setSelectedStageId(stage.id)}
                className={`flex-shrink-0 relative cursor-pointer snap-start px-8 first:pl-0 last:pr-0 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                {index !== stages.length - 1 && (
                   <div className={`absolute top-6 left-1/2 w-full h-[3px] -z-10 ${isFullyComplete ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}

                <div className="flex flex-col items-center gap-4">
                   <div className={`
                      w-12 h-12 flex items-center justify-center font-bold text-sm rounded-full bg-white transition-all duration-300 relative
                      ${isSelected ? 'ring-4 ring-black/10' : ''} 
                      ${isCurrent ? 'scale-110 shadow-xl' : ''}
                   `}>
                       <svg className="absolute inset-0 w-full h-full -rotate-90">
                           <circle 
                               r={radius} 
                               cx="50%" 
                               cy="50%" 
                               fill={isFullyComplete ? '#10b981' : 'white'} 
                               stroke={isFullyComplete ? '#10b981' : '#e2e8f0'} 
                               strokeWidth="4"
                               className="transition-colors duration-500"
                           />
                           {!isFullyComplete && (
                               <circle 
                                   r={radius} 
                                   cx="50%" 
                                   cy="50%" 
                                   fill="transparent"
                                   stroke="#10b981"
                                   strokeWidth="4"
                                   strokeDasharray={circumference}
                                   strokeDashoffset={offset}
                                   strokeLinecap="round"
                                   className="transition-all duration-700 ease-out"
                               />
                           )}
                       </svg>

                       <div className="relative z-10 flex items-center justify-center">
                            {isFullyComplete ? (
                                <Check size={20} className="text-white" />
                            ) : (
                                <span className={`${isCurrent ? 'text-black font-black' : 'text-slate-400'}`}>
                                    {getStageNumber(index)}
                                </span>
                            )}
                       </div>
                      
                      {!isAccessible && (
                        <div className="absolute -top-1 -right-1 bg-slate-900 text-white p-1 rounded-full shadow-md z-20">
                          <Lock size={10} />
                        </div>
                      )}
                   </div>

                   <div className="text-center w-32">
                     <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCurrent ? 'text-black' : 'text-slate-400'}`}>
                       Phase {getStageNumber(index)}
                       {isCurrent && <span className="ml-1 text-emerald-600">(Current)</span>}
                     </p>
                     <p className={`text-sm font-bold leading-tight uppercase ${isCurrent || isSelected ? 'text-black' : 'text-slate-500'}`}>
                       {stage.name}
                     </p>
                   </div>
                </div>
              </div>
            );
          })}

          {isCoreAccount && (
            <div className="flex-shrink-0 px-8 flex flex-col items-center justify-start pt-6">
               <button 
                 onClick={handleAddStage}
                 className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-black hover:text-black hover:bg-zinc-50 transition-all"
               >
                 <Plus size={24} />
               </button>
               <span className="text-[10px] font-bold uppercase text-slate-400 mt-4">Add Phase</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Stage Command Center */}
      <div className="bg-white border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[500px]">
        
        {/* Stage Header */}
        <div className="p-6 border-b border-slate-100 bg-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <div className="flex items-center gap-3">
                 <span className="text-4xl font-black text-black opacity-10">{getStageNumber(stages.findIndex(s => s.id === selectedStage.id))}</span>
                 <h2 className="text-2xl font-bold text-black uppercase tracking-tight">{selectedStage.name}</h2>
              </div>
              <p className="text-slate-500 text-sm mt-1 max-w-xl">{selectedStage.description}</p>
           </div>
           
           <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                  
                  {/* Status Button */}
                  <button 
                    disabled={!canEdit}
                    onClick={() => {
                        const nextStatus = selectedStage.status === 'pending' ? 'active' : selectedStage.status === 'active' ? 'completed' : 'pending';
                        handleUpdateStageMeta('status', nextStatus);
                    }}
                    className="h-10 px-4 bg-white border border-slate-200 border-b-2 border-b-slate-300 text-xs font-bold uppercase hover:bg-zinc-50 active:border-b active:translate-y-[1px] transition-all flex items-center gap-2 min-w-[120px] justify-between"
                  >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedStage.status === 'active' ? 'bg-black animate-pulse' : selectedStage.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-slate-500">Status:</span> 
                        <span className={selectedStage.status === 'active' ? 'text-black' : selectedStage.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}>{selectedStage.status}</span>
                      </div>
                      {canEdit && <ChevronDown size={12} className="text-slate-400" />}
                  </button>

                  {/* Date Button */}
                  <div className="relative">
                     {isEditingDate ? (
                        <div className="h-10 px-2 bg-white border border-slate-200 border-b-2 border-b-slate-300 flex items-center">
                           <input 
                              type="date"
                              autoFocus
                              onBlur={() => setIsEditingDate(false)}
                              value={selectedStage.startDate || ''}
                              onChange={(e) => handleUpdateStageMeta('startDate', e.target.value)}
                              className="text-xs font-bold text-black bg-transparent outline-none uppercase"
                           />
                        </div>
                     ) : (
                        <button 
                           onClick={() => canEdit && setIsEditingDate(true)}
                           disabled={!canEdit}
                           className="h-10 px-4 bg-white border border-slate-200 border-b-2 border-b-slate-300 text-xs font-bold uppercase hover:bg-zinc-50 active:border-b active:translate-y-[1px] transition-all flex items-center gap-2 min-w-[140px]"
                        >
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-slate-500">Start:</span>
                            <span className="text-black">{selectedStage.startDate || 'Set Date'}</span>
                        </button>
                     )}
                  </div>

                  {/* Close Phase / Delete Button (Multi-step) */}
                  {isCoreAccount && (
                    <div className="flex items-center gap-2">
                        {deleteStep > 0 && (
                            <button
                                onClick={() => setDeleteStep(0)}
                                className="h-10 px-3 bg-white border border-slate-200 border-b-2 border-b-slate-300 text-[10px] font-bold uppercase hover:bg-zinc-50 text-slate-500 hover:text-black transition-all active:border-b active:translate-y-[1px]"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                          onClick={handleStageDeleteClick}
                          className={`
                            h-10 flex items-center justify-center border border-b-2 transition-all active:border-b active:translate-y-[1px]
                            ${deleteStep === 0 ? 'w-10 bg-white border-slate-200 border-b-slate-300 text-red-400 hover:text-red-600 hover:bg-red-50' : ''}
                            ${deleteStep === 1 ? 'bg-amber-100 border-amber-300 border-b-amber-400 text-amber-700 px-4' : ''}
                            ${deleteStep === 2 ? 'bg-red-600 border-red-700 border-b-red-800 text-white px-4' : ''}
                          `}
                          title="Close/Delete Phase"
                        >
                           {deleteStep === 0 && <X size={16} />}
                           {deleteStep === 1 && <span className="text-[10px] font-bold uppercase flex items-center gap-1"><AlertTriangle size={12}/> Delete?</span>}
                           {deleteStep === 2 && <span className="text-[10px] font-bold uppercase flex items-center gap-1"><Trash2 size={12}/> Confirm!</span>}
                        </button>
                    </div>
                  )}
              </div>
           </div>
        </div>

        {hasAccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
             
             {/* Left: Tasks (4 cols) */}
             <div className="lg:col-span-4 border-r border-slate-200 p-6 bg-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-bold text-black uppercase flex items-center gap-2">
                     <CheckCircle2 size={16} /> Specifications & Tasks
                   </h4>
                   {canEdit && (
                     <button onClick={openNewTaskModal} className="p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black rounded-sm">
                       <Plus size={16} />
                     </button>
                   )}
                </div>
                
                <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                  {/* Pending Tasks */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-wider">Active Requirements</h5>
                    <div className="space-y-4">
                      {pendingTasks.map(task => {
                        const blocked = isTaskBlocked(task);
                        const blockingNames = getBlockingTaskNames(task);
                        const overdue = isOverdue(task.dueDate);
                        const soon = isDueSoon(task.dueDate);
                        
                        return (
                          <div key={task.id} className={`group relative border-2 transition-all p-4 ${blocked ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 hover:border-black'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <h5 className="text-sm font-bold text-black uppercase">{task.title}</h5>
                                <div className="flex items-center gap-1">
                                    {canEdit && (
                                        <button 
                                            onClick={() => openEditTaskModal(task)}
                                            className="text-slate-300 hover:text-black transition-colors p-1"
                                            title="Edit Task"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                    )}
                                    <button 
                                        disabled={!canEdit || blocked}
                                        onClick={() => toggleTaskStatus(task)}
                                        className={`transition-colors ${blocked ? 'text-amber-300 cursor-not-allowed' : 'text-slate-300 hover:text-emerald-500'}`}
                                        title={blocked ? "Complete prerequisites first" : "Mark as complete"}
                                    >
                                        {blocked ? <Lock size={18} /> : <Circle size={18} />}
                                    </button>
                                </div>
                            </div>

                            {task.description && (
                                <p className="text-xs text-slate-600 mb-3 leading-relaxed border-b border-slate-100 pb-2">
                                    {task.description}
                                </p>
                            )}
                            
                            {task.requirements && task.requirements.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><ListChecks size={10} /> Requirements</p>
                                    <ul className="list-disc pl-3 text-[10px] text-slate-500 space-y-0.5">
                                        {task.requirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {task.benchmark && (
                                <div className="mb-3 bg-zinc-50 p-2 border border-slate-100">
                                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><Target size={10} /> Benchmark</p>
                                    <p className="text-[10px] text-emerald-700 font-medium italic">"{task.benchmark}"</p>
                                </div>
                            )}

                            {blocked && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-sm">
                                  <div className="text-[10px] text-amber-700 flex items-center gap-1 font-bold uppercase tracking-tight mb-1">
                                      <AlertCircle size={10} /> 
                                      Blocked By
                                  </div>
                                  <ul className="list-disc pl-3 text-[9px] text-amber-600">
                                      {blockingNames.map(name => <li key={name}>{name}</li>)}
                                  </ul>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                {task.assigneeName ? (
                                <span className="flex items-center gap-1 text-[9px] bg-black text-white px-2 py-0.5 font-bold uppercase rounded-sm">
                                    <User size={8} /> {task.assigneeName}
                                </span>
                                ) : (
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 font-bold uppercase rounded-sm">
                                    {task.assignedTo}
                                </span>
                                )}
                                <span className={`flex items-center gap-1 text-[9px] font-medium ml-auto ${overdue ? 'text-red-500' : soon ? 'text-amber-500' : 'text-slate-400'}`} title={overdue ? "Overdue" : soon ? "Due soon" : "Deadline"}>
                                  <Calendar size={8} /> {task.dueDate}
                                </span>
                            </div>
                          </div>
                        );
                      })}
                      {pendingTasks.length === 0 && (
                         <div className="text-center py-8 text-slate-400 text-xs italic border-2 border-dashed border-slate-100 bg-zinc-50">
                            <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50 text-emerald-500" />
                            All deliverables completed.
                         </div>
                      )}
                    </div>
                  </div>

                  {completedTasks.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h5 className="text-[10px] font-bold uppercase text-emerald-600 mb-3 tracking-wider flex items-center gap-2">
                         Completed History
                      </h5>
                      <div className="space-y-2 opacity-75">
                         {completedTasks.map(task => (
                           <div key={task.id} className="border border-emerald-100 bg-emerald-50/50 p-3 flex items-start justify-between">
                               <div>
                                 <p className="text-xs font-bold text-slate-600 line-through decoration-emerald-400 uppercase">
                                   {task.title}
                                 </p>
                                 <p className="text-[10px] text-slate-400 mt-1">
                                    Finished on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown'}
                                 </p>
                               </div>
                               <button 
                                   disabled={!canEdit}
                                   onClick={() => toggleTaskStatus(task)}
                                   className="text-emerald-500 hover:text-slate-400 transition-colors"
                                   title="Undo completion"
                               >
                                   <CheckCircle2 size={16} />
                               </button>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>

             {/* Middle: Assets (5 cols) */}
             <div className="lg:col-span-5 border-r border-slate-200 p-6 bg-zinc-50/50">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-bold text-black uppercase flex items-center gap-2">
                     <Box size={16} /> Assets & Drawings
                   </h4>
                   {canUpload && (
                     <button 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="text-xs bg-black text-white px-3 py-1.5 font-bold uppercase hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50"
                     >
                       {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                       {isUploading ? 'Uploading...' : 'Upload'}
                     </button>
                   )}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange} 
                   />
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 p-3 mb-4 flex items-center gap-2 text-xs text-red-600 animate-in fade-in slide-in-from-top-2">
                     <HardDrive size={14} /> {uploadError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   {selectedStage.assets.map(asset => (
                      <div 
                         key={asset.id} 
                         onClick={() => onPreview(asset)}
                         className="bg-white border border-slate-200 p-4 hover:border-black hover:shadow-md transition-all group cursor-pointer relative flex flex-col"
                      >
                         <div className="flex justify-between items-start mb-4">
                            {getAssetIcon(asset.type)}
                            
                            <div className="relative">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setActiveAssetMenu(activeAssetMenu === asset.id ? null : asset.id); }}
                                 className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 rounded"
                               >
                                  <MoreHorizontal size={16} className="text-slate-400 hover:text-black" />
                               </button>
                               
                               {activeAssetMenu === asset.id && (
                                 <div className="absolute right-0 top-6 w-32 bg-white border border-black shadow-xl z-20 flex flex-col py-1">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onPreview(asset); setActiveAssetMenu(null); }}
                                      className="text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-zinc-100 flex items-center gap-2"
                                    >
                                       <Eye size={12} /> Preview
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); window.open(asset.url, '_blank'); setActiveAssetMenu(null); }}
                                      className="text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-zinc-100 flex items-center gap-2"
                                    >
                                       <Download size={12} /> Download
                                    </button>
                                    {canEdit && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); setActiveAssetMenu(null); }}
                                        className="text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-red-50 text-red-500 flex items-center gap-2 border-t border-slate-100"
                                      >
                                         <Trash2 size={12} /> Delete
                                      </button>
                                    )}
                                 </div>
                               )}
                               {activeAssetMenu === asset.id && (
                                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveAssetMenu(null); }}></div>
                               )}
                            </div>
                         </div>
                         <h5 className="font-bold text-sm text-black uppercase truncate mb-1" title={asset.title}>{asset.title}</h5>
                         <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            {asset.type} • {asset.uploadedBy}
                         </p>
                         <p className="text-[9px] text-slate-400 mt-1">{asset.size ? `${(asset.size / (1024*1024)).toFixed(1)} MB` : 'Unknown Size'}</p>
                      </div>
                   ))}
                   
                   {selectedStage.assets.length === 0 && (
                      <div className="col-span-2 py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                         <Upload size={24} className="mb-2 opacity-50" />
                         <p className="text-xs font-medium uppercase">Drag & Drop files here</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Right: Enhanced Chat (3 cols) */}
             <div className="lg:col-span-3 p-0 flex flex-col bg-white h-full border-l border-slate-200">
                <div className="p-4 border-b border-slate-100 bg-white">
                   <h4 className="font-bold text-black uppercase flex items-center gap-2 text-sm">
                     <MessageSquare size={16} /> Phase Discussion
                   </h4>
                   <p className="text-[10px] text-slate-400 mt-1">Recorded history for {selectedStage.name}</p>
                </div>
                
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-0 bg-zinc-50/50 max-h-[400px]"
                >
                   {selectedStage.discussions.length > 0 ? (
                      selectedStage.discussions.map((comment, index) => {
                        const isMe = comment.role === userRole;
                        const prevComment = selectedStage.discussions[index - 1];
                        const showDate = !prevComment || new Date(comment.timestamp).toDateString() !== new Date(prevComment.timestamp).toDateString();

                        return (
                          <React.Fragment key={comment.id}>
                            {showDate && (
                                <div className="flex items-center gap-2 py-4 opacity-50">
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                        {formatChatDate(comment.timestamp)}
                                    </span>
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                </div>
                            )}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
                                <div className={`flex items-end gap-2 max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border shadow-sm
                                    ${isMe ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-200'}
                                    `}>
                                        {comment.author[0]}
                                    </div>
                                    
                                    <div className={`
                                    p-3 rounded-lg border text-xs shadow-sm
                                    ${isMe 
                                        ? 'bg-black text-white border-black rounded-tr-none' 
                                        : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'}
                                    `}>
                                    <div className={`text-[8px] font-bold uppercase mb-1 ${isMe ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        {comment.role} • {comment.author.split(' ')[0]}
                                    </div>
                                    
                                    {comment.attachments && comment.attachments.length > 0 && (
                                        <div className="mb-2 space-y-2">
                                            {comment.attachments.map((att, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => onPreview(att)}
                                                className={`
                                                flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border
                                                ${isMe 
                                                    ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' 
                                                    : 'bg-zinc-50 border-slate-200 hover:bg-zinc-100'}
                                                `}
                                            >
                                                {att.type === 'image' ? (
                                                    <div className="w-8 h-8 rounded bg-cover bg-center" style={{backgroundImage: `url(${att.url})`}}></div>
                                                ) : (
                                                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-200 text-slate-500 rounded">
                                                    <Paperclip size={14} />
                                                    </div>
                                                )}
                                                <div className="overflow-hidden">
                                                    <p className="truncate w-24 font-bold">{att.title}</p>
                                                    <p className="text-[9px] opacity-70 uppercase">{att.type}</p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                    )}

                                    {comment.text && <p className="leading-relaxed whitespace-pre-wrap">{comment.text}</p>}
                                    </div>
                                </div>
                                
                                <span className="text-[9px] text-slate-400 mt-1 px-1">
                                {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                          </React.Fragment>
                        );
                      })
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <MessageSquare size={32} className="mb-2 opacity-20" />
                         <p className="text-xs italic">Start the conversation...</p>
                         <p className="text-[10px] uppercase mt-2 font-bold opacity-50">No history recorded</p>
                      </div>
                   )}
                </div>

                <div className="p-3 border-t border-slate-200 bg-white">
                   {pendingChatFile && (
                      <div className="mb-2 p-2 bg-zinc-50 border border-slate-200 rounded flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-2">
                            <Paperclip size={12} className="text-emerald-500" />
                            <span className="font-bold truncate max-w-[150px]">{pendingChatFile.name}</span>
                            <span className="text-slate-400">({(pendingChatFile.size/1024).toFixed(0)}KB)</span>
                         </div>
                         <button onClick={() => setPendingChatFile(null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                      </div>
                   )}
                   
                   <div className="flex gap-2">
                      <input 
                        type="file"
                        ref={chatFileRef}
                        className="hidden"
                        onChange={handleChatFileSelect}
                      />
                      <button 
                         onClick={() => chatFileRef.current?.click()}
                         className="p-2 text-slate-400 hover:text-black hover:bg-zinc-100 rounded transition-colors"
                         title="Attach File"
                         disabled={isSendingChat}
                      >
                         <Paperclip size={18} />
                      </button>
                      
                      <div className="flex-1 relative">
                        <input 
                          disabled={isReadOnly || isSendingChat}
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={isSendingChat ? "Sending..." : "Type message..."}
                          className="w-full bg-zinc-50 border border-slate-200 pl-3 pr-10 py-2 text-xs focus:border-black outline-none rounded-sm transition-all"
                        />
                      </div>
                      
                      <button 
                        disabled={isReadOnly || (!chatInput.trim() && !pendingChatFile) || isSendingChat} 
                        onClick={handleSendMessage}
                        className="bg-black text-white p-2 hover:bg-zinc-800 disabled:opacity-50 rounded-sm transition-colors shadow-sm"
                      >
                         {isSendingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center bg-zinc-50 text-slate-400">
            <Lock size={64} className="mb-6 opacity-20" />
            <h3 className="text-xl font-bold uppercase text-black mb-2">Access Restricted</h3>
            <p className="text-sm max-w-md text-center">
              You do not have permission to view the details of this phase. 
              Contact your Project Account Manager or Administrator to request access.
            </p>
          </div>
        )}
      </div>

       {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full animate-in fade-in zoom-in duration-200 shadow-2xl p-6 border-2 border-black max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-black uppercase flex items-center gap-2">
                {editingTaskId ? <Pencil size={16} className="text-emerald-500" /> : <Plus size={16} className="text-emerald-500" />}
                {editingTaskId ? 'Edit Specification' : 'New Specification'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-black transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Task Title</label>
                 <input 
                   autoFocus
                   className="w-full border border-slate-300 p-2.5 text-sm font-bold focus:border-black outline-none bg-zinc-50 focus:bg-white transition-colors" 
                   placeholder="e.g. Structural Integrity Check"
                   value={newTask.title}
                   onChange={e => setNewTask({...newTask, title: e.target.value})}
                 />
               </div>

               <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Description</label>
                 <textarea 
                   className="w-full border border-slate-300 p-2.5 text-sm focus:border-black outline-none h-20 resize-none" 
                   placeholder="Detailed explanation of the task..."
                   value={newTask.description}
                   onChange={e => setNewTask({...newTask, description: e.target.value})}
                 />
               </div>

               <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                    <Target size={10} /> Success Benchmark / Goal
                 </label>
                 <input 
                   className="w-full border border-slate-300 p-2.5 text-sm focus:border-black outline-none" 
                   placeholder="e.g. Zero safety incidents, Signed approval from Client"
                   value={newTask.benchmark}
                   onChange={e => setNewTask({...newTask, benchmark: e.target.value})}
                 />
               </div>

               <div>
                 <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                    <ListChecks size={10} /> Requirements (One per line)
                 </label>
                 <textarea 
                   className="w-full border border-slate-300 p-2.5 text-sm focus:border-black outline-none h-24 bg-zinc-50 font-mono" 
                   placeholder="- Requirement 1&#10;- Requirement 2&#10;- Requirement 3"
                   value={newTask.requirements}
                   onChange={e => setNewTask({...newTask, requirements: e.target.value})}
                 />
               </div>

               <div className="h-px bg-slate-200 my-2"></div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Assigned Role</label>
                      <select 
                          className="w-full border border-slate-300 p-2.5 text-xs font-bold uppercase bg-white focus:border-black outline-none"
                          value={newTask.assignedRole}
                          onChange={e => setNewTask({...newTask, assignedRole: e.target.value as Role, assigneeName: ''})}
                      >
                          {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                  </div>
                  <div>
                       <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Assignee (Optional)</label>
                       <select 
                          className="w-full border border-slate-300 p-2.5 text-xs font-bold uppercase bg-white focus:border-black outline-none"
                          value={newTask.assigneeName}
                          onChange={e => setNewTask({...newTask, assigneeName: e.target.value})}
                       >
                          <option value="">Any {newTask.assignedRole}</option>
                          {availableAssignees.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                       </select>
                  </div>
               </div>
               
               <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Deadline</label>
                  <input 
                     type="date"
                     className="w-full border border-slate-300 p-2.5 text-sm bg-white focus:border-black outline-none uppercase"
                     value={newTask.dueDate}
                     onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
               </div>

               <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block flex items-center gap-2">
                    <LinkIcon size={12} /> Prerequisites (Dependencies)
                  </label>
                  <div className="border border-slate-300 bg-zinc-50 p-2 max-h-48 overflow-y-auto space-y-3">
                      {groupedDependencies.length > 0 ? groupedDependencies.map(group => (
                          <div key={group.stageName}>
                              <div className="text-[9px] font-bold uppercase text-slate-400 mb-1 sticky top-0 bg-zinc-50 py-1">
                                  {group.stageName}
                              </div>
                              <div className="space-y-1 pl-2 border-l border-slate-200">
                                  {group.tasks.map(t => (
                                      <label key={t.id} className="flex items-start gap-2 text-xs py-1 cursor-pointer hover:text-black text-slate-600">
                                          <input 
                                              type="checkbox"
                                              checked={newTask.dependencies.includes(t.id)}
                                              onChange={(e) => {
                                                  if (e.target.checked) {
                                                      setNewTask(prev => ({...prev, dependencies: [...prev.dependencies, t.id]}))
                                                  } else {
                                                      setNewTask(prev => ({...prev, dependencies: prev.dependencies.filter(id => id !== t.id)}))
                                                  }
                                              }}
                                              className="mt-0.5 rounded border-slate-300 accent-black w-3 h-3 flex-shrink-0"
                                          />
                                          <span className="truncate">{t.title}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      )) : <p className="text-xs text-slate-400 italic p-2">No tasks available to link.</p>}
                  </div>
               </div>

               <button 
                  onClick={handleSaveTask}
                  className="w-full bg-black text-white py-3 text-sm font-bold uppercase hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-none translate-y-0 hover:translate-y-0.5"
               >
                  {editingTaskId ? <Pencil size={16} /> : <Plus size={16} />}
                  {editingTaskId ? 'Update Specification' : 'Add Specification'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
