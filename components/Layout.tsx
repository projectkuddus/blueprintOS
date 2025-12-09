

import React, { useState, useRef, useEffect } from 'react';
import { Role, TeamMember, AppNotification } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Crown,
  Check,
  X,
  Clock,
  Info
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: Role;
  currentUser?: TeamMember; // Added current user prop
  isCoreAccount: boolean;
  onRoleChange: (role: Role) => void;
  onToggleCoreAccount: () => void;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  onOpenProfile?: () => void; // Added profile open handler
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
  onRoleChange, 
  onToggleCoreAccount, 
  onNavigate, 
  onSignOut,
  onOpenProfile,
  currentView,
  notifications,
  onMarkAllRead,
  onNotificationClick
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'All Projects', icon: Briefcase },
    { id: 'team', label: 'Team & Network', icon: Users },
    { id: 'settings', label: 'Studio Profile', icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
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

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-white selection:bg-black selection:text-white font-sans">
      {/* Global Background Grid - Visible through Glass UI */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Dark Glass Sidebar */}
      <aside className="w-64 bg-zinc-950/90 backdrop-blur-xl flex flex-col flex-shrink-0 border-r border-white/10 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)] text-white">
        <div className="p-6 border-b border-white/10">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer group"
            title="Go to Dashboard"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 group-hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-white text-black rounded-sm flex items-center justify-center border border-transparent">B</div>
              Blueprint<span className="font-light text-zinc-500">OS</span>
            </h1>
          </div>
          {isCoreAccount && (
            <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-500 font-bold select-none pl-1">
              <Crown size={12} /> Core Account
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group ${
                currentView === item.id 
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'text-zinc-500 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? "text-black" : "text-zinc-600 group-hover:text-white"} />
              <span className="font-bold text-xs uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Core Account Simulator - Dark Mode */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="mb-4">
             <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors font-bold uppercase">
                <input 
                  type="checkbox" 
                  checked={isCoreAccount} 
                  onChange={onToggleCoreAccount}
                  className="rounded border-zinc-600 bg-black/50 accent-white"
                />
                Simulate Core Account
             </label>
          </div>

          <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2 font-bold">
            View As
          </label>
          <div className="relative">
            <select 
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="w-full bg-black/50 text-white text-xs font-bold rounded-md border border-zinc-800 p-2 outline-none focus:border-white transition-colors uppercase appearance-none"
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <div className="absolute right-2 top-2.5 pointer-events-none text-zinc-500">
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onSignOut}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-xs font-bold uppercase w-full px-2 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Header - Transparent/Glass */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-30">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            {currentView === 'project-detail' ? 'Project Details' : currentView.replace('-', ' ')}
          </h2>
          
          <div className="flex items-center gap-6">
            <div 
              onClick={onOpenProfile}
              className="flex flex-col items-end cursor-pointer group"
              title="Edit Profile"
            >
              <span className="text-sm font-bold text-black group-hover:underline decoration-1 underline-offset-4 transition-all">
                {currentUser ? currentUser.name : 'User'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentRole}</span>
            </div>
            
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 transition-colors ${isNotificationsOpen ? 'text-black bg-zinc-100' : 'text-slate-400 hover:text-black'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border-2 border-black shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 origin-top-right">
                   <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-zinc-50">
                      <h4 className="font-bold text-xs uppercase tracking-wide">Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={onMarkAllRead}
                          className="text-[10px] font-bold text-emerald-600 hover:underline uppercase"
                        >
                          Mark all read
                        </button>
                      )}
                   </div>
                   <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              onNotificationClick(notif);
                              setIsNotificationsOpen(false);
                            }}
                            className={`p-4 border-b border-slate-100 hover:bg-zinc-50 transition-colors cursor-pointer group ${!notif.read ? 'bg-white border-l-4 border-l-emerald-500' : 'bg-slate-50/30'}`}
                          >
                             <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${notif.type === 'error' ? 'text-red-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-slate-400'}`}>
                                   <Info size={14} />
                                </div>
                                <div className="flex-1">
                                   <p className={`text-xs font-bold group-hover:underline ${!notif.read ? 'text-black' : 'text-slate-500'}`}>{notif.title}</p>
                                   <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                   <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-wider flex items-center gap-1">
                                      <Clock size={8} /> 
                                      {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                   </p>
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                           <Bell size={24} className="mx-auto mb-2 opacity-20" />
                           <p className="text-xs uppercase font-bold">No notifications</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>

            <div 
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold border border-slate-100 shadow-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-black hover:ring-offset-2 transition-all"
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser?.name ? currentUser.name.substring(0, 2) : 'US'
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;