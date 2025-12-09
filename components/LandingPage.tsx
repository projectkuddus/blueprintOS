
import React, { useState } from 'react';
import { 
  ArrowRight, Layers, Users, TrendingUp, Shield, 
  LayoutGrid, Box, Check, Globe, MapPin, 
  ChevronRight, Building, Server, Activity, Database, Lock, FileText, AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

type Section = 'Home' | 'Manifesto' | 'Solutions' | 'Pricing' | 'Studio' | 'Privacy' | 'Terms' | 'Status';

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [activeSection, setActiveSection] = useState<Section>('Home');

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 relative z-10 min-h-[60vh]">
        <div className="max-w-4xl w-full text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 border border-slate-200 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Made by Architects, Made for Architects</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Design.<br/>
            Build.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200">Deliver.</span>
          </h1>
          
          <p className="max-w-lg mx-auto text-sm md:text-base text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 bg-white/50 backdrop-blur-sm p-2 rounded">
            A unified workspace connecting architects, engineers, and clients. 
            Track every phase from ideation sketch to final handover in one pristine interface.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <button 
               onClick={onEnter}
               className="group relative bg-black text-white px-8 py-4 min-w-[200px] overflow-hidden shadow-xl hover:shadow-2xl transition-all"
             >
                <span className="relative z-10 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                  Enter Workspace <ArrowRight size={14} />
                </span>
                <div className="absolute inset-0 bg-zinc-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
             </button>
             <button 
               onClick={() => setActiveSection('Solutions')}
               className="px-8 py-4 min-w-[200px] border border-slate-200 hover:border-black bg-white/80 backdrop-blur-sm text-xs font-bold uppercase tracking-widest transition-colors text-black"
             >
                View Solutions
             </button>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { icon: Layers, title: "Workflow Control", desc: "Granular stage management from concept to construction." },
          { icon: Users, title: "Team Hierarchy", desc: "Role-based access for architects, engineers, and clients." },
          { icon: TrendingUp, title: "Financial Intelligence", desc: "Real-time budget tracking, invoicing, and cash flow analysis." }
        ].map((feature, i) => (
          <div key={i} className="group p-8 border border-slate-200 bg-white/90 backdrop-blur-xl hover:border-black transition-all duration-500 hover:shadow-xl cursor-default">
             <div className="w-12 h-12 bg-zinc-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
               <feature.icon size={20} />
             </div>
             <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{feature.title}</h3>
             <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </>
  );

  const renderManifesto = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-left space-y-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          The Blueprint <br/>Manifesto
        </h1>
        
        <div className="space-y-8 text-lg md:text-xl font-serif leading-relaxed text-slate-800">
          <p>
            Architecture is often romanticized as pure art, yet in practice, it is a battle against chaos. 
            The friction between the vision and the built reality is where design often dies.
          </p>
          <p>
            We believe that <strong className="bg-black text-white px-2">structure does not kill creativity; it liberates it.</strong>
          </p>
          <p>
            BlueprintOS was born in a studio in Dhaka, not a boardroom in Silicon Valley. 
            It was built by architects who were tired of managing million-dollar projects on spreadsheets and WhatsApp groups.
          </p>
          <p>
            We strictly adhere to a <strong>Monochromatic</strong> philosophy. No distractions. No clutter. 
            Just the raw data, the drawing, and the deadline. Like a fresh sheet of trace paper, our interface is a tool, not a decoration.
          </p>
        </div>

        <div className="pt-12 border-t border-black">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Signed</p>
          <p className="text-2xl font-black uppercase">The BlueprintOS Team</p>
          <p className="text-sm font-medium text-slate-500">Dhaka, Bangladesh</p>
        </div>
      </div>
    </main>
  );

  const renderSolutions = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Architecture Operating System</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          A complete suite of tools designed to replace the fragmented ecosystem of email, spreadsheets, and file storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
         {/* Workflow */}
         <div className="bg-white border border-slate-200 p-8 hover:border-black transition-all group">
            <div className="flex justify-between items-start mb-6">
               <Layers size={32} className="text-slate-300 group-hover:text-black transition-colors" />
               <span className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-1">Core Module</span>
            </div>
            <h3 className="text-2xl font-bold uppercase mb-4">Phase-Locked Workflow</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
               Forget linear lists. Our timeline system enforces "Deal Locks" and "Design Freezes". 
               You cannot proceed to Construction Drawings until the Concept Phase is signed off. 
               This prevents scope creep and ensures client accountability.
            </p>
            <ul className="space-y-2">
               {['Visual Timeline', 'Asset Management (CAD/Revit)', 'Dependency Tracking', 'Client Approval Gates'].map(item => (
                 <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Check size={12} className="text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </div>

         {/* Financials */}
         <div className="bg-white border border-slate-200 p-8 hover:border-black transition-all group">
            <div className="flex justify-between items-start mb-6">
               <TrendingUp size={32} className="text-slate-300 group-hover:text-black transition-colors" />
               <span className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-1">Finance Module</span>
            </div>
            <h3 className="text-2xl font-bold uppercase mb-4">Studio Intelligence</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
               Stop guessing your profitability. BlueprintOS tracks every billable hour, every site expense, and every invoice. 
               See your studio's burn rate and project margins in real-time.
            </p>
            <ul className="space-y-2">
               {['BOQ Integration', 'Invoice Tracking', 'Seat-Based Costing', 'Vendor Management'].map(item => (
                 <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Check size={12} className="text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </div>

         {/* Hierarchy */}
         <div className="bg-white border border-slate-200 p-8 hover:border-black transition-all group">
            <div className="flex justify-between items-start mb-6">
               <Shield size={32} className="text-slate-300 group-hover:text-black transition-colors" />
               <span className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-1">Security Module</span>
            </div>
            <h3 className="text-2xl font-bold uppercase mb-4">Granular Access Control</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
               Clients see the progress, not the panic. Site engineers see the drawings, not the budget. 
               Our Role-Based Access Control (RBAC) ensures information security without hindering collaboration.
            </p>
            <ul className="space-y-2">
               {['Client View Mode', 'Financial Privacy', 'Stage-Specific Permissions', 'Audit Logs'].map(item => (
                 <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Check size={12} className="text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </div>

         {/* Collaboration */}
         <div className="bg-white border border-slate-200 p-8 hover:border-black transition-all group">
            <div className="flex justify-between items-start mb-6">
               <Users size={32} className="text-slate-300 group-hover:text-black transition-colors" />
               <span className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-1">Team Module</span>
            </div>
            <h3 className="text-2xl font-bold uppercase mb-4">Integrated Network</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
               Bring your entire network under one roof. Manage internal staff salaries alongside external consultant fees. 
               Assign tasks to structural engineers or render artists seamlessly.
            </p>
            <ul className="space-y-2">
               {['Team Workload View', 'Consultant Portal', 'Site Chat', 'AI Project Assistant'].map(item => (
                 <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                    <Check size={12} className="text-emerald-500" /> {item}
                 </li>
               ))}
            </ul>
         </div>
      </div>
    </main>
  );

  const renderPricing = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Transparent Pricing</h1>
        <p className="text-slate-500">No hidden fees. Pay only for the active seats you need.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
        {/* Starter */}
        <div className="bg-white border border-slate-200 p-8 flex flex-col h-[400px]">
           <h3 className="text-xl font-bold uppercase mb-2">Freelancer</h3>
           <p className="text-xs text-slate-500 mb-8">For solo architects and small renovations.</p>
           <div className="mb-8">
              <span className="text-4xl font-black">Free</span>
              <span className="text-xs text-slate-400 font-bold uppercase ml-2">Forever</span>
           </div>
           <ul className="space-y-3 flex-1">
             {['1 Active Project', 'Basic Workflow', '500MB Storage'].map(item => (
               <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> {item}
               </li>
             ))}
           </ul>
           <button className="w-full py-3 border border-black text-black font-bold uppercase text-xs hover:bg-black hover:text-white transition-colors">
             Get Started
           </button>
        </div>

        {/* Studio (Highlighted) */}
        <div className="bg-black text-white p-8 flex flex-col h-[500px] shadow-2xl scale-105 relative">
           <div className="absolute top-0 left-0 w-full flex justify-center -mt-3">
              <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase px-3 py-1">Most Popular</span>
           </div>
           <h3 className="text-2xl font-bold uppercase mb-2">Studio</h3>
           <p className="text-xs text-zinc-400 mb-8">For growing firms and design teams.</p>
           <div className="mb-8">
              <span className="text-5xl font-black">৳1,000</span>
              <span className="text-xs text-zinc-500 font-bold uppercase ml-2">/ Seat / Month</span>
           </div>
           <ul className="space-y-4 flex-1">
             {['Unlimited Projects', 'Full Financial Suite', 'Role-Based Access', 'Client Portal', '100GB Storage', 'Priority Support'].map(item => (
               <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-300">
                  <Check size={14} className="text-emerald-500" /> {item}
               </li>
             ))}
           </ul>
           <button onClick={onEnter} className="w-full py-4 bg-white text-black font-bold uppercase text-sm hover:bg-emerald-400 transition-colors">
             Start Free Trial
           </button>
        </div>

        {/* Enterprise */}
        <div className="bg-white border border-slate-200 p-8 flex flex-col h-[400px]">
           <h3 className="text-xl font-bold uppercase mb-2">Enterprise</h3>
           <p className="text-xs text-slate-500 mb-8">For developers and large construction firms.</p>
           <div className="mb-8">
              <span className="text-4xl font-black">Custom</span>
              <span className="text-xs text-slate-400 font-bold uppercase ml-2">Pricing</span>
           </div>
           <ul className="space-y-3 flex-1">
             {['Dedicated Server', 'API Access', 'Custom Branding', 'On-premise Setup'].map(item => (
               <li key={item} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> {item}
               </li>
             ))}
           </ul>
           <button className="w-full py-3 border border-slate-300 text-slate-500 font-bold uppercase text-xs hover:border-black hover:text-black transition-colors">
             Contact Sales
           </button>
        </div>
      </div>
    </main>
  );

  const renderStudio = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* About Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 w-full">
         <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">The Studio</h1>
            <div className="h-1 w-20 bg-black"></div>
            <p className="text-lg font-serif text-slate-800 leading-relaxed">
               BlueprintOS is crafted by a dedicated team of architects and software engineers based in Dhaka, Bangladesh.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
               We understand the dust of the site and the precision of the drafting table. 
               Our mission is to digitize the construction industry of South Asia and beyond, providing a platform that respects the craft.
            </p>
            
            <div className="flex gap-6 pt-4">
               <div className="flex items-center gap-2 text-xs font-bold uppercase">
                  <MapPin size={16} /> Dhaka, Bangladesh
               </div>
               <div className="flex items-center gap-2 text-xs font-bold uppercase">
                  <Globe size={16} /> blueprint-os.com
               </div>
            </div>
         </div>
         <div className="bg-zinc-100 aspect-video flex items-center justify-center border border-slate-200">
            {/* Placeholder for Office Image */}
            <div className="text-center">
               <div className="text-6xl font-black text-slate-200 uppercase">Dhaka</div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">HQ / R&D Center</div>
            </div>
         </div>
      </div>

      {/* Directory Section */}
      <div className="w-full border-t border-slate-200 pt-16">
         <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-black uppercase">Featured Studios</h2>
            <button className="text-xs font-bold uppercase border-b border-black pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-colors">
               View All Directory
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
               { name: "Studio A", loc: "Dhaka", type: "Green Architecture" },
               { name: "Studio B", loc: "Dhaka", type: "Contemporary" },
               { name: "Studio C", loc: "Dhaka", type: "Urban Design" },
               { name: "Studio D", loc: "Chittagong", type: "Residential" }
            ].map((studio, i) => (
               <div key={i} className="group bg-white border border-slate-200 p-6 hover:border-black cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-lg mb-4">
                     {studio.name[0]}
                  </div>
                  <h3 className="font-bold uppercase text-sm mb-1 group-hover:underline">{studio.name}</h3>
                  <p className="text-xs text-slate-500 uppercase flex items-center gap-1">
                     <MapPin size={10} /> {studio.loc}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mt-4">{studio.type}</p>
               </div>
            ))}
         </div>
      </div>
    </main>
  );

  const renderPrivacy = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="w-full max-w-3xl">
          <div className="mb-12 border-b border-black pb-8">
             <div className="flex items-center gap-3 mb-4">
                <Lock size={32} />
                <span className="text-xs font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1">Legal Document</span>
             </div>
             <h1 className="text-5xl font-black uppercase tracking-tight mb-4">Privacy Policy</h1>
             <p className="text-slate-500 font-medium">Last updated: October 24, 2024</p>
          </div>

          <div className="space-y-12 font-serif text-lg leading-relaxed text-slate-800">
             <section>
                <h3 className="font-sans font-bold text-black uppercase text-sm mb-4">1. Data Sovereignty</h3>
                <p>
                   At BlueprintOS, we understand that your designs, BOQs (Bill of Quantities), and client details are your intellectual property. 
                   <strong className="bg-emerald-100 px-1 mx-1">We claim zero ownership over the data you upload.</strong>
                   Your CAD drawings, 3D renders, and financial records remain exclusively yours.
                </p>
             </section>

             <section>
                <h3 className="font-sans font-bold text-black uppercase text-sm mb-4">2. Architectural Confidentiality</h3>
                <p>
                   We implement strict Role-Based Access Control (RBAC) at the database level. 
                   A "Client" user can never access the "Budget" or "Vendor" tables unless explicitly granted permission by the Core Account. 
                   We treat project data with the same confidentiality as a sealed tender.
                </p>
             </section>

             <section>
                <h3 className="font-sans font-bold text-black uppercase text-sm mb-4">3. Data Usage & AI</h3>
                <p>
                   Our AI Project Assistant processes text and document data to provide summaries and answers. 
                   This processing occurs in an ephemeral state. We do not use your proprietary project data to train our foundational models 
                   without your explicit written consent.
                </p>
             </section>

             <section>
                <h3 className="font-sans font-bold text-black uppercase text-sm mb-4">4. Compliance</h3>
                <p>
                   We comply with the Digital Security Act of Bangladesh and international data protection standards. 
                   All sensitive data is encrypted at rest using AES-256 and in transit using TLS 1.3.
                </p>
             </section>
          </div>

          <div className="mt-16 p-8 bg-zinc-50 border border-slate-200">
             <h4 className="font-sans font-bold uppercase text-xs mb-2">Data Protection Officer</h4>
             <p className="font-sans text-sm text-slate-600">
                For any privacy concerns or data deletion requests, contact us at:<br/>
                <a href="mailto:privacy@blueprint-os.com" className="underline text-black">privacy@blueprint-os.com</a>
             </p>
          </div>
       </div>
    </main>
  );

  const renderTerms = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="w-full max-w-3xl">
          <div className="mb-12 border-b border-black pb-8">
             <div className="flex items-center gap-3 mb-4">
                <FileText size={32} />
                <span className="text-xs font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1">Agreement</span>
             </div>
             <h1 className="text-5xl font-black uppercase tracking-tight mb-4">Terms of Service</h1>
             <p className="text-slate-500 font-medium">Effective Date: October 24, 2024</p>
          </div>

          <div className="space-y-12 text-slate-700">
             <section className="flex gap-6">
                <div className="font-bold text-2xl font-mono text-slate-300">01</div>
                <div>
                   <h3 className="font-bold text-black uppercase text-sm mb-2">Professional Use Only</h3>
                   <p className="text-sm leading-relaxed">
                      BlueprintOS is a management tool, not a substitute for professional architectural or engineering judgment. 
                      We are not liable for structural failures, construction errors, or regulatory violations resulting from the use of our scheduling or documentation tools. 
                      Always consult certified professionals for site execution.
                   </p>
                </div>
             </section>

             <section className="flex gap-6">
                <div className="font-bold text-2xl font-mono text-slate-300">02</div>
                <div>
                   <h3 className="font-bold text-black uppercase text-sm mb-2">Seat-Based Billing</h3>
                   <p className="text-sm leading-relaxed">
                      Subscription fees are charged per "Active Seat" (User) at ৳1,000/month. 
                      An "Active Seat" is defined as any user with edit access to at least one project. 
                      Read-only Client accounts are free of charge. You may add or remove seats at any time; billing is prorated daily.
                   </p>
                </div>
             </section>

             <section className="flex gap-6">
                <div className="font-bold text-2xl font-mono text-slate-300">03</div>
                <div>
                   <h3 className="font-bold text-black uppercase text-sm mb-2">Service Availability</h3>
                   <p className="text-sm leading-relaxed">
                      We strive for 99.9% uptime but do not guarantee uninterrupted service. 
                      In the event of a scheduled maintenance window exceeding 4 hours, all Core Accounts will be notified via email 24 hours in advance.
                   </p>
                </div>
             </section>

             <section className="flex gap-6">
                <div className="font-bold text-2xl font-mono text-slate-300">04</div>
                <div>
                   <h3 className="font-bold text-black uppercase text-sm mb-2">Termination</h3>
                   <p className="text-sm leading-relaxed">
                      We reserve the right to terminate accounts that violate these terms, including but not limited to: 
                      hosting illegal content, attempting to reverse-engineer the platform, or non-payment of invoices after a 14-day grace period.
                   </p>
                </div>
             </section>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8">
             <p className="text-xs text-slate-400 uppercase font-bold">BlueprintOS Legal Team</p>
             <button onClick={() => setActiveSection('Pricing')} className="text-xs font-bold uppercase border-b border-black pb-1 hover:text-emerald-600 hover:border-emerald-600">
               View Pricing Details
             </button>
          </div>
       </div>
    </main>
  );

  const renderStatus = () => (
    <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="w-full text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-6">
             <Activity size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">All Systems Operational</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tight">System Status</h1>
       </div>

       <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "API Gateway", status: "Operational", uptime: "99.99%", lat: "24ms", icon: Server },
            { name: "Database (Dhaka Region)", status: "Operational", uptime: "100%", lat: "12ms", icon: Database },
            { name: "Asset Storage", status: "Operational", uptime: "99.98%", lat: "45ms", icon: Box }
          ].map((service, i) => (
             <div key={i} className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center hover:border-black transition-colors">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                   <service.icon size={24} className="text-black" />
                </div>
                <h3 className="font-bold text-lg uppercase mb-2">{service.name}</h3>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-6">
                   <Check size={12} /> {service.status}
                </div>
                
                <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Uptime</p>
                      <p className="font-mono font-bold text-lg">{service.uptime}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Latency</p>
                      <p className="font-mono font-bold text-lg">{service.lat}</p>
                   </div>
                </div>
             </div>
          ))}
       </div>

       <div className="w-full mt-12 bg-zinc-50 border border-slate-200 p-8">
          <h3 className="font-bold text-sm uppercase mb-6 flex items-center gap-2">
             <AlertCircle size={16} /> Past Incidents
          </h3>
          <div className="space-y-4">
             <div className="flex gap-4 items-start">
                <div className="text-xs font-bold text-slate-400 min-w-[100px]">Oct 12, 2024</div>
                <div>
                   <p className="text-sm font-bold text-black">Scheduled Maintenance</p>
                   <p className="text-xs text-slate-500 mt-1">Completed database migration for Dhaka region. No downtime recorded.</p>
                </div>
             </div>
             <div className="h-px bg-slate-200 w-full"></div>
             <div className="flex gap-4 items-start">
                <div className="text-xs font-bold text-slate-400 min-w-[100px]">Sep 28, 2024</div>
                <div>
                   <p className="text-sm font-bold text-black">Storage Latency</p>
                   <p className="text-xs text-slate-500 mt-1">Resolved minor latency issues with image uploads in the Asia Pacific region.</p>
                </div>
             </div>
          </div>
       </div>
    </main>
  );

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans selection:bg-black selection:text-white flex flex-col relative overflow-hidden bg-paper">
      
      {/* Architects Technical Grid Background */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
               linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
             `,
             backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
           }}>
      </div>

      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex justify-between items-center border-b border-black/5 backdrop-blur-sm fixed top-0 z-50 bg-white/80">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveSection('Home')}
        >
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-lg">B</div>
          <span className="font-bold tracking-widest uppercase text-xs">BlueprintOS</span>
        </div>
        <div className="hidden md:flex gap-8">
          {(['Manifesto', 'Solutions', 'Pricing', 'Studio'] as Section[]).map((item) => (
            <button 
              key={item} 
              onClick={() => setActiveSection(item)}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeSection === item ? 'text-black underline underline-offset-4' : 'text-slate-400 hover:text-black'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <button 
          onClick={onEnter}
          className="text-xs font-bold uppercase tracking-widest border border-black px-6 py-2 hover:bg-black hover:text-white transition-all"
        >
          Login
        </button>
      </nav>

      {/* Dynamic Content */}
      <div className="min-h-screen flex flex-col">
        {activeSection === 'Home' && renderHome()}
        {activeSection === 'Manifesto' && renderManifesto()}
        {activeSection === 'Solutions' && renderSolutions()}
        {activeSection === 'Pricing' && renderPricing()}
        {activeSection === 'Studio' && renderStudio()}
        {activeSection === 'Privacy' && renderPrivacy()}
        {activeSection === 'Terms' && renderTerms()}
        {activeSection === 'Status' && renderStatus()}
      </div>

      {/* Bottom Bar (Global) */}
      <footer className="w-full border-t border-slate-100 bg-white/90 backdrop-blur-md py-12 px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest relative z-10 mt-auto">
         <div className="flex items-center gap-8 mb-4 md:mb-0">
            <span>© 2024 BlueprintOS Inc.</span>
            <span className="hidden md:inline">Dhaka, Bangladesh</span>
         </div>
         <div className="flex gap-6">
            <button onClick={() => setActiveSection('Privacy')} className="hover:text-black transition-colors">Privacy</button>
            <button onClick={() => setActiveSection('Terms')} className="hover:text-black transition-colors">Terms</button>
            <button onClick={() => setActiveSection('Status')} className="hover:text-black transition-colors">Status</button>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
