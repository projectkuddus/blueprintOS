
import React, { useState, useEffect } from 'react';
import { Project, Transaction } from '../types';
import { X, User, Building, Phone, Mail, Plus, Trash2, Calendar, FileText, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Save } from 'lucide-react';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: { name: string, projects: Project[], totalInvoiced: number, totalCollected: number, totalBudget: number };
  onUpdateProject: (project: Project) => void;
  allProjects: Project[]; // To allow adding other projects to this client
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ isOpen, onClose, client, onUpdateProject, allProjects }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'financials'>('overview');
  const [clientData, setClientData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // Transaction State
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'invoice',
    amount: 0,
    description: '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedProjectForTx, setSelectedProjectForTx] = useState<string>('');

  useEffect(() => {
    if (isOpen && client) {
      // Aggregate info from the first project (as client data isn't centralized yet in this mock DB)
      const firstProj = client.projects[0];
      setClientData({
        name: client.name,
        contactPerson: firstProj?.clientPointOfContact || '',
        email: firstProj?.clientEmail || '',
        phone: '', // Not in mock
        address: '' // Not in mock
      });
      if (client.projects.length > 0) {
          setSelectedProjectForTx(client.projects[0].id);
      }
    }
  }, [isOpen, client]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    // Update client name and POC across all their projects
    client.projects.forEach(p => {
        const updatedProject = {
            ...p,
            clientName: clientData.name,
            clientPointOfContact: clientData.contactPerson,
            clientEmail: clientData.email
        };
        onUpdateProject(updatedProject);
    });
    alert('Client profile updated across all associated projects.');
  };

  const handleUnlinkProject = (project: Project) => {
      if (window.confirm(`Remove ${project.name} from this client?`)) {
          const updatedProject = { ...project, clientName: 'Unassigned Client' };
          onUpdateProject(updatedProject);
      }
  };

  const handleAddTransaction = () => {
      if (!newTransaction.amount || !newTransaction.description || !selectedProjectForTx) return;

      const project = client.projects.find(p => p.id === selectedProjectForTx);
      if (!project) return;

      const transaction: Transaction = {
          id: `tx-${Date.now()}`,
          date: newTransaction.date || new Date().toISOString(),
          amount: Number(newTransaction.amount),
          description: newTransaction.description || 'Transaction',
          type: newTransaction.type,
          status: newTransaction.status,
          reference: newTransaction.reference
      };

      const currentTx = project.financials.transactions || [];
      const updatedFinancials = {
          ...project.financials,
          transactions: [...currentTx, transaction],
          // Auto-update totals
          totalInvoiced: transaction.type === 'invoice' ? project.financials.totalInvoiced + transaction.amount : project.financials.totalInvoiced,
          totalCollected: (transaction.type === 'payment' && transaction.status === 'paid') ? project.financials.totalCollected + transaction.amount : project.financials.totalCollected
      };
      
      // Recalculate pending
      updatedFinancials.pendingBills = Math.max(0, updatedFinancials.totalInvoiced - updatedFinancials.totalCollected);

      onUpdateProject({ ...project, financials: updatedFinancials });
      setIsAddingTransaction(false);
      setNewTransaction({ type: 'invoice', amount: 0, description: '', status: 'pending', date: new Date().toISOString().split('T')[0] });
  };

  // Consolidate all transactions from all client projects
  const allTransactions = client.projects.flatMap(p => 
      (p.financials.transactions || []).map(t => ({ ...t, projectName: p.name }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-4xl w-full h-[85vh] animate-in fade-in zoom-in duration-200 border-2 border-black shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 bg-zinc-50">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-bold text-2xl uppercase">
                {clientData.name.substring(0, 2)}
             </div>
             <div>
                <h3 className="font-black text-black uppercase text-2xl">{clientData.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                   <User size={12} /> {clientData.contactPerson || 'No POC Assigned'}
                   <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                   {client.projects.length} Active Projects
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button onClick={() => setActiveTab('overview')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'overview' ? 'bg-white border-b-2 border-black' : 'bg-zinc-50 text-slate-500 hover:text-black'}`}>Overview</button>
            <button onClick={() => setActiveTab('projects')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'projects' ? 'bg-white border-b-2 border-black' : 'bg-zinc-50 text-slate-500 hover:text-black'}`}>Projects</button>
            <button onClick={() => setActiveTab('financials')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'financials' ? 'bg-white border-b-2 border-black' : 'bg-zinc-50 text-slate-500 hover:text-black'}`}>Detailed Financials</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Client / Company Name</label>
                            <input 
                                className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 text-sm font-bold focus:border-black outline-none placeholder:text-zinc-500"
                                value={clientData.name}
                                onChange={e => setClientData({...clientData, name: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                <User size={10} /> Responsible Person (Overview)
                            </label>
                            <input 
                                className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 text-sm focus:border-black outline-none placeholder:text-zinc-500"
                                placeholder="e.g. Mr. Rafiq (Director)"
                                value={clientData.contactPerson}
                                onChange={e => setClientData({...clientData, contactPerson: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                <Mail size={10} /> Email Address
                            </label>
                            <input 
                                className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 text-sm focus:border-black outline-none placeholder:text-zinc-500"
                                value={clientData.email}
                                onChange={e => setClientData({...clientData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                                <Phone size={10} /> Phone Number
                            </label>
                            <input 
                                className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 text-sm focus:border-black outline-none placeholder:text-zinc-500"
                                placeholder="+880..."
                                value={clientData.phone}
                                onChange={e => setClientData({...clientData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                            onClick={handleSaveProfile}
                            className="bg-black text-white px-6 py-2 text-xs font-bold uppercase hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <Save size={14} /> Update Profile
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: PROJECTS */}
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {client.projects.map(project => (
                            <div key={project.id} className="border border-slate-200 p-4 hover:border-black transition-colors group relative bg-zinc-50/30">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm uppercase">{project.name}</h4>
                                    <span className="text-[10px] font-bold uppercase bg-zinc-200 px-2 py-0.5">{project.type}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1"><Building size={12} /> {project.location}</p>
                                
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 border-t border-slate-100 pt-2">
                                    <span>Budget: ${(project.budget/1000).toFixed(0)}k</span>
                                    <button 
                                        onClick={() => handleUnlinkProject(project)}
                                        className="text-red-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} /> Unlink
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 min-h-[150px] cursor-not-allowed bg-zinc-50">
                            <Plus size={24} className="mb-2" />
                            <p className="text-xs font-bold uppercase">Link Another Project</p>
                            <p className="text-[10px] mt-1">(Manage via Project Settings)</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: FINANCIALS */}
            {activeTab === 'financials' && (
                <div className="space-y-8">
                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-black text-white p-6 relative overflow-hidden">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase relative z-10">Total Invoiced</p>
                            <p className="text-3xl font-bold relative z-10 text-white">${client.totalInvoiced.toLocaleString()}</p>
                            <FileText size={64} className="absolute -right-4 -bottom-4 text-zinc-800 opacity-50" />
                        </div>
                        <div className="bg-emerald-600 text-white p-6 relative overflow-hidden">
                            <p className="text-[10px] font-bold text-emerald-200 uppercase relative z-10">Total Collected</p>
                            <p className="text-3xl font-bold relative z-10 text-white">${client.totalCollected.toLocaleString()}</p>
                            <CheckCircle2 size={64} className="absolute -right-4 -bottom-4 text-emerald-800 opacity-50" />
                        </div>
                        <div className="bg-white border border-slate-200 p-6 relative overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase relative z-10">Outstanding Balance</p>
                            <p className="text-3xl font-bold text-red-500 relative z-10">${Math.max(0, client.totalInvoiced - client.totalCollected).toLocaleString()}</p>
                            <AlertCircle size={64} className="absolute -right-4 -bottom-4 text-slate-100" />
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <div className="flex justify-between text-xs font-bold uppercase mb-2 text-slate-500">
                            <span>Payment Progress</span>
                            <span>{Math.round((client.totalCollected / (client.totalInvoiced || 1)) * 100)}%</span>
                        </div>
                        <div className="h-4 bg-zinc-100 border border-slate-200 w-full relative">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-700"
                                style={{ width: `${Math.min((client.totalCollected / (client.totalInvoiced || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Transaction Ledger */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-black uppercase text-sm flex items-center gap-2">
                                <TrendingUp size={16} /> Transaction History
                            </h4>
                            <button 
                                onClick={() => setIsAddingTransaction(true)}
                                className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Entry
                            </button>
                        </div>

                        {isAddingTransaction && (
                            <div className="bg-zinc-50 border border-slate-300 p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end animate-in slide-in-from-top-2">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[8px] font-bold uppercase mb-1 block">Type</label>
                                    <select 
                                        className="w-full p-2 border text-xs"
                                        value={newTransaction.type}
                                        onChange={e => setNewTransaction({...newTransaction, type: e.target.value as 'invoice' | 'payment'})}
                                    >
                                        <option value="invoice">Invoice</option>
                                        <option value="payment">Payment</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[8px] font-bold uppercase mb-1 block">Project</label>
                                    <select 
                                        className="w-full p-2 border text-xs truncate"
                                        value={selectedProjectForTx}
                                        onChange={e => setSelectedProjectForTx(e.target.value)}
                                    >
                                        {client.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[8px] font-bold uppercase mb-1 block">Description</label>
                                    <input 
                                        className="w-full p-2 border text-xs"
                                        placeholder="e.g. Milestone 1"
                                        value={newTransaction.description}
                                        onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[8px] font-bold uppercase mb-1 block">Amount</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2 border text-xs"
                                        placeholder="0.00"
                                        value={newTransaction.amount || ''}
                                        onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="col-span-1 flex gap-2">
                                    <button onClick={handleAddTransaction} className="flex-1 bg-emerald-600 text-white p-2 text-xs font-bold uppercase">Save</button>
                                    <button onClick={() => setIsAddingTransaction(false)} className="bg-slate-200 text-slate-600 p-2 text-xs font-bold uppercase"><X size={14}/></button>
                                </div>
                            </div>
                        )}

                        <div className="border border-slate-200">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-100 font-bold uppercase text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Project</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allTransactions.length > 0 ? allTransactions.map((tx, i) => (
                                        <tr key={i} className="hover:bg-zinc-50">
                                            <td className="p-3 font-mono text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold truncate max-w-[120px]">{tx.projectName}</td>
                                            <td className="p-3 text-slate-600">
                                                {tx.type === 'invoice' ? <span className="bg-blue-100 text-blue-700 px-1 mr-1 text-[9px] uppercase font-bold">INV</span> : 
                                                 <span className="bg-emerald-100 text-emerald-700 px-1 mr-1 text-[9px] uppercase font-bold">PAY</span>}
                                                {tx.description}
                                            </td>
                                            <td className={`p-3 text-right font-mono font-bold ${tx.type === 'payment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.type === 'payment' ? '+' : ''}${tx.amount.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                {tx.status === 'paid' && <span className="text-[9px] font-bold uppercase text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-sm">Paid</span>}
                                                {tx.status === 'pending' && <span className="text-[9px] font-bold uppercase text-amber-600 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded-sm">Pending</span>}
                                                {tx.status === 'overdue' && <span className="text-[9px] font-bold uppercase text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded-sm">Overdue</span>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No transaction history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;
