
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
import ClientPaymentPortal from './components/ClientPaymentPortal';
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
  Send,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  PieChart,
  DollarSign,
  Clock,
  Eye
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
  const [projectDetailView, setProjectDetailView] = useState<'workflow' | 'hierarchy' | 'files' | 'client-portal'>('workflow');
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
  
  // Financial Dashboard State
  const [expandedFinProject, setExpandedFinProject] = useState<string | null>(null);

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

  // Handle Role Change Side Effects
  useEffect(() => {
    // If role switches to CLIENT, change view default
    if (currentRole === Role.CLIENT) {
        setIsCoreAccount(false);
        setProjectDetailView('client-portal');
    } else {
        setProjectDetailView('workflow');
    }
  }, [currentRole]);

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
        if (currentRole === Role.CLIENT) {
            setProjectDetailView('client-portal');
        } else {
            setProjectDetailView('workflow');
        }
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
      if (currentRole === Role.CLIENT) {
          setProjectDetailView('client-portal');
      } else {
          setProjectDetailView('workflow');
      }
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
    if (currentRole === Role.CLIENT) {
        setProjectDetailView('client-portal');
    }
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
        history: [], // Initialize history
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
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

      {/* DETAILED PROJECT BREAKDOWN */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-zinc-50 flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase text-black flex items-center gap-2">
               <PieChart size={16} /> Project Ledgers
            </h3>
            <span className="text-xs text-slate-500 font-medium">{visibleProjects.length} Active Accounts</span>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                     <th className="p-4 w-[25%]">Project Name</th>
                     <th className="p-4 w-[15%] text-right">Budget</th>
                     <th className="p-4 w-[15%] text-right">Invoiced</th>
                     <th className="p-4 w-[15%] text-right">Spent (Real)</th>
                     <th className="p-4 w-[15%] text-right">Margin</th>
                     <th className="p-4 w-[10%] text-center">Status</th>
                     <th className="p-4 w-[5%]"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {visibleProjects.map(p => {
                     const totalSpend = p.stages.reduce((acc, s) => acc + (s.expenses || []).reduce((eAcc, e) => eAcc + e.totalAmount, 0), 0);
                     const margin = p.financials.totalInvoiced - totalSpend;
                     const leak = totalSpend - p.financials.totalInvoiced; // Rough logic: Expenses > Invoiced
                     const backlog = p.financials.totalInvoiced - p.financials.totalCollected;
                     
                     const isExpanded = expandedFinProject === p.id;

                     return (
                        <React.Fragment key={p.id}>
                           <tr className={`hover:bg-zinc-50 transition-colors ${isExpanded ? 'bg-zinc-50 font-bold' : ''}`}>
                              <td className="p-4 text-xs text-black">
                                 {p.name}
                                 <div className="text-[9px] text-slate-400 mt-0.5">{p.clientName}</div>
                              </td>
                              <td className="p-4 text-xs text-right font-mono text-slate-500">${p.budget.toLocaleString()}</td>
                              <td className="p-4 text-xs text-right font-mono text-emerald-600">${p.financials.totalInvoiced.toLocaleString()}</td>
                              <td className="p-4 text-xs text-right font-mono text-red-500">${totalSpend.toLocaleString()}</td>
                              <td className={`p-4 text-xs text-right font-mono ${margin >= 0 ? 'text-black' : 'text-red-600'}`}>
                                 {margin >= 0 ? '+' : ''}${margin.toLocaleString()}
                              </td>
                              <td className="p-4 text-center">
                                 {backlog > 0 ? (
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-sm uppercase font-bold">Owes Funds</span>
                                 ) : (
                                    <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded-sm uppercase font-bold">Settled</span>
                                 )}
                              </td>
                              <td className="p-4 text-center">
                                 <button onClick={() => setExpandedFinProject(isExpanded ? null : p.id)} className="p-1 hover:bg-zinc-200 rounded">
                                    {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                 </button>
                              </td>
                           </tr>
                           
                           {isExpanded && (
                              <tr>
                                 <td colSpan={7} className="p-0 bg-zinc-50 border-b border-slate-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 animate-in slide-in-from-top-2 fade-in duration-300">
                                       
                                       {/* LEFT: Phase Breakdown */}
                                       <div className="bg-white border border-slate-200 shadow-sm">
                                          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                                             <h4 className="text-xs font-bold uppercase text-slate-600">Phase Economics</h4>
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost Center Breakdown</span>
                                          </div>
                                          <div className="max-h-[300px] overflow-y-auto">
                                             <table className="w-full text-left">
                                                <thead className="sticky top-0 bg-zinc-50 text-[9px] font-bold uppercase text-slate-400">
                                                   <tr>
                                                      <th className="p-3 pl-4">Stage</th>
                                                      <th className="p-3 text-right">Materials/Labor (Cost)</th>
                                                      <th className="p-3 text-center">Status</th>
                                                   </tr>
                                                </thead>
                                                <tbody className="text-xs divide-y divide-slate-50">
                                                   {p.stages.map(stage => {
                                                      const stageCost = (stage.expenses || []).reduce((sum, ex) => sum + ex.totalAmount, 0);
                                                      return (
                                                         <tr key={stage.id} className="hover:bg-zinc-50">
                                                            <td className="p-3 pl-4 font-bold text-black">{stage.name}</td>
                                                            <td className="p-3 text-right font-mono text-slate-600">
                                                               {stageCost > 0 ? `$${stageCost.toLocaleString()}` : '-'}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                               <span className={`text-[9px] uppercase px-2 py-0.5 rounded-sm ${stage.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : stage.status === 'active' ? 'bg-black text-white' : 'text-slate-300'}`}>
                                                                  {stage.status}
                                                               </span>
                                                            </td>
                                                         </tr>
                                                      )
                                                   })}
                                                </tbody>
                                             </table>
                                          </div>
                                       </div>

                                       {/* RIGHT: Transaction Log & Health */}
                                       <div className="flex flex-col gap-6">
                                          
                                          {/* Health Metrics */}
                                          <div className="grid grid-cols-3 gap-4">
                                             <div className="bg-white border border-slate-200 p-4">
                                                <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                                   <AlertOctagon size={10} className="text-red-500"/> The Leak
                                                </p>
                                                <p className="text-lg font-bold text-slate-900" title="Expenses not yet invoiced">
                                                   ${Math.max(0, totalSpend - p.financials.totalInvoiced).toLocaleString()}
                                                </p>
                                                <p className="text-[8px] text-slate-400 mt-1">Uninvoiced Expenses</p>
                                             </div>
                                             <div className="bg-white border border-slate-200 p-4">
                                                <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                                   <Clock size={10} className="text-amber-500"/> The Backlog
                                                </p>
                                                <p className="text-lg font-bold text-slate-900" title="Invoiced but not collected">
                                                   ${backlog.toLocaleString()}
                                                </p>
                                                <p className="text-[8px] text-slate-400 mt-1">Accounts Receivable</p>
                                             </div>
                                             <div className="bg-white border border-slate-200 p-4">
                                                <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                                   <TrendingUp size={10} className="text-emerald-500"/> Net Margin
                                                </p>
                                                <p className={`text-lg font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                   {((margin / (p.financials.totalInvoiced || 1)) * 100).toFixed(1)}%
                                                </p>
                                                <p className="text-[8px] text-slate-400 mt-1">Profitability</p>
                                             </div>
                                          </div>

                                          {/* Invoices */}
                                          <div className="bg-white border border-slate-200 flex-1 flex flex-col">
                                             <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                                                <h4 className="text-xs font-bold uppercase text-slate-600">Transaction Ledger</h4>
                                                <button className="text-[9px] font-bold uppercase text-emerald-600 hover:underline">View All Invoices</button>
                                             </div>
                                             <div className="flex-1 overflow-y-auto max-h-[200px] p-0">
                                                {(p.financials.transactions || []).length > 0 ? (
                                                   <table className="w-full text-left">
                                                      <tbody className="text-xs divide-y divide-slate-50">
                                                         {p.financials.transactions?.map(tx => (
                                                            <tr key={tx.id} className="hover:bg-zinc-50">
                                                               <td className="p-3 pl-4">
                                                                  <div className="font-bold text-black">{tx.description}</div>
                                                                  <div className="text-[9px] text-slate-400 font-mono">{tx.date}</div>
                                                               </td>
                                                               <td className="p-3 text-center">
                                                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${tx.type === 'invoice' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                     {tx.type}
                                                                  </span>
                                                               </td>
                                                               <td className="p-3 text-right font-mono font-bold">
                                                                  {tx.type === 'payment' ? '+' : ''}${tx.amount.toLocaleString()}
                                                               </td>
                                                               <td className="p-3 pr-4 text-right">
                                                                  {tx.status === 'paid' && <CheckCircle2 size={12} className="text-emerald-500 ml-auto" />}
                                                                  {tx.status === 'pending' && <Clock size={12} className="text-amber-500 ml-auto" />}
                                                               </td>
                                                            </tr>
                                                         ))}
                                                      </tbody>
                                                   </table>
                                                ) : (
                                                   <div className="p-8 text-center text-slate-400 text-xs italic">
                                                      No transactions recorded.
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </React.Fragment>
                     );
                  })}
               </tbody>
            </table>
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
              {currentRole !== Role.CLIENT && (
                <>
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
                </>
              )}
              {/* Client Portal Button - Visible to Clients or Core Accounts */}
              {(isCoreAccount || currentRole === Role.CLIENT) && (
                  <button 
                    onClick={() => setProjectDetailView('client-portal')}
                    className={`px-4 py-2 text-xs font-bold uppercase transition-all ${projectDetailView === 'client-portal' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:text-black'}`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} /> {isCoreAccount ? 'Client View' : 'Payments'}
                    </div>
                  </button>
              )}
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                  <DollarSign size={16} /> Project Financial Overview
                </h3>
                <button 
                  onClick={() => setProjectDetailView('client-portal')}
                  className="text-xs font-bold uppercase text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Eye size={12} /> Open Client Portal
                </button>
              </div>
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
          ) : projectDetailView === 'client-portal' ? (
             <ClientPaymentPortal 
                project={selectedProject}
                isCoreAccount={isCoreAccount}
                onUpdateProject={handleProjectUpdate}
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
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-black uppercase tracking-tight">Project Documents</h3>
                  <div className="relative">
                     <button 
                        onClick={() => docInputRef.current?.click()}
                        disabled={isUploadingDoc}
                        className="text-xs font-bold uppercase hover:underline flex items-center gap-1 disabled:opacity-50"
                     >
                        {isUploadingDoc ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
                     </button>
                     <input type="file" ref={docInputRef} className="hidden" onChange={handleUploadProjectDoc} />
                  </div>
              </div>
              
              <div className="space-y-3">
                 {selectedProject.documents && selectedProject.documents.length > 0 ? (
                    selectedProject.documents.map(doc => (
                       <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 group">
                          <div 
                             className="flex items-center gap-3 cursor-pointer"
                             onClick={() => setPreviewFile(doc)}
                          >
                             {doc.type === 'pdf' ? <FileText size={16} className="text-red-500" /> : <LinkIcon size={16} className="text-slate-400" />}
                             <div>
                                <p className="text-xs font-bold text-black truncate max-w-[150px]">{doc.title}</p>
                                <p className="text-[9px] text-slate-400 uppercase">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {doc.verificationStatus === 'verified' && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded flex items-center gap-1">
                                   <CheckCircle2 size={10} /> Verified
                                </span>
                             )}
                             {isCoreAccount && (
                                <button 
                                   onClick={(e) => handleDeleteProjectDoc(doc.id, e)}
                                   className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <Trash2 size={12} />
                                </button>
                             )}
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-6 text-slate-400 italic text-xs">
                       No documents uploaded.
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (currentView === 'dashboard') return renderUserDashboard();
    if (currentView === 'projects') return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="col-span-full flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black text-black uppercase tracking-tight">All Projects</h2>
             {isCoreAccount && (
                <button 
                  onClick={handleCreateClick}
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-800 flex items-center gap-2"
                >
                   <Plus size={14} /> New Project
                </button>
             )}
          </div>
          {visibleProjects.length > 0 ? visibleProjects.map(p => (
             <ProjectCard 
                key={p.id} 
                project={p} 
                canViewFinancials={canViewFinancials}
                onClick={handleProjectClick} 
             />
          )) : (
             <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-200">
                No projects found.
             </div>
          )}
      </div>
    );
    if (currentView === 'payments') return renderFinancialDashboard();
    if (currentView === 'team') return (
      <TeamManagement 
         projects={allProjects}
         isCoreAccount={isCoreAccount}
         teamMembers={teamMembers}
         onAddMember={() => setIsAddMemberOpen(true)}
         onSimulateJoin={handleSimulateJoin}
         onUpdateProject={handleProjectUpdate}
         onUpdateMemberStatus={handleMemberStatusChange}
      />
    );
    if (currentView === 'settings') return (
      <StudioSettings 
         projects={allProjects}
         teamMembers={teamMembers}
         isCoreAccount={isCoreAccount}
         onEditProject={handleEditProjectClick}
         onCreateProject={handleCreateClick}
         onViewProject={handleProjectClick}
      />
    );
    if (currentView === 'project-detail') return renderProjectDetail();
    if (currentView === 'public-project' && selectedProject) {
        return <PublicProjectView project={selectedProject} onBack={() => handleNavigate('dashboard')} />;
    }
    return renderUserDashboard();
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <>
      <Layout 
        currentRole={currentRole}
        currentUser={currentUser}
        isCoreAccount={isCoreAccount}
        projects={visibleProjects}
        onRoleChange={(r) => {
           setCurrentRole(r);
           // If switching to client, ensure we view client-appropriate things
           if (r === Role.CLIENT) {
              setFilterType('All');
           }
        }}
        onToggleCoreAccount={() => setIsCoreAccount(!isCoreAccount)}
        onNavigate={handleNavigate}
        onSelectProject={handleProjectClick}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currentView={currentView}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationClick}
      >
        {renderContent()}
      </Layout>

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        currentUserRole={currentRole}
        projectToEdit={editingProject}
      />

      <AddProjectMemberModal 
         isOpen={isProjectTeamModalOpen}
         onClose={() => setIsProjectTeamModalOpen(false)}
         onAdd={handleAddToProjectTeam}
         teamMembers={teamMembers}
         currentProject={selectedProject || MOCK_PROJECTS[0]}
      />

      <UserProfileModal 
         isOpen={isProfileModalOpen}
         onClose={() => setIsProfileModalOpen(false)}
         currentUser={currentUser}
         onSave={handleUpdateProfile}
      />
      
      <FilePreviewModal 
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded shadow-xl z-[100] animate-in slide-in-from-bottom-4 fade-in">
           <p className="text-xs font-bold uppercase">{toastMessage}</p>
        </div>
      )}
    </>
  );
};

export default App;
