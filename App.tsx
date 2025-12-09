
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Role, 
  Project, 
  ProjectType, 
  ProjectClassification, 
  TeamMember, 
  RolePermissions, 
  AppNotification, 
  Asset 
} from './types';
import { 
  MOCK_PROJECTS, 
  MOCK_TEAM_MEMBERS, 
  ROLE_PERMISSIONS, 
  generateStandardStages 
} from './constants';
import { 
  checkStorageQuota, 
  simulateCloudUpload, 
  determineAssetType 
} from './services/storageService';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import ProjectCard from './components/ProjectCard';
import KanbanBoard from './components/KanbanBoard';
import ProjectHierarchy from './components/ProjectHierarchy';
import ProjectFiles from './components/ProjectFiles';
import TeamManagement from './components/TeamManagement';
import StudioSettings from './components/StudioSettings';
import FilePreviewModal from './components/FilePreviewModal';
import CreateProjectModal from './components/CreateProjectModal';
import AddProjectMemberModal from './components/AddProjectMemberModal';
import UserProfileModal from './components/UserProfileModal';
import AIAssistant from './components/AIAssistant';
import PublicProjectView from './components/PublicProjectView';
import { 
  CreditCard, 
  UserPlus, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ArrowLeft, 
  Pencil, 
  Construction, 
  MapPin, 
  Layers, 
  GitBranch, 
  FolderOpen, 
  Lock, 
  Trash2, 
  Loader2, 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle2, 
  Search, 
  X, 
  Filter, 
  Plus, 
  Mail, 
  Send 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar 
} from 'recharts';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role>(Role.ARCHITECT_HEAD);
  const [isCoreAccount, setIsCoreAccount] = useState<boolean>(true); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailView, setProjectDetailView] = useState<'workflow' | 'hierarchy' | 'files'>('workflow');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ProjectType | 'All'>('All');
  const [filterClassification, setFilterClassification] = useState<ProjectClassification | 'All'>('All');
  const [allProjects, setAllProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [rolePermissions, setRolePermissions] = useState<Record<Role, RolePermissions>>(ROLE_PERMISSIONS);
  const [currentUser, setCurrentUser] = useState<TeamMember>(MOCK_TEAM_MEMBERS[0]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'Phase Complete', message: 'Ideation phase for Meghna Riverside Residence has been marked complete.', timestamp: Date.now() - 3600000, read: false, type: 'success', projectId: '1' },
    { id: 'n2', title: 'Pending Approval', message: 'New CAD drawings uploaded for The Glass Pavilion require review.', timestamp: Date.now() - 7200000, read: false, type: 'info', projectId: '2' },
    { id: 'n3', title: 'System Maintenance', message: 'Scheduled maintenance on Saturday 10 PM.', timestamp: Date.now() - 86400000, read: true, type: 'warning' },
  ]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false); 
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false); 
  const [isProjectTeamModalOpen, setIsProjectTeamModalOpen] = useState(false); 
  const [editingProject, setEditingProject] = useState<Project | null>(null); 
  const [previewFile, setPreviewFile] = useState<Asset | null>(null); 
  const [newMemberForm, setNewMemberForm] = useState<Partial<TeamMember>>({ name: '', role: Role.ARCHITECT_JUNIOR, email: '', monthlyCost: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const PRICE_PER_SEAT = 1000;
  const USED_SEATS = teamMembers.filter(m => m.status === 'active' || m.status === 'pending').length;
  const TOTAL_SEATS = 25; 

  // Deadline Checker Effect
  useEffect(() => {
    const checkDeadlines = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);

      const newNotifs: AppNotification[] = [];

      allProjects.forEach(p => {
        p.stages.forEach(s => {
          s.tasks.forEach(t => {
            if (t.status !== 'completed' && t.dueDate && t.dueDate !== 'ASAP') {
              const due = new Date(t.dueDate);
              // Simple validity check
              if (!isNaN(due.getTime())) {
                const isOverdue = due < today;
                const isUpcoming = due <= threeDaysLater && due >= today;

                if (isOverdue) {
                  newNotifs.push({
                    id: `overdue-${t.id}`,
                    title: 'Task Overdue',
                    message: `Task "${t.title}" in ${p.name} was due on ${t.dueDate}.`,
                    timestamp: Date.now(),
                    read: false,
                    type: 'error',
                    projectId: p.id
                  });
                } else if (isUpcoming) {
                  newNotifs.push({
                    id: `upcoming-${t.id}`,
                    title: 'Deadline Approaching',
                    message: `Task "${t.title}" in ${p.name} is due on ${t.dueDate}.`,
                    timestamp: Date.now(),
                    read: false,
                    type: 'warning',
                    projectId: p.id
                  });
                }
              }
            }
          });
        });
      });

      if (newNotifs.length > 0) {
        setNotifications(prev => {
          // Avoid duplicate notifications for the same task event
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifs.filter(n => !existingIds.has(n.id));
          return [...uniqueNew, ...prev];
        });
      }
    };

    checkDeadlines();
  }, [allProjects]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    if (notification.projectId) {
      const targetProject = allProjects.find(p => p.id === notification.projectId);
      if (targetProject) {
        setSelectedProject(targetProject);
        setProjectDetailView('workflow'); 
        setCurrentView('project-detail');
      }
    }
  };

  const visibleProjects = useMemo(() => {
    let projects = isCoreAccount ? allProjects : allProjects.filter(project => {
      return Object.keys(project.team).includes(currentRole);
    });

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        projects = projects.filter(p => 
            p.name.toLowerCase().includes(lowerQ) || 
            p.location.toLowerCase().includes(lowerQ) ||
            p.clientName.toLowerCase().includes(lowerQ)
        );
    }

    if (filterType !== 'All') {
        projects = projects.filter(p => p.type === filterType);
    }

    if (filterClassification !== 'All') {
        projects = projects.filter(p => p.classification === filterClassification);
    }

    return projects;
  }, [allProjects, isCoreAccount, currentRole, searchQuery, filterType, filterClassification]);

  const canViewFinancials = isCoreAccount || currentRole === Role.ACCOUNT_MANAGER;

  const aggregateFinancials = useMemo(() => {
    const baseProjects = isCoreAccount ? allProjects : allProjects.filter(project => Object.keys(project.team).includes(currentRole));
    
    return baseProjects.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + (curr.financials?.totalInvoiced || 0),
      totalExpenses: acc.totalExpenses + (curr.financials?.totalExpenses || 0),
      totalCollected: acc.totalCollected + (curr.financials?.totalCollected || 0),
      pendingBills: acc.pendingBills + (curr.financials?.pendingBills || 0),
    }), { totalRevenue: 0, totalExpenses: 0, totalCollected: 0, pendingBills: 0 });
  }, [allProjects, isCoreAccount, currentRole]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view !== 'project-detail' && view !== 'public-project') {
      setSelectedProject(null);
      setProjectDetailView('workflow');
    }
  };

  const handleSignOut = () => {
    setShowLanding(true);
    setCurrentView('dashboard');
    setSelectedProject(null);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  const handlePublicProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('public-project');
  };

  const handleAddMember = () => {
    if (newMemberForm.email && newMemberForm.role) {
      const newMember: TeamMember = {
        id: `m-${Date.now()}`,
        name: newMemberForm.name || '', 
        role: newMemberForm.role,
        email: newMemberForm.email,
        monthlyCost: Number(newMemberForm.monthlyCost) || 0,
        status: 'pending', 
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setTeamMembers([...teamMembers, newMember]);
      setIsAddMemberOpen(false);
      setNewMemberForm({ name: '', role: Role.ARCHITECT_JUNIOR, email: '', monthlyCost: 0 });
      showToast(`Invitation sent to ${newMember.email}`);
    }
  };

  const handleSimulateJoin = (id: string) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'active' } : m));
    showToast('Member accepted invitation and joined the studio.');
  };

  const handleMemberStatusChange = (id: string, status: 'active' | 'inactive') => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    showToast(`Member status updated to ${status}.`);
  };

  const handleUpdatePermission = (role: Role, key: keyof RolePermissions) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key]
      }
    }));
  };

  const handleUpdateProfile = (updatedUser: TeamMember) => {
    setCurrentUser(updatedUser);
    setTeamMembers(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
    showToast("Profile updated successfully.");
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
        const updatedProjects = allProjects.filter(p => p.id !== projectId);
        setAllProjects(updatedProjects);
        if (selectedProject?.id === projectId) {
            setSelectedProject(null);
            setCurrentView('dashboard');
        }
        setIsProjectModalOpen(false);
        showToast("Project deleted permanently.");
    }
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      const updatedProject = {
        ...editingProject,
        ...projectData,
        id: editingProject.id,
        stages: editingProject.stages,
        team: editingProject.team,
        documents: editingProject.documents,
        financials: editingProject.financials,
        thumbnailUrl: projectData.thumbnailUrl || editingProject.thumbnailUrl,
        clientPointOfContact: projectData.clientPointOfContact || editingProject.clientPointOfContact,
        clientEmail: projectData.clientEmail || editingProject.clientEmail,
        description: projectData.description || editingProject.description,
        gallery: projectData.gallery || editingProject.gallery // Persist gallery
      };

      setAllProjects(allProjects.map(p => p.id === editingProject.id ? updatedProject : p));
      
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject(updatedProject);
      }
      
      showToast(`Project "${updatedProject.name}" updated successfully.`);
    } else {
      const newId = `p-${Date.now()}`;
      const defaultStages = generateStandardStages('client-onboarding'); 
      
      const newProject: Project = {
        id: newId,
        name: projectData.name || 'Untitled Project',
        location: projectData.location || '',
        googleMapLink: projectData.googleMapLink,
        clientName: projectData.clientName || '',
        clientPointOfContact: projectData.clientPointOfContact || '',
        clientEmail: projectData.clientEmail || '',
        type: projectData.type || 'Residential',
        classification: projectData.classification || 'Private',
        squareFootage: projectData.squareFootage || 0,
        budget: projectData.budget || 0,
        description: projectData.description || '',
        financials: projectData.financials || {
          totalInvoiced: 0,
          totalCollected: 0,
          totalExpenses: 0,
          pendingBills: 0
        },
        currentStageId: defaultStages[0].id,
        stages: defaultStages,
        documents: [],
        thumbnailUrl: projectData.thumbnailUrl || `https://picsum.photos/800/600?random=${allProjects.length + 10}`, 
        gallery: projectData.gallery || [], // Initialize gallery
        team: {
          [currentUser.role]: currentUser.name 
        }
      };

      setAllProjects([...allProjects, newProject]);
      showToast(`Project "${newProject.name}" created successfully.`);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    setAllProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProjectClick = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleUpdateStageAccess = (stageId: string, userName: string, hasAccess: boolean) => {
    if (!selectedProject) return;

    const updatedStages = selectedProject.stages.map(stage => {
      if (stage.id === stageId) {
        let newParticipants = stage.participants || [];
        if (hasAccess && !newParticipants.includes(userName)) {
           newParticipants = [...newParticipants, userName];
        } else if (!hasAccess) {
           newParticipants = newParticipants.filter(p => p !== userName);
        }
        return { ...stage, participants: newParticipants };
      }
      return stage;
    });

    const updatedProject = { ...selectedProject, stages: updatedStages };
    handleProjectUpdate(updatedProject);
  };

  const handleUpdateProjectTeam = (action: 'add' | 'remove', role: Role, memberName?: string) => {
    if (!selectedProject) return;

    const updatedTeam = { ...selectedProject.team };
    
    if (action === 'remove') {
        delete updatedTeam[role];
        showToast(`Removed ${role} from project team.`);
    } else if (action === 'add' && memberName) {
        updatedTeam[role] = memberName;
        showToast(`Assigned ${memberName} as ${role}.`);
    }

    const updatedProject = { ...selectedProject, team: updatedTeam };
    handleProjectUpdate(updatedProject);
  };

  const handleAddToProjectTeam = (role: Role, memberName: string) => {
    handleUpdateProjectTeam('add', role, memberName);
  };

  const handleUploadProjectDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    const hasSpace = checkStorageQuota(allProjects, file.size);
    if (!hasSpace) {
      showToast("Storage Limit Reached. Contact Admin.");
      return;
    }

    setIsUploadingDoc(true);
    try {
      const url = await simulateCloudUpload(file);
      const newDoc: Asset = {
        id: `doc-${Date.now()}`,
        title: file.name,
        type: determineAssetType(file.name),
        url,
        uploadedBy: currentUser.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
        verificationStatus: 'none'
      };

      const updatedProject = {
        ...selectedProject,
        documents: [...(selectedProject.documents || []), newDoc]
      };
      
      handleProjectUpdate(updatedProject);
      showToast("Document uploaded successfully.");
    } catch (err) {
      showToast("Upload failed.");
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDeleteProjectDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProject) return;
    if (window.confirm("Are you sure you want to remove this document?")) {
        const updatedProject = {
            ...selectedProject,
            documents: selectedProject.documents.filter(d => d.id !== docId)
        };
        handleProjectUpdate(updatedProject);
        showToast("Document removed.");
    }
  };

  const DollarSignIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );

  const renderFinancialDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Subscription Panel */}
      <div className="bg-zinc-50 border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white border border-slate-200">
              <CreditCard size={24} className="text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black uppercase tracking-tight">Core Subscription</h3>
              <p className="text-sm text-slate-500">Enterprise Plan • Monthly Billing</p>
            </div>
          </div>
          
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Active Seats</p>
              <p className="text-2xl font-bold text-black">{USED_SEATS} <span className="text-slate-400 text-lg">/ {TOTAL_SEATS}</span></p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Current Bill</p>
              <p className="text-2xl font-bold text-emerald-600">{((USED_SEATS * PRICE_PER_SEAT)).toLocaleString()} tk</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-2 bg-black text-white hover:bg-slate-800 px-4 py-2 text-sm font-bold uppercase transition-colors"
            >
              <UserPlus size={16} /> Add Member
            </button>
            <button 
              onClick={() => setIsManageRolesOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 px-4 py-2 text-sm font-bold uppercase transition-colors"
            >
              Manage Roles
            </button>
          </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black uppercase tracking-tight">Financial Command Center</h2>
        <span className="text-xs font-bold bg-black text-white px-3 py-1 uppercase">Core Access Only</span>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-slate-200 shadow-sm hover:border-black transition-colors group">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-xs font-bold uppercase">Total Invoiced</h3>
             <Receipt className="text-slate-300 group-hover:text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900">${(aggregateFinancials.totalRevenue / 1000000).toFixed(2)}M</p>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <TrendingUp size={12} /> +12% vs last month
          </span>
        </div>
        <div className="bg-white p-6 border border-slate-200 shadow-sm hover:border-black transition-colors group">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-xs font-bold uppercase">Total Expenses</h3>
             <TrendingDown className="text-slate-300 group-hover:text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900">${(aggregateFinancials.totalExpenses / 1000000).toFixed(2)}M</p>
          <span className="text-xs text-slate-400 font-medium mt-2 block">Operational & Site Costs</span>
        </div>
        <div className="bg-white p-6 border border-slate-200 shadow-sm hover:border-black transition-colors group">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-xs font-bold uppercase">Pending Bills</h3>
             <Receipt className="text-slate-300 group-hover:text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-900">${aggregateFinancials.pendingBills.toLocaleString()}</p>
          <span className="text-xs text-red-500 font-medium mt-2 block">Requires Attention</span>
        </div>
        <div className="bg-white p-6 border border-slate-200 shadow-sm hover:border-black transition-colors group">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-xs font-bold uppercase">Net Cash Flow</h3>
             <Wallet className="text-slate-300 group-hover:text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            +${((aggregateFinancials.totalCollected - aggregateFinancials.totalExpenses) / 1000).toFixed(1)}k
          </p>
          <span className="text-xs text-slate-400 font-medium mt-2 block">Liquid Assets</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200">
           <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-6">Cash Flow Analysis</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { month: 'JAN', in: 40000, out: 24000 },
                 { month: 'FEB', in: 30000, out: 13980 },
                 { month: 'MAR', in: 20000, out: 58000 },
                 { month: 'APR', in: 27800, out: 39080 },
                 { month: 'MAY', in: 18900, out: 4800 },
                 { month: 'JUN', in: 23900, out: 38000 },
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #000' }} />
                 <Bar dataKey="in" fill="#16a34a" name="Income" />
                 <Bar dataKey="out" fill="#0f172a" name="Expense" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        {/* Project List */}
        <div className="bg-white p-6 border border-slate-200 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight">Active Projects</h2>
            <button onClick={() => setCurrentView('projects')} className="text-xs font-bold uppercase text-slate-500 hover:text-black">View All</button>
          </div>
          <div className="space-y-4">
             {visibleProjects.slice(0, 4).map(p => (
               <div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 cursor-pointer hover:bg-zinc-50 p-2" onClick={() => handleProjectClick(p)}>
                  <div>
                    <p className="text-xs font-bold text-black">{p.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{p.location} • {p.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">${(p.budget/1000).toFixed(0)}k</p>
                    <p className="text-[10px] text-slate-400">Budget</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 border border-slate-200 flex flex-col items-center justify-center text-center">
         <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full mb-4 overflow-hidden border-2 border-white ring-2 ring-slate-100">
            {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
                <Activity size={32} />
            )}
         </div>
         <h2 className="text-2xl font-bold text-black uppercase tracking-tight mb-2">Welcome Back, {currentUser.name.split(' ')[0]}</h2>
         <p className="text-slate-500 max-w-md">
           You have <strong>{visibleProjects.length} active projects</strong> assigned to your role as <strong>{currentRole}</strong>. 
           {currentUser.bio && <span className="block mt-2 italic text-xs">"{currentUser.bio}"</span>}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Projects */}
        <div className="col-span-2">
           <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-4">My Projects</h3>
           {visibleProjects.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {visibleProjects.map(project => (
                 <ProjectCard 
                    key={project.id} 
                    project={project} 
                    canViewFinancials={canViewFinancials}
                    onClick={handleProjectClick} 
                 />
               ))}
             </div>
           ) : (
             <div className="p-12 border-2 border-dashed border-slate-200 text-center text-slate-400">
               <p>No projects assigned to this role.</p>
             </div>
           )}
        </div>

        {/* Notifications / Tasks */}
        <div className="bg-white p-6 border border-slate-200 h-fit">
           <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-4">Pending Actions</h3>
           <ul className="space-y-3">
             <li className="flex gap-3 items-start p-3 bg-zinc-50 border border-slate-100">
               <div className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
               <div>
                 <p className="text-xs font-bold text-black">Upload Site Photos</p>
                 <p className="text-[10px] text-slate-500">Azure Skyline • Phase 4</p>
               </div>
             </li>
             <li className="flex gap-3 items-start p-3 bg-zinc-50 border border-slate-100">
               <div className="mt-1 w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
               <div>
                 <p className="text-xs font-bold text-black">Approve CAD Drawings</p>
                 <p className="text-xs text-slate-500">The Glass Pavilion</p>
               </div>
             </li>
           </ul>
        </div>
      </div>
    </div>
  );

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    const completedCount = selectedProject.stages.filter(s => s.status === 'completed').length;
    const totalCount = selectedProject.stages.length;
    const percentComplete = Math.round((completedCount / totalCount) * 100);

    return (
      <div className="animate-in slide-in-from-right-4 duration-500 space-y-8 max-w-full mx-auto relative pb-20">
        {/* Floating AI Assistant */}
        <AIAssistant project={selectedProject} />

        {/* Top Utility Bar & Progress */}
        <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
           <button 
             onClick={() => handleNavigate('dashboard')}
             className="flex items-center gap-2 text-slate-500 hover:text-black transition-colors font-medium text-sm"
           >
             <ArrowLeft size={16} /> BACK TO DASHBOARD
           </button>
           
           <div className="flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Project Progress</p>
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-emerald-600">{percentComplete}%</span>
                    <span className="text-xs font-bold text-slate-400">COMPLETED</span>
                 </div>
              </div>
              <div className="w-48">
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                    <span>Start</span>
                    <span>Handover</span>
                 </div>
                 <div className="h-2 bg-zinc-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${percentComplete}%` }}></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-6 gap-6">
          <div className="group relative">
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Active Project</span>
               {isCoreAccount && (
                 <button 
                    onClick={() => handleEditProjectClick(selectedProject)}
                    className="mb-2 p-1 text-slate-400 hover:text-black hover:bg-zinc-100 rounded transition-colors"
                    title="Edit Project Details"
                 >
                    <Pencil size={14} />
                 </button>
               )}
             </div>
            <h1 className="text-5xl font-black text-black tracking-tight uppercase leading-none">{selectedProject.name}</h1>
            <p className="text-slate-500 mt-4 flex items-center gap-4 text-sm font-medium flex-wrap">
              <div className="flex items-center gap-2">
                <Construction size={16} /> 
                {selectedProject.location}
                {selectedProject.googleMapLink && (
                  <a 
                    href={selectedProject.googleMapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline text-xs flex items-center gap-1"
                    title="Open in Google Maps"
                  >
                     <MapPin size={12} /> View Map
                  </a>
                )}
              </div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{selectedProject.squareFootage.toLocaleString()} sq ft</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="bg-zinc-100 px-2 py-0.5 rounded-sm uppercase text-xs font-bold">{selectedProject.type}</span>
              <span className="bg-zinc-100 px-2 py-0.5 rounded-sm uppercase text-xs font-bold">{selectedProject.classification}</span>
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
             {/* View Toggle */}
            <div className="bg-zinc-100 p-1 flex">
              <button 
                onClick={() => setProjectDetailView('workflow')}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all ${projectDetailView === 'workflow' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black'}`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={14} /> Workflow
                </div>
              </button>
              <button 
                onClick={() => setProjectDetailView('hierarchy')}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all ${projectDetailView === 'hierarchy' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black'}`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={14} /> Hierarchy
                </div>
              </button>
              <button 
                onClick={() => setProjectDetailView('files')}
                className={`px-4 py-2 text-xs font-bold uppercase transition-all ${projectDetailView === 'files' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black'}`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} /> Files
                </div>
              </button>
            </div>

            {/* Budget Widget - Only Visible if Privileged */}
            {canViewFinancials ? (
              <div className="bg-black text-white p-4 min-w-[200px]">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Budget</p>
                <p className="text-3xl font-bold tracking-tight">${selectedProject.budget.toLocaleString()}</p>
              </div>
            ) : (
              <div className="bg-zinc-100 text-slate-400 p-4 min-w-[200px] flex flex-col items-center justify-center border border-slate-200">
                <Lock size={20} className="mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Financials Restricted</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Financial Tab (Only for Core/Managers) - Only show in Workflow View */}
        {canViewFinancials && projectDetailView === 'workflow' && (
           <div className="bg-zinc-50 border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <DollarSignIcon size={16} /> Project Financial Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-white p-4 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Invoiced</p>
                    <p className="text-xl font-bold text-black">${selectedProject.financials?.totalInvoiced.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-4 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Collected</p>
                    <p className="text-xl font-bold text-emerald-600">${selectedProject.financials?.totalCollected.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-4 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Site Expenses</p>
                    <p className="text-xl font-bold text-slate-900">${selectedProject.financials?.totalExpenses.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-4 border border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Pending Bills</p>
                    <p className="text-xl font-bold text-red-600">${selectedProject.financials?.pendingBills.toLocaleString()}</p>
                 </div>
              </div>
           </div>
        )}

        {/* Main Workspace Content */}
        <div className="space-y-12">
          {projectDetailView === 'workflow' ? (
             <KanbanBoard 
                project={selectedProject} 
                userRole={currentRole} 
                isCoreAccount={isCoreAccount} 
                rolePermissions={rolePermissions}
                onUpdateProject={handleProjectUpdate} 
                onPreview={(file) => setPreviewFile(file)}
             />
          ) : projectDetailView === 'hierarchy' ? (
             <ProjectHierarchy 
                project={selectedProject} 
                isCoreAccount={isCoreAccount} 
                onUpdateStageAccess={handleUpdateStageAccess}
                onUpdateTeam={handleUpdateProjectTeam}
                allTeamMembers={teamMembers}
             />
          ) : (
            <ProjectFiles 
                project={selectedProject} 
                onPreview={(file) => setPreviewFile(file)} 
            />
          )}
        </div>

        {/* Bottom Section: Team & Quick Links (Only show in Workflow to avoid clutter in Hierarchy) */}
        {projectDetailView === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 border-t border-slate-200">
            
            {/* Team Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-black uppercase tracking-tight">Project Team</h3>
                  {isCoreAccount && (
                    <button 
                      onClick={() => setIsProjectTeamModalOpen(true)}
                      className="text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <UserPlus size={14} /> ADD MEMBER
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedProject.team).map(([role, name]) => (
                    <div key={role} className="flex items-center gap-3 p-3 border border-slate-100 bg-white group relative">
                      <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                        {name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-xs">{name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">{role}</p>
                      </div>
                      
                      {isCoreAccount && (
                        <button 
                          onClick={() => handleUpdateProjectTeam('remove', role as Role)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                          title="Remove from project"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
            </div>

            {/* Quick Links / Project Docs Section */}
            <div className="bg-zinc-50 p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black uppercase tracking-tight">Project Docs</h3>
                {isCoreAccount && (
                  <>
                    <input 
                      type="file" 
                      ref={docInputRef} 
                      className="hidden" 
                      onChange={handleUploadProjectDoc} 
                    />
                    <button 
                      onClick={() => docInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="text-xs font-bold uppercase bg-black text-white px-3 py-1 flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {isUploadingDoc ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload Doc
                    </button>
                  </>
                )}
              </div>
              
              <ul className="space-y-2">
                {(selectedProject.documents || []).length > 0 ? (
                  selectedProject.documents.map((doc) => (
                    <li 
                      key={doc.id}
                      onClick={() => setPreviewFile(doc)} 
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-black cursor-pointer transition-colors group"
                    >
                        <span className="flex items-center gap-3 text-sm font-bold text-slate-800 truncate flex-1">
                          {doc.type === 'pdf' ? <FileText size={14} className="text-red-500" /> : 
                           doc.type === 'document' || doc.title.endsWith('xlsx') ? <FileText size={14} className="text-blue-500" /> :
                           <LinkIcon size={14} />}
                          {doc.title}
                        </span>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-slate-400 uppercase">
                                {doc.verificationStatus === 'verified' && (
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold mr-2">
                                        <CheckCircle2 size={10} /> VERIFIED
                                    </span>
                                )}
                                {doc.type.toUpperCase()} • {(doc.size ? (doc.size / (1024*1024)).toFixed(1) : '0')}MB
                            </span>
                            {isCoreAccount && (
                                <button 
                                    onClick={(e) => handleDeleteProjectDoc(doc.id, e)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-slate-400 text-xs italic border border-dashed border-slate-200">
                    No documents uploaded.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  if (currentView === 'public-project' && selectedProject) {
    return (
      <PublicProjectView 
        project={selectedProject} 
        onBack={() => {
          setSelectedProject(null);
          setCurrentView('settings'); // Return to settings/portfolio view
        }} 
      />
    );
  }

  return (
    <Layout 
      currentRole={currentRole}
      currentUser={currentUser} 
      isCoreAccount={isCoreAccount}
      onRoleChange={setCurrentRole}
      onToggleCoreAccount={() => setIsCoreAccount(!isCoreAccount)}
      onNavigate={handleNavigate}
      onSignOut={handleSignOut}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      currentView={currentView}
      notifications={notifications}
      onMarkAllRead={handleMarkAllRead}
      onNotificationClick={handleNotificationClick} 
    >
      {currentView === 'dashboard' && (
         isCoreAccount ? renderFinancialDashboard() : renderUserDashboard()
      )}
      
      {currentView === 'project-detail' && renderProjectDetail()}
      
      {currentView === 'projects' && (
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 p-4 sticky top-0 z-20 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                 <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                 <input 
                   type="text"
                   placeholder="Search projects..." 
                   className="w-full pl-10 pr-4 py-2 border border-slate-300 text-sm focus:border-black outline-none bg-zinc-50 focus:bg-white"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 {searchQuery && (
                   <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-black">
                     <X size={14} />
                   </button>
                 )}
              </div>
              
              <div className="flex gap-4 w-full md:w-auto items-center">
                 <div className="relative">
                    <select 
                      className="appearance-none bg-white border border-slate-300 px-4 py-2 pr-8 text-xs font-bold uppercase focus:border-black outline-none cursor-pointer"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as ProjectType | 'All')}
                    >
                       <option value="All">All Types</option>
                       <option value="Residential">Residential</option>
                       <option value="Commercial">Commercial</option>
                       <option value="Hospitality">Hospitality</option>
                       <option value="Healthcare">Healthcare</option>
                       <option value="Institutional">Institutional</option>
                       <option value="Mixed-Use">Mixed-Use</option>
                       <option value="Industrial">Industrial</option>
                    </select>
                    <Filter size={12} className="absolute right-3 top-3 pointer-events-none text-slate-400" />
                 </div>

                 <div className="relative">
                    <select 
                      className="appearance-none bg-white border border-slate-300 px-4 py-2 pr-8 text-xs font-bold uppercase focus:border-black outline-none cursor-pointer"
                      value={filterClassification}
                      onChange={(e) => setFilterClassification(e.target.value as ProjectClassification | 'All')}
                    >
                       <option value="All">All Categories</option>
                       <option value="Public">Public</option>
                       <option value="Private">Private</option>
                       <option value="Semi-Public">Semi-Public</option>
                    </select>
                    <Filter size={12} className="absolute right-3 top-3 pointer-events-none text-slate-400" />
                 </div>

                 {isCoreAccount && (
                   <button 
                     onClick={handleCreateClick}
                     className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors flex items-center gap-2"
                   >
                      <Plus size={14} /> New Project
                   </button>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map(project => (
                  <ProjectCard 
                      key={project.id} 
                      project={project} 
                      canViewFinancials={canViewFinancials}
                      onClick={handleProjectClick} 
                  />
                ))}
              {visibleProjects.length === 0 && (
                  <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 bg-zinc-50">
                    <p className="font-bold uppercase">No projects found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                  </div>
              )}
           </div>
        </div>
      )}
      {(currentView === 'team') && (
         <TeamManagement 
            projects={visibleProjects} 
            isCoreAccount={isCoreAccount}
            teamMembers={teamMembers}
            onAddMember={() => setIsAddMemberOpen(true)}
            onSimulateJoin={handleSimulateJoin}
            onUpdateProject={handleProjectUpdate}
            onUpdateMemberStatus={handleMemberStatusChange}
         />
      )}
      {(currentView === 'settings') && (
        <StudioSettings 
          projects={visibleProjects} 
          teamMembers={teamMembers} 
          isCoreAccount={isCoreAccount} 
          onEditProject={handleEditProjectClick} 
          onCreateProject={handleCreateClick}
          onViewProject={handlePublicProjectClick}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-md shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      
      <FilePreviewModal 
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
      
      <CreateProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        currentUserRole={currentRole}
        projectToEdit={editingProject}
      />

      {/* Add Project Member Modal (Specific to Project) */}
      {selectedProject && (
        <AddProjectMemberModal 
           isOpen={isProjectTeamModalOpen}
           onClose={() => setIsProjectTeamModalOpen(false)}
           onAdd={handleAddToProjectTeam}
           teamMembers={teamMembers}
           currentProject={selectedProject}
        />
      )}

      {/* Invite Member Modal (Global Studio) */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
           <div className="bg-white max-w-md w-full animate-in fade-in zoom-in duration-200 border-2 border-black p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                 <h3 className="font-bold text-black uppercase flex items-center gap-2">
                   <Mail size={16} /> Invite Team Member
                 </h3>
                 <button onClick={() => setIsAddMemberOpen(false)}><X size={20} className="text-slate-400 hover:text-black" /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Email Address (Gmail)</label>
                    <input 
                      autoFocus
                      type="email"
                      className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none" 
                      value={newMemberForm.email}
                      onChange={e => setNewMemberForm({...newMemberForm, email: e.target.value})}
                      placeholder="e.g. architect@gmail.com"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Assign Role</label>
                    <select 
                      className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white"
                      value={newMemberForm.role}
                      onChange={e => setNewMemberForm({...newMemberForm, role: e.target.value as Role})}
                    >
                       {Object.values(Role).map(role => (
                          <option key={role} value={role}>{role}</option>
                       ))}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Name (Optional)</label>
                    <input 
                      className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none" 
                      value={newMemberForm.name}
                      onChange={e => setNewMemberForm({...newMemberForm, name: e.target.value})}
                      placeholder="Name will be auto-filled upon joining"
                    />
                 </div>
                 
                 <div className="bg-zinc-50 p-3 border border-slate-200 text-xs text-slate-500">
                    <p className="mb-1 font-bold">Invitation Process:</p>
                    <ul className="list-disc pl-4 space-y-1">
                       <li>User receives an email with a secure join link.</li>
                       <li>Access is granted to Studio Profile immediately.</li>
                       <li>Project access must be assigned manually after joining.</li>
                    </ul>
                 </div>

                 <button 
                   onClick={handleAddMember}
                   disabled={!newMemberForm.email}
                   className="w-full bg-black text-white py-3 text-sm font-bold uppercase hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                 >
                   <Send size={16} /> Send Invitation
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {isManageRolesOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
           <div className="bg-white max-w-4xl w-full h-[80vh] animate-in fade-in zoom-in duration-200 border-2 border-black p-6 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 flex-shrink-0">
                 <div>
                   <h3 className="font-bold text-black uppercase text-xl">Role Permissions Matrix</h3>
                   <p className="text-xs text-slate-500">Configure what each role can access within the system.</p>
                 </div>
                 <button onClick={() => setIsManageRolesOpen(false)}><X size={24} className="text-slate-400 hover:text-black" /></button>
              </div>
              
              <div className="flex-1 overflow-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                       <tr className="bg-zinc-50 border-b border-black">
                          <th className="p-3 text-[10px] font-bold uppercase text-slate-500 w-1/3">Role</th>
                          <th className="p-3 text-[10px] font-bold uppercase text-slate-500 text-center">Edit Tasks</th>
                          <th className="p-3 text-[10px] font-bold uppercase text-slate-500 text-center">Upload Files</th>
                          <th className="p-3 text-[10px] font-bold uppercase text-slate-500 text-center">View Financials</th>
                          <th className="p-3 text-[10px] font-bold uppercase text-slate-500 text-center">Manage Team</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {Object.values(Role).map(role => {
                          const perms = rolePermissions[role] || { canEdit: false, canUpload: false, canViewFinancials: false, canManageTeam: false };
                          return (
                             <tr key={role} className="hover:bg-zinc-50">
                                <td className="p-3 font-bold text-xs">{role}</td>
                                <td className="p-3 text-center">
                                   <input 
                                     type="checkbox" 
                                     checked={perms.canEdit}
                                     onChange={() => handleUpdatePermission(role, 'canEdit')}
                                     className="w-4 h-4 accent-black"
                                   />
                                </td>
                                <td className="p-3 text-center">
                                   <input 
                                     type="checkbox" 
                                     checked={perms.canUpload}
                                     onChange={() => handleUpdatePermission(role, 'canUpload')}
                                     className="w-4 h-4 accent-black"
                                   />
                                </td>
                                <td className="p-3 text-center">
                                   <input 
                                     type="checkbox" 
                                     checked={perms.canViewFinancials}
                                     onChange={() => handleUpdatePermission(role, 'canViewFinancials')}
                                     className="w-4 h-4 accent-black"
                                   />
                                </td>
                                <td className="p-3 text-center">
                                   <input 
                                     type="checkbox" 
                                     checked={perms.canManageTeam}
                                     onChange={() => handleUpdatePermission(role, 'canManageTeam')}
                                     className="w-4 h-4 accent-black"
                                   />
                                </td>
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
              <div className="pt-4 border-t border-slate-200 mt-4 flex justify-end">
                  <button 
                    onClick={() => setIsManageRolesOpen(false)}
                    className="bg-black text-white px-6 py-2 font-bold uppercase text-xs hover:bg-zinc-800"
                  >
                    Done
                  </button>
              </div>
           </div>
        </div>
      )}

      <UserProfileModal 
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleUpdateProfile}
      />

    </Layout>
  );
};

export default App;
