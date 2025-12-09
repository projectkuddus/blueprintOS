
import React, { useState } from 'react';
import { Project, Role, TeamMember } from '../types';
import ClientProfileModal from './ClientProfileModal';
import { 
  Users, Crown, DollarSign, Briefcase, 
  User, CheckCircle2, AlertCircle, Building, 
  Search, Filter, Lock, Mail, Send, Link as LinkIcon, Clock, X, Save, Pencil, ChevronRight, Archive, RefreshCw, UserX, History
} from 'lucide-react';

interface TeamManagementProps {
  projects: Project[];
  isCoreAccount: boolean;
  teamMembers: TeamMember[];
  onAddMember: () => void;
  onSimulateJoin: (id: string) => void;
  onUpdateProject: (project: Project) => void;
  onUpdateMemberStatus: (id: string, status: 'active' | 'inactive') => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ 
  projects, 
  isCoreAccount, 
  teamMembers, 
  onAddMember, 
  onSimulateJoin,
  onUpdateProject,
  onUpdateMemberStatus
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'clients'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('All');
  
  // Client Modal State
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // 1. Staff Calculations & Processing
  const processedStaff = teamMembers.map(member => {
    // Find all projects this member is assigned to
    const memberProjects = projects.filter(p => 
      Object.values(p.team).includes(member.name)
    );
    
    return {
      ...member,
      activeProjectCount: memberProjects.length,
      projectNames: memberProjects.map(p => p.name),
    };
  }).filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const activeStaff = processedStaff.filter(m => m.status === 'active' || m.status === 'pending');
  const inactiveStaff = processedStaff.filter(m => m.status === 'inactive');

  const totalMonthlyPayroll = activeStaff.reduce((sum, m) => sum + m.monthlyCost, 0);

  // 2. Client Calculations & Filtering
  const clientMap = new Map();
  projects.forEach(p => {
    if (!clientMap.has(p.clientName)) {
      clientMap.set(p.clientName, {
        name: p.clientName,
        projects: [],
        totalInvoiced: 0,
        totalCollected: 0,
        totalBudget: 0
      });
    }
    const client = clientMap.get(p.clientName);
    client.projects.push(p);
    client.totalInvoiced += p.financials.totalInvoiced;
    client.totalCollected += p.financials.totalCollected;
    client.totalBudget += p.budget;
  });

  const clientData = Array.from(clientMap.values()).filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleClientClick = (client: any) => {
    if (!isCoreAccount) return;
    setSelectedClient(client);
  };

  const resetFilters = () => {
      setFilterRole('All');
      setSearchTerm('');
      setIsFilterOpen(false);
  };

