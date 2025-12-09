
import React, { useState, useRef, useEffect } from 'react';
import { Role, TeamMember, AppNotification, Project } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Crown,
  Info,
  Clock,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Shield,
  Eye
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: Role;
  currentUser?: TeamMember;
  isCoreAccount: boolean;
  projects?: Project[];
  onRoleChange: (role: any) => void;
  onToggleCoreAccount: () => void;
  onNavigate: (view: string) => void;
  onSelectProject?: (project: Project) => void;
  onSignOut: () => void;
  onOpenProfile?: () => void;
  currentView: string;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNotificationClick: (notification: AppNotification) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRole, 
  currentUser,
  isCoreAccount,
  projects,
  onRoleChange, 
  onToggleCoreAccount, 
  onNavigate, 
  onSelectProject,
  onSignOut,
  onOpenProfile,
  currentView,
  notifications,
  onMarkAllRead,
  onNotificationClick
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'payments', label: 'Finance', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Studio', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentView === 'project-detail') {
      setIsProjectsExpanded(true);
    }
  }, [currentView]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-black selection:text-white text-xs">
      
      {/* Compact Sidebar */}
      <aside className="w-16 lg:w-56 flex flex-col flex-shrink-0 z-30 bg-white border-r border-slate-200 transition-all duration-300">
        <div className="h-14 flex items-center justify-center lg:justify-start px-4 border-b border-slate-100">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-7 h-7 bg-slate-900 text-white rounded-none flex items-center justify-center shadow-sm group-hover:bg-black transition-colors">
              <span className="font-bold text-base">B</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xs font-bold tracking-tight text-slate-900 uppercase">Blueprint<span className="font-light text-slate-400">OS</span></h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto py-4">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.id === 'projects') {
                    setIsProjectsExpanded(!isProjectsExpanded);
                    onNavigate(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`
                  w-full flex items-center justify-center lg:justify-between px-3 py-2 rounded-md transition-all duration-200 group
                  ${currentView === item.id 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                  <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wide">{item.label}</span>
                </div>
                {item.id === 'projects' && (
                  <div className={`hidden lg:block ${currentView === item.id ? 'text-white' : 'text-slate-400'}`}>
                    {isProjectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </div>
                )}
              </button>

              {/* Nested Project List - Compact */}
              {item.id === 'projects' && isProjectsExpanded && projects && (
                <div className="mt-0.5 space-y-px lg:ml-3 lg:pl-3 lg:border-l lg:border-slate-200 hidden lg:block mb-2">
                  {projects.length > 0 ? projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onSelectProject && onSelectProject(p)}
                      className={`
                        w-full text-left px-2 py-1.5 flex items-center gap-2 group transition-all text-[10px] rounded-sm
                        ${p.id === projects.find(proj => proj.id === p.id && currentView === 'project-detail')?.id 
                          ? 'bg-slate-100 text-slate-900 font-bold' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      <span className="truncate uppercase">{p.name}</span>
                    </button>
                  )) : (
                    <div className="px-2 py-1 text-[10px] text-slate-400 italic">No projects.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Compact User / Settings Footer */}
        <div className="p-3 border-t border-slate-100 bg-zinc-50">
          <div className="hidden lg:block space-y-3">
             {/* Core Toggle */}
             <div 
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${isCoreAccount ? 'bg-emerald-100/50' : 'bg-slate-100'}`}
                onClick={onToggleCoreAccount}
             >
                <div className="flex items-center gap-2">
                   {isCoreAccount ? <Crown size={12} className="text-emerald-600"/> : <Eye size={12} className="text-slate-400"/>}
                   <span className={`text-[10px] font-bold uppercase ${isCoreAccount ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isCoreAccount ? 'Core Mode' : 'View Only'}
                   </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${isCoreAccount ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
             </div>

             {/* Role Switcher */}
             <div className="relative">
                <div className="flex items-center gap-2 mb-1 px-1">
                   <Shield size={10} className="text-slate-400"/>
                   <span className="text-[9px] font-bold uppercase text-slate-400">Simulate Role</span>
                </div>
                <select 
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="w-full bg-white text-slate-700 text-[10px] font-bold rounded border border-slate-200 p-1.5 outline-none focus:border-black transition-all uppercase appearance-none cursor-pointer"
                >
                  {Object.values(Role).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
             </div>
          </div>

          <button 
            onClick={onSignOut}
            className="mt-3 flex items-center justify-center lg:justify-start gap-2 text-slate-400 hover:text-red-600 text-[10px] font-bold uppercase w-full p-1.5 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut size={12} />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Compact Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
               {currentView === 'project-detail' && <span className="text-slate-400 font-normal mr-1">Projects /</span>}
               {currentView === 'project-detail' ? 'Overview' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
             </h2>
             {!isCoreAccount && (
                <span className="bg-amber-100 text-amber-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">
                   Restricted View: {currentRole}
                </span>
             )}
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end cursor-pointer group" onClick={onOpenProfile}>
              <span className="text-xs font-bold text-slate-900 uppercase group-hover:underline">{currentUser ? currentUser.name : 'User'}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{currentRole}</span>
            </div>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`
                  relative p-1.5 rounded-full transition-colors
                  ${isNotificationsOpen ? 'text-black bg-slate-100' : 'text-slate-400 hover:text-black hover:bg-slate-50'}
                `}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Compact Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h4 className="font-bold text-[10px] uppercase tracking-wide text-slate-600">Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={onMarkAllRead}
                          className="text-[9px] font-bold text-slate-500 hover:text-black hover:underline transition-colors uppercase"
                        >
                          Mark all read
                        </button>
                      )}
                   </div>
                   <div className="max-h-[250px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              onNotificationClick(notif);
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-slate-50' : ''}`}
                          >
                             {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-black"></div>}
                             <div className="flex items-start gap-2">
                                <div className={`mt-0.5 ${notif.type === 'error' ? 'text-red-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-slate-800'}`}>
                                   <Info size={12} />
                                </div>
                                <div className="flex-1">
                                   <p className={`text-[11px] font-bold uppercase ${!notif.read ? 'text-black' : 'text-slate-500'}`}>{notif.title}</p>
                                   <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                   <p className="text-[9px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                                      <Clock size={8} /> 
                                      {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                   </p>
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400">
                           <Bell size={20} className="mx-auto mb-1 opacity-20" />
                           <p className="text-[10px] uppercase font-bold">No notifications</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>

            <div 
              onClick={onOpenProfile}
              className="w-7 h-7 rounded-none bg-slate-200 border border-slate-300 overflow-hidden hover:border-black transition-colors cursor-pointer"
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
                  {currentUser?.name ? currentUser.name.substring(0, 2) : 'US'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-5 scroll-smooth bg-slate-50">
          <div className="max-w-[1400px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
