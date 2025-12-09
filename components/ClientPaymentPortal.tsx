
import React, { useState } from 'react';
import { Project, Transaction, Stage } from '../types';
import { 
  CreditCard, CheckCircle2, AlertCircle, Clock, 
  ChevronDown, ChevronUp, FileText, Download, 
  Plus, DollarSign, Calendar, Wallet, Building, X, Loader2
} from 'lucide-react';

interface ClientPaymentPortalProps {
  project: Project;
  isCoreAccount: boolean;
  onUpdateProject: (project: Project) => void;
}

const ClientPaymentPortal: React.FC<ClientPaymentPortalProps> = ({ project, isCoreAccount, onUpdateProject }) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(project.currentStageId);
  
  // Invoice Management (Core)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    stageId: project.currentStageId,
    amount: '',
    description: '',
    dueDate: ''
  });

  // Payment Management (Client)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'confirm' | 'processing' | 'success'>('method');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'bkash'>('card');

  const totalContract = project.budget;
  const totalPaid = project.financials.totalCollected;
  const totalInvoiced = project.financials.totalInvoiced;
  const pendingPayment = Math.max(0, totalInvoiced - totalPaid);
  const progress = Math.min((totalPaid / totalContract) * 100, 100);

  const transactions = project.financials.transactions || [];

  // --- Invoice Logic (Studio Side) ---
  const handleCreateInvoice = () => {
    if (!invoiceForm.amount || !invoiceForm.description) return;

    const newTx: Transaction = {
      id: `inv-${Date.now()}`,
      date: new Date().toISOString(),
      description: invoiceForm.description,
      amount: Number(invoiceForm.amount),
      type: 'invoice',
      status: 'pending',
      stageId: invoiceForm.stageId
    };

    const updatedFinancials = {
      ...project.financials,
      totalInvoiced: project.financials.totalInvoiced + newTx.amount,
      pendingBills: project.financials.pendingBills + newTx.amount,
      transactions: [...transactions, newTx]
    };

    onUpdateProject({ ...project, financials: updatedFinancials });
    setIsInvoiceModalOpen(false);
    setInvoiceForm({ stageId: project.currentStageId, amount: '', description: '', dueDate: '' });
  };

  const handleDownloadInvoice = (txId: string) => {
    alert(`Downloading Invoice #${txId}... (Simulation)`);
  };

  // --- Payment Logic (Client Side) ---
  const initiatePayment = (invoice?: Transaction) => {
      setSelectedInvoice(invoice || null);
      setPaymentStep('method');
      setIsPayModalOpen(true);
  };

  const processPayment = () => {
      setPaymentStep('processing');
      
      setTimeout(() => {
          // 1. Create Payment Transaction
          const amountToPay = selectedInvoice ? selectedInvoice.amount : pendingPayment;
          const paymentTx: Transaction = {
              id: `pay-${Date.now()}`,
              date: new Date().toISOString(),
              description: `Payment for ${selectedInvoice ? selectedInvoice.description : 'Account Balance'}`,
              amount: amountToPay,
              type: 'payment',
              status: 'paid',
              reference: `TXN-${Math.floor(Math.random() * 10000)}`,
              stageId: selectedInvoice?.stageId || project.currentStageId
          };

          // 2. Update Invoice Status (if specific invoice paid)
          const updatedTransactions: Transaction[] = [...transactions, paymentTx].map(t => {
              if (selectedInvoice && t.id === selectedInvoice.id) {
                  return { ...t, status: 'paid' };
              }
              return t;
          });

          // 3. Update Project Financials
          const updatedFinancials = {
              ...project.financials,
              totalCollected: project.financials.totalCollected + amountToPay,
              pendingBills: Math.max(0, project.financials.pendingBills - amountToPay),
              transactions: updatedTransactions
          };

          onUpdateProject({ ...project, financials: updatedFinancials });
          setPaymentStep('success');
      }, 2000);
  };

  const closePayModal = () => {
      setIsPayModalOpen(false);
      setPaymentStep('method');
      setSelectedInvoice(null);
  };

  const getStageFinancials = (stageId: string) => {
    const stageTxs = transactions.filter(t => t.stageId === stageId);
    const invoiced = stageTxs.filter(t => t.type === 'invoice').reduce((sum, t) => sum + t.amount, 0);
    const paid = stageTxs.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
    const pending = Math.max(0, invoiced - paid);
    
    // Status Logic
    let status: 'paid' | 'partial' | 'unpaid' | 'none' = 'none';
    if (invoiced > 0) {
      if (paid >= invoiced) status = 'paid';
      else if (paid > 0) status = 'partial';
      else status = 'unpaid';
    }

    return { invoiced, paid, pending, status, transactions: stageTxs };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* 1. Header & Summary Cards */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">Financial Overview</h2>
            <p className="text-sm text-slate-500 font-medium">Monitor project billing milestones and payment history.</p>
          </div>
          {isCoreAccount && (
            <button 
              onClick={() => setIsInvoiceModalOpen(true)}
              className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-zinc-800 flex items-center gap-2 shadow-lg"
            >
              <Plus size={14} /> Issue New Invoice
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 text-white p-6 border-l-4 border-emerald-500 shadow-md">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Contract Value</p>
                   <p className="text-3xl font-bold mt-1">${totalContract.toLocaleString()}</p>
                </div>
                <FileText className="text-zinc-700" size={24} />
             </div>
             <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-[10px] text-zinc-400 mt-2 text-right">{progress.toFixed(0)}% Funded</p>
          </div>

          <div className="bg-white p-6 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                   <p className="text-3xl font-bold mt-1 text-emerald-600">${totalPaid.toLocaleString()}</p>
                </div>
                <CheckCircle2 className="text-emerald-200" size={24} />
             </div>
             <p className="text-xs text-slate-500">Across {transactions.filter(t => t.type === 'payment').length} transactions</p>
          </div>

          <div className="bg-white p-6 border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Due</p>
                   <p className={`text-3xl font-bold mt-1 ${pendingPayment > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      ${pendingPayment.toLocaleString()}
                   </p>
                </div>
                {pendingPayment > 0 ? (
                   <AlertCircle className="text-amber-500 animate-pulse" size={24} />
                ) : (
                   <CheckCircle2 className="text-slate-200" size={24} />
                )}
             </div>
             {pendingPayment > 0 && !isCoreAccount && (
                <button 
                    onClick={() => initiatePayment()}
                    className="text-[10px] font-bold uppercase bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
                >
                   <CreditCard size={12} /> Pay Outstanding
                </button>
             )}
          </div>
        </div>
      </div>

      {/* 2. Phase-by-Phase Breakdown */}
      <div className="bg-white border border-slate-200 shadow-sm">
         <div className="p-4 border-b border-slate-200 bg-zinc-50">
            <h3 className="text-sm font-bold uppercase text-black">Payment Schedule by Phase</h3>
         </div>
         <div className="divide-y divide-slate-100">
            {project.stages.map((stage, index) => {
               const { invoiced, paid, pending, status, transactions: stageTxs } = getStageFinancials(stage.id);
               const isExpanded = expandedStage === stage.id;
               
               return (
                  <div key={stage.id} className="group">
                     <div 
                        onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                        className={`
                           flex items-center justify-between p-4 cursor-pointer transition-colors
                           ${isExpanded ? 'bg-zinc-50' : 'hover:bg-zinc-50'}
                        `}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
                              ${status === 'paid' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                status === 'partial' ? 'bg-amber-100 border-amber-400 text-amber-600' :
                                status === 'unpaid' ? 'bg-white border-red-200 text-red-400' : 
                                'bg-zinc-100 border-zinc-200 text-zinc-400'}
                           `}>
                              {(index + 1).toString().padStart(2, '0')}
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-black uppercase">{stage.name}</h4>
                              <p className="text-[10px] text-slate-500">{stage.status}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-8">
                           <div className="hidden md:block text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Invoiced</p>
                              <p className="text-sm font-bold text-slate-700">
                                 {invoiced > 0 ? `$${invoiced.toLocaleString()}` : '-'}
                              </p>
                           </div>
                           <div className="hidden md:block text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                              <p className={`text-sm font-bold ${pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                 {pending > 0 ? `$${pending.toLocaleString()}` : (invoiced > 0 ? 'Paid' : '-')}
                              </p>
                           </div>
                           {isExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                        </div>
                     </div>

                     {isExpanded && (
                        <div className="p-4 bg-zinc-50 border-t border-slate-100 pl-16">
                           {stageTxs.length > 0 ? (
                              <table className="w-full text-left text-xs">
                                 <thead>
                                    <tr className="text-slate-400 font-bold uppercase border-b border-slate-200">
                                       <th className="pb-2 w-1/3">Description / Reference</th>
                                       <th className="pb-2 w-1/4">Date</th>
                                       <th className="pb-2 w-1/4 text-right">Amount</th>
                                       <th className="pb-2 w-1/6 text-center">Action</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-200">
                                    {stageTxs.map(tx => (
                                       <tr key={tx.id} className="hover:bg-zinc-100">
                                          <td className="py-3">
                                             <div className="flex items-center gap-2">
                                                {tx.type === 'invoice' ? <FileText size={14} className="text-slate-400" /> : <CreditCard size={14} className="text-emerald-500" />}
                                                <span className="font-bold text-slate-700">{tx.description}</span>
                                             </div>
                                             {tx.reference && <span className="text-[9px] text-slate-400 ml-6 block">Ref: {tx.reference}</span>}
                                          </td>
                                          <td className="py-3 font-mono text-slate-500">
                                             {new Date(tx.date).toLocaleDateString()}
                                          </td>
                                          <td className={`py-3 text-right font-bold ${tx.type === 'invoice' ? 'text-slate-900' : 'text-emerald-600'}`}>
                                             {tx.type === 'payment' ? '-' : ''}${tx.amount.toLocaleString()}
                                          </td>
                                          <td className="py-3 text-center">
                                             {tx.type === 'invoice' && tx.status === 'pending' && !isCoreAccount ? (
                                                 <button 
                                                    onClick={() => initiatePayment(tx)}
                                                    className="bg-black text-white px-3 py-1 text-[9px] font-bold uppercase hover:bg-emerald-600 transition-colors rounded-sm"
                                                 >
                                                    Pay Now
                                                 </button>
                                             ) : tx.type === 'invoice' && (
                                                <button 
                                                   onClick={() => handleDownloadInvoice(tx.id)}
                                                   className="text-[9px] font-bold uppercase text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                                                >
                                                   <Download size={10} /> PDF
                                                </button>
                                             )}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           ) : (
                              <p className="text-xs text-slate-400 italic">No financial activity recorded for this phase yet.</p>
                           )}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>

      {/* Invoice Modal (Core) */}
      {isInvoiceModalOpen && (
         <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full animate-in fade-in zoom-in duration-200 border-2 border-black p-6 shadow-2xl">
               <h3 className="font-bold text-black uppercase text-lg mb-6 flex items-center gap-2">
                  <FileText size={20} /> Issue New Invoice
               </h3>
               
               <div className="space-y-4">
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Project Phase</label>
                     <select 
                        className="w-full border border-slate-300 p-2 text-sm bg-white focus:border-black outline-none"
                        value={invoiceForm.stageId}
                        onChange={e => setInvoiceForm({...invoiceForm, stageId: e.target.value})}
                     >
                        {project.stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Description</label>
                     <input 
                        className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none"
                        placeholder="e.g. Design Fee - Milestone 2"
                        value={invoiceForm.description}
                        onChange={e => setInvoiceForm({...invoiceForm, description: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Amount</label>
                     <div className="relative">
                        <DollarSign size={14} className="absolute left-2 top-2.5 text-slate-400" />
                        <input 
                           type="number"
                           className="w-full border border-slate-300 pl-8 p-2 text-sm focus:border-black outline-none"
                           placeholder="0.00"
                           value={invoiceForm.amount}
                           onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Due Date</label>
                     <div className="relative">
                        <Calendar size={14} className="absolute left-2 top-2.5 text-slate-400" />
                        <input 
                           type="date"
                           className="w-full border border-slate-300 pl-8 p-2 text-sm focus:border-black outline-none"
                           value={invoiceForm.dueDate}
                           onChange={e => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button 
                        onClick={() => setIsInvoiceModalOpen(false)}
                        className="flex-1 py-3 border border-slate-300 text-slate-600 font-bold uppercase text-xs hover:bg-zinc-50"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleCreateInvoice}
                        disabled={!invoiceForm.amount || !invoiceForm.description}
                        className="flex-1 py-3 bg-black text-white font-bold uppercase text-xs hover:bg-zinc-800 disabled:opacity-50"
                     >
                        Issue Invoice
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Payment Modal (Client) */}
      {isPayModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white max-w-md w-full animate-in fade-in zoom-in duration-200 border-2 border-black p-6 shadow-2xl relative">
                  <button onClick={closePayModal} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20}/></button>
                  
                  {/* Step 1: Method Selection */}
                  {paymentStep === 'method' && (
                      <div className="space-y-6">
                          <div className="text-center">
                              <h3 className="font-black text-2xl uppercase mb-2">Secure Payment</h3>
                              <p className="text-xs text-slate-500">Pay for {selectedInvoice ? selectedInvoice.description : 'outstanding balance'}</p>
                              <div className="mt-4 text-4xl font-black text-emerald-600">
                                  ${(selectedInvoice ? selectedInvoice.amount : pendingPayment).toLocaleString()}
                              </div>
                          </div>

                          <div className="space-y-3">
                              <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`w-full p-4 border-2 flex items-center gap-4 hover:border-black transition-all ${paymentMethod === 'card' ? 'border-black bg-zinc-50' : 'border-slate-200'}`}
                              >
                                  <CreditCard size={24} className="text-slate-800" />
                                  <div className="text-left">
                                      <p className="font-bold text-sm uppercase">Credit / Debit Card</p>
                                      <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex</p>
                                  </div>
                              </button>
                              <button 
                                onClick={() => setPaymentMethod('bank')}
                                className={`w-full p-4 border-2 flex items-center gap-4 hover:border-black transition-all ${paymentMethod === 'bank' ? 'border-black bg-zinc-50' : 'border-slate-200'}`}
                              >
                                  <Building size={24} className="text-slate-800" />
                                  <div className="text-left">
                                      <p className="font-bold text-sm uppercase">Bank Transfer</p>
                                      <p className="text-[10px] text-slate-500">Direct deposit details</p>
                                  </div>
                              </button>
                              <button 
                                onClick={() => setPaymentMethod('bkash')}
                                className={`w-full p-4 border-2 flex items-center gap-4 hover:border-black transition-all ${paymentMethod === 'bkash' ? 'border-black bg-zinc-50' : 'border-slate-200'}`}
                              >
                                  <Wallet size={24} className="text-pink-600" />
                                  <div className="text-left">
                                      <p className="font-bold text-sm uppercase">Mobile Banking</p>
                                      <p className="text-[10px] text-slate-500">bKash, Nagad, Rocket</p>
                                  </div>
                              </button>
                          </div>

                          <button 
                            onClick={() => setPaymentStep('confirm')}
                            className="w-full bg-black text-white py-4 font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                          >
                              Continue to Pay
                          </button>
                      </div>
                  )}

                  {/* Step 2: Confirm */}
                  {paymentStep === 'confirm' && (
                      <div className="space-y-6">
                          <h3 className="font-bold uppercase text-lg border-b border-slate-100 pb-2">Confirm Payment</h3>
                          
                          <div className="space-y-4 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-slate-500">Amount</span>
                                  <span className="font-bold">${(selectedInvoice ? selectedInvoice.amount : pendingPayment).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-slate-500">Method</span>
                                  <span className="font-bold uppercase">{paymentMethod}</span>
                              </div>
                              <div className="flex justify-between border-t border-slate-100 pt-2">
                                  <span className="font-black uppercase">Total Charge</span>
                                  <span className="font-black text-emerald-600">${(selectedInvoice ? selectedInvoice.amount : pendingPayment).toLocaleString()}</span>
                              </div>
                          </div>

                          <div className="bg-zinc-50 p-3 text-[10px] text-slate-500 border border-slate-200">
                              <p>By clicking confirm, you authorize BlueprintOS to charge your account. Transactions are secure and encrypted.</p>
                          </div>

                          <div className="flex gap-3">
                              <button onClick={() => setPaymentStep('method')} className="flex-1 py-3 border border-slate-300 font-bold uppercase text-xs">Back</button>
                              <button onClick={processPayment} className="flex-1 py-3 bg-black text-white font-bold uppercase text-xs hover:bg-emerald-600 transition-colors">Confirm & Pay</button>
                          </div>
                      </div>
                  )}

                  {/* Step 3: Processing */}
                  {paymentStep === 'processing' && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <Loader2 size={48} className="animate-spin text-black" />
                          <p className="font-bold uppercase text-sm animate-pulse">Processing Transaction...</p>
                          <p className="text-xs text-slate-400">Please do not close this window.</p>
                      </div>
                  )}

                  {/* Step 4: Success */}
                  {paymentStep === 'success' && (
                      <div className="flex flex-col items-center justify-center py-8 space-y-6">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-in zoom-in duration-300">
                              <CheckCircle2 size={32} />
                          </div>
                          <div className="text-center">
                              <h3 className="font-black text-2xl uppercase mb-2">Payment Successful</h3>
                              <p className="text-slate-500 text-sm">Thank you! Your payment has been recorded.</p>
                          </div>
                          <div className="w-full bg-zinc-50 border border-slate-200 p-4 text-center">
                              <p className="text-[10px] font-bold uppercase text-slate-400">Transaction Ref</p>
                              <p className="font-mono font-bold">TXN-{Math.floor(Math.random() * 1000000)}</p>
                          </div>
                          <button onClick={closePayModal} className="w-full bg-black text-white py-3 font-bold uppercase text-xs hover:bg-zinc-800">
                              Close Receipt
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientPaymentPortal;