  const handleArchiveClick = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to archive ${name}? They will lose access to all projects immediately.`)) {
          onUpdateMemberStatus(id, 'inactive');
      }
  };

  const handleRestoreClick = (id: string) => {
      onUpdateMemberStatus(id, 'active');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-black pb-3 gap-3">
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Team & Network</h2>
          <p className="text-slate-500 mt-1 text-xs font-medium">
            Manage your office staff, freelancers, and client relationships.
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-zinc-100 p-0.5">
           <button 
             onClick={() => { setActiveTab('staff'); resetFilters(); }}
             className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
           >
             <Users size={12} /> My Team
           </button>
           <button 
             onClick={() => { setActiveTab('clients'); resetFilters(); }}
             className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'clients' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-black'}`}
           >
             <Building size={12} /> Clients
           </button>
        </div>
      </div>

      {/* KPI Cards (Active Only) - Smaller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'staff' ? (
          <>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Active Staff</p>
                  <p className="text-2xl font-bold text-black">{activeStaff.length}</p>
                </div>
                <Users size={20} className="text-slate-300" />
             </div>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Payroll</p>
                  {isCoreAccount ? (
                    <p className="text-2xl font-bold text-slate-900">${totalMonthlyPayroll.toLocaleString()}</p>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                       <Lock size={12} className="text-slate-400" />
                       <span className="text-xs font-bold bg-zinc-100 text-slate-400 px-1.5 py-0.5">RESTRICTED</span>
                    </div>
                  )}
                </div>
                <DollarSign size={20} className="text-slate-300" />
             </div>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Past Employees</p>
                  <p className="text-2xl font-bold text-slate-400">{inactiveStaff.length}</p>
                </div>
                <History size={20} className="text-slate-300" />
             </div>
          </>
        ) : (
          <>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total Clients</p>
                  <p className="text-2xl font-bold text-black">{clientData.length}</p>
                </div>
                <Building size={20} className="text-slate-300" />
             </div>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total Collected</p>
                  {isCoreAccount ? (
                    <p className="text-2xl font-bold text-emerald-600">${clientData.reduce((sum, c) => sum + c.totalCollected, 0).toLocaleString()}</p>
                  ) : (
                     <div className="flex items-center gap-2 mt-1">
                       <Lock size={12} className="text-slate-400" />
                       <span className="text-xs font-bold bg-zinc-100 text-slate-400 px-1.5 py-0.5">RESTRICTED</span>
                    </div>
                  )}
                </div>
                <CheckCircle2 size={20} className="text-emerald-200" />
             </div>
             <div className="bg-white border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Total Contract Value</p>
                  {isCoreAccount ? (
                    <p className="text-2xl font-bold text-slate-900">${clientData.reduce((sum, c) => sum + c.totalBudget, 0).toLocaleString()}</p>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                       <Lock size={12} className="text-slate-400" />
                       <span className="text-xs font-bold bg-zinc-100 text-slate-400 px-1.5 py-0.5">RESTRICTED</span>
                    </div>
                  )}
                </div>
                <Briefcase size={20} className="text-slate-300" />
             </div>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-zinc-50 p-3 border border-slate-200 relative z-10">
         <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-300 text-xs focus:border-black outline-none w-56 bg-white"
            />
         </div>
         <div className="flex gap-2 relative">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] font-bold uppercase transition-colors ${isFilterOpen ? 'bg-black text-white border-black' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
            >
               <Filter size={12} /> Filter
            </button>

            {isFilterOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-black shadow-xl z-20 p-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <span className="text-[9px] font-bold uppercase text-slate-500">Filter {activeTab}</span>
                            <button onClick={resetFilters} className="text-[9px] text-emerald-600 font-bold uppercase hover:underline">Reset</button>
                        </div>
                        
                        <div className="space-y-3">
                            {activeTab === 'staff' && (
                                <div>
                                    <label className="text-[9px] font-bold uppercase block mb-1 text-slate-600">Role</label>
                                    <select 
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="w-full border border-slate-300 p-1.5 text-[10px] focus:border-black outline-none bg-zinc-50"
                                    >
                                        <option value="All">All Roles</option>
                                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full mt-4 bg-black text-white py-1.5 text-[10px] font-bold uppercase hover:bg-zinc-800"
                        >
                            Apply Filter
                        </button>
                    </div>
                </>
            )}

            {isCoreAccount && activeTab === 'staff' && (
              <button 
                onClick={onAddMember}
                className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase hover:bg-zinc-800 flex items-center gap-2"
              >
                 <Mail size={12} /> Invite New Member
              </button>
            )}
         </div>
      </div>

      {/* ACTIVE STAFF TABLE */}
      {activeTab === 'staff' && activeStaff.length > 0 && (
        <div className="border border-slate-200 bg-white overflow-hidden shadow-sm mb-8">
            <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <h3 className="text-[10px] font-bold uppercase text-black">Active Workforce</h3>
            </div>
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-zinc-50 text-slate-500 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="p-2 pl-4 w-1/4">Team Member</th>
                <th className="p-2 w-1/6">Role</th>
                <th className="p-2 w-1/4">Assigned Projects</th>
                <th className="p-2 w-1/6">Status</th>
                <th className="p-2 w-1/6 text-right">Cost</th>
                <th className="p-2 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
                {activeStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="p-2 pl-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] text-slate-600 ${member.status === 'pending' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-zinc-200'}`}>
                                {member.name ? member.name.charAt(0) : '?'}
                            </div>
                            <div>
                                <p className={`font-bold ${member.status === 'pending' ? 'text-slate-500 italic' : 'text-black'}`}>{member.name || 'Invited User'}</p>
                                <p className="text-[9px] text-slate-500">{member.email}</p>
                            </div>
                        </div>
                        </td>
                        <td className="p-2">
                        <span className="text-[10px] font-medium bg-zinc-100 px-1.5 py-0.5 rounded-sm text-slate-600 uppercase">
                            {member.role}
                        </span>
                        </td>
                        <td className="p-2">
                        {member.activeProjectCount > 0 ? (
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-black flex items-center gap-1 text-[10px]">
                                    <Briefcase size={10} /> {member.activeProjectCount} Active Projects
                                </span>
                                <span className="text-[9px] text-slate-400 truncate max-w-[150px]">
                                    {member.projectNames.join(', ')}
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-[10px] italic">No active assignments</span>
                        )}
                        </td>
                        <td className="p-2">
                        {member.status === 'active' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                        )}
                        {member.status === 'pending' && (
                            <div className="flex flex-col gap-1 items-start">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                                    <Clock size={10} /> Pending
                                </span>
                                {isCoreAccount && (
                                <div className="flex gap-2">
                                    <button className="text-[9px] text-slate-400 hover:text-black hover:underline">Resend</button>
                                    <button 
                                        onClick={() => onSimulateJoin(member.id)}
                                        className="text-[9px] text-emerald-600 hover:text-emerald-800 hover:underline font-bold"
                                    >
                                        [Join]
                                    </button>
                                </div>
                                )}
                            </div>
                        )}
                        </td>
                        <td className="p-2 text-right">
                        {isCoreAccount ? (
                            <span className="font-mono font-bold text-slate-700 text-[10px]">
                                ${member.monthlyCost.toLocaleString()}
                            </span>
                        ) : (
                            <span className="text-slate-300 font-bold text-[10px] flex justify-end items-center gap-1">
                                <Lock size={10} />
                            </span>
                        )}
                        </td>
                        <td className="p-2">
                            {isCoreAccount && (
                                <button 
                                    onClick={() => handleArchiveClick(member.id, member.name)}
                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                    title="Archive / Remove Access"
                                >
                                    <Archive size={12} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {/* INACTIVE / PAST STAFF TABLE */}
      {activeTab === 'staff' && inactiveStaff.length > 0 && (
        <div className="border border-slate-200 bg-zinc-50 overflow-hidden shadow-sm opacity-80">
            <div className="p-2 bg-zinc-100 border-b border-slate-200 flex items-center gap-2">
                <History size={12} className="text-slate-400" />
                <h3 className="text-[10px] font-bold uppercase text-slate-500">Past Employees / Alumni</h3>
            </div>
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-zinc-100 text-slate-400 text-[9px] uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="p-2 pl-4 w-1/4">Name</th>
                <th className="p-2 w-1/6">Role</th>
                <th className="p-2 w-1/4">Project History</th>
                <th className="p-2 w-1/6">Status</th>
                <th className="p-2 w-1/6 text-right">Last Salary</th>
                <th className="p-2 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
                {inactiveStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-100 transition-colors">
                        <td className="p-2 pl-4 text-slate-500">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-400 grayscale">
                                    {member.name ? member.name.charAt(0) : '?'}
                                </div>
                                <div>
                                    <p className="font-bold line-through decoration-slate-300">{member.name}</p>
                                    <p className="text-[9px] text-slate-400">{member.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-2 text-slate-400">
                            <span className="text-[10px] font-medium border border-slate-200 px-1.5 py-0.5 rounded-sm uppercase">
                                {member.role}
                            </span>
                        </td>
                        <td className="p-2 text-slate-400">
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-500 text-[10px] flex items-center gap-2">
                                    Associated with {member.activeProjectCount} Projects
                                </span>
                                <span className="text-[9px] text-slate-400 truncate max-w-[150px]">
                                    {member.projectNames.join(', ')}
                                </span>
                            </div>
                        </td>
                        <td className="p-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                <UserX size={10} /> Left Studio
                            </span>
                        </td>
                        <td className="p-2 text-right text-slate-400 line-through">
                            {isCoreAccount ? `$${member.monthlyCost.toLocaleString()}` : '***'}
                        </td>
                        <td className="p-2">
                            {isCoreAccount && (
                                <button 
                                    onClick={() => handleRestoreClick(member.id)}
                                    className="p-1 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                                    title="Restore Access"
                                >
                                    <RefreshCw size={12} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}

      {/* CLIENTS TABLE */}
      {activeTab === 'clients' && (
        <div className="border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-black text-white text-[9px] uppercase font-bold tracking-wider">
                <th className="p-3 w-1/4">Client Name</th>
                <th className="p-3 w-1/3">Projects</th>
                <th className="p-3 w-1/6 text-right">Total Invoiced</th>
                <th className="p-3 w-1/6 text-right">Paid</th>
                <th className="p-3 w-1/12 text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
                {clientData.map((client, idx) => (
                    <tr 
                    key={idx} 
                    className={`hover:bg-zinc-50 transition-colors ${isCoreAccount ? 'cursor-pointer group' : ''}`}
                    onClick={() => handleClientClick(client)}
                    title={isCoreAccount ? "Click to view full client profile" : ""}
                    >
                    <td className="p-3 font-bold text-black">
                        <div className="flex items-center gap-2">
                            <Building size={14} className="text-slate-400" />
                            {client.name}
                            {isCoreAccount && <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />}
                        </div>
                    </td>
                    <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                            {client.projects.map((p: Project) => (
                                <span key={p.id} className="text-[9px] font-bold uppercase border border-slate-200 px-1.5 py-0.5 bg-white">
                                {p.name}
                                </span>
                            ))}
                        </div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                        {isCoreAccount ? `$${client.totalInvoiced.toLocaleString()}` : '***'}
                    </td>
                    <td className="p-3 text-right">
                        {isCoreAccount ? (
                            <span className="font-mono font-bold text-emerald-600">
                            ${client.totalCollected.toLocaleString()}
                            </span>
                        ) : (
                            '***'
                        )}
                    </td>
                    <td className="p-3 text-center">
                        {client.totalCollected >= client.totalInvoiced && client.totalInvoiced > 0 ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-bold uppercase rounded-sm">Paid</span>
                        ) : (
                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 font-bold uppercase rounded-sm">Pending</span>
                        )}
                    </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
        
      {/* Empty State */}
      {((activeTab === 'staff' && activeStaff.length === 0 && inactiveStaff.length === 0) || (activeTab === 'clients' && clientData.length === 0)) && (
           <div className="p-12 text-center text-slate-400">
              <p>No results found matching your search.</p>
           </div>
      )}

      {/* Client Profile Modal */}
      {selectedClient && (
          <ClientProfileModal 
             isOpen={!!selectedClient}
             onClose={() => setSelectedClient(null)}
             client={selectedClient}
             onUpdateProject={onUpdateProject}
             allProjects={projects}
          />
      )}
    </div>
  );
};

export default TeamManagement;
