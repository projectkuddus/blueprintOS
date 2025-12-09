
import React, { useState } from 'react';
import { 
  ArrowRight, Layers, Users, TrendingUp, Box, Check, Sparkles, ScrollText, ShieldCheck, Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

type Section = 'Home' | 'Manifesto' | 'Solutions' | 'Pricing' | 'Studio' | 'Privacy' | 'Terms' | 'Status';

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [activeSection, setActiveSection] = useState<Section>('Home');

  return (
    <div className="min-h-screen w-full font-sans text-slate-900 bg-white selection:bg-black selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full h-16 flex justify-between items-center px-6 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActiveSection('Home')}
        >
          <div className="w-7 h-7 rounded-none bg-black text-white flex items-center justify-center font-bold text-base">B</div>
          <span className="font-bold tracking-tight text-base text-slate-900 uppercase">Blueprint<span className="font-light text-slate-500">OS</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {(['Manifesto', 'Solutions', 'Pricing', 'Studio'] as Section[]).map((item) => (
            <button 
              key={item} 
              onClick={() => setActiveSection(item)}
              className={`
                text-xs font-bold uppercase tracking-wide transition-colors
                ${activeSection === item ? 'text-black' : 'text-slate-400 hover:text-black'}
              `}
            >
              {item}
            </button>
          ))}
        </div>

        <button 
          onClick={onEnter}
          className="bg-black text-white px-5 py-2 rounded-none text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          Enter Workspace <ArrowRight size={14} />
        </button>
      </nav>

      {/* Dynamic Content */}
      <div className="relative z-10 pt-24 pb-20 px-6 max-w-6xl mx-auto min-h-screen flex flex-col">
        
        {activeSection === 'Home' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-black">
                <Sparkles size={10} /> The Operating System for Design
             </div>

             <h1 className="text-4xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase max-w-5xl">
               Built by<br/>
               Architects.<br/>
               <span className="text-slate-400">For Architects.</span>
             </h1>

             <p className="max-w-lg text-base text-slate-500 leading-relaxed font-medium uppercase tracking-wide mt-2">
               Fluid Design. Crystal Clear Execution.<br/>
               Manage your studio with the precision of a master builder.
             </p>

             <div className="flex gap-4 pt-6">
                <button onClick={onEnter} className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl hover:-translate-y-1">
                   Start Project
                </button>
                <button onClick={() => setActiveSection('Manifesto')} className="px-8 py-3 bg-white text-black border-2 border-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all hover:-translate-y-1">
                   Read Manifesto
                </button>
             </div>

             {/* Graphic - Architect Plan Style */}
             <div className="w-full max-w-4xl h-56 mt-12 border-2 border-black relative overflow-hidden hidden md:block bg-slate-50">
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-10" 
                    style={{ 
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
                        backgroundSize: '30px 30px' 
                    }}
                ></div>
                
                {/* Simulated UI Blocks */}
                <div className="absolute top-6 left-6 right-6 h-12 border-2 border-black bg-white flex items-center px-4 justify-between">
                   <div className="flex gap-3">
                      <div className="w-3 h-3 bg-black"></div>
                      <div className="w-24 h-3 bg-slate-200"></div>
                   </div>
                   <div className="w-6 h-6 rounded-full border-2 border-black"></div>
                </div>
                
                <div className="absolute top-24 left-6 w-48 bottom-6 border-2 border-black bg-white"></div>
                <div className="absolute top-24 left-60 right-6 bottom-6 border-2 border-black bg-white flex items-center justify-center">
                    <p className="font-mono text-[10px] uppercase text-slate-400">Project Timeline Visualization</p>
                </div>
             </div>
          </div>
        )}

        {/* Manifesto Section */}
        {activeSection === 'Manifesto' && (
           <div className="max-w-3xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Architecture is<br/>Broken.</h2>
                 <p className="text-lg text-black font-bold uppercase tracking-widest bg-emerald-300 inline-block px-2">It's time to rebuild the process.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                 <div className="border-t-4 border-black pt-4">
                    <h3 className="text-xl font-black uppercase mb-3">01. Clarity</h3>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                       The "black box" of construction costs destroys trust. We believe every stakeholder should see the same reality.
                    </p>
                 </div>
                 <div className="border-t-4 border-black pt-4">
                    <h3 className="text-xl font-black uppercase mb-3">02. Business</h3>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                       Great architecture dies without great management. We treat financial health with the same rigor as structural integrity.
                    </p>
                 </div>
                 <div className="border-t-4 border-black pt-4">
                    <h3 className="text-xl font-black uppercase mb-3">03. Data</h3>
                    <p className="text-slate-600 font-medium leading-relaxed text-sm">
                       From BOQs to daily site logs, data shouldn't be lost in emails. It is the foundation we build upon.
                    </p>
                 </div>
              </div>

              <div className="bg-black text-white p-8 mt-8 text-center">
                 <p className="text-lg font-bold uppercase leading-relaxed mb-4">
                    "We built BlueprintOS to give architects the tools to lead with confidence and clients the clarity to invest with peace of mind."
                 </p>
                 <button onClick={onEnter} className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                    Join the Movement
                 </button>
              </div>
           </div>
        )}

        {/* Features Grid (Solutions) */}
        {activeSection === 'Solutions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {[
                 { icon: Layers, title: "Structured Workflow", desc: "Stages that flow naturally. Deal locks and design freezes are visualized as distinct states." },
                 { icon: Users, title: "Team Hierarchy", desc: "See exactly who has access to what. Permissions are clear and manageable." },
                 { icon: TrendingUp, title: "Financial Clarity", desc: "Track every penny. Budgets and invoices overlay seamlessly on project timelines." },
                 { icon: Box, title: "Asset Management", desc: "A centralized repository for your CAD, BIM, and renders." }
              ].map((f, i) => (
                 <div key={i} className="bg-white p-8 border border-slate-100 hover:bg-zinc-50 transition-all group relative">
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={20} />
                    </div>
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-4">
                       <f.icon size={20} />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black mb-2">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-xs font-medium">{f.desc}</p>
                 </div>
              ))}
           </div>
        )}

        {/* Pricing */}
        {activeSection === 'Pricing' && (
           <div className="flex flex-col md:flex-row gap-6 items-center justify-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-full md:w-72 bg-white p-6 border-2 border-slate-200 flex flex-col gap-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Freelancer</h3>
                 <div className="text-3xl font-black text-slate-900 uppercase">Free</div>
                 <p className="text-xs text-slate-500">For solo architects starting out.</p>
                 <button className="w-full py-2 border-2 border-black hover:bg-black hover:text-white text-black transition-colors font-bold text-xs uppercase">Join Now</button>
              </div>
              
              <div className="w-full md:w-80 bg-black p-6 border-2 border-black flex flex-col gap-4 shadow-2xl relative overflow-hidden text-white transform scale-105">
                 <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-bold uppercase px-2 py-0.5">Best Value</div>
                 <div>
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Studio</h3>
                    <p className="text-slate-400 text-[10px] mt-0.5 uppercase font-bold">Standard License</p>
                 </div>
                 <div className="text-4xl font-black uppercase">৳1,000<span className="text-xs font-normal text-slate-400">/mo</span></div>
                 <ul className="space-y-2">
                    {['Unlimited Projects', 'Client Portal', 'Finance Module', '100GB Storage'].map(f => (
                       <li key={f} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                          <Check size={14} className="text-emerald-400"/> {f}
                       </li>
                    ))}
                 </ul>
                 <button onClick={onEnter} className="w-full py-2 bg-white text-black font-bold text-xs uppercase tracking-wide hover:bg-emerald-400 transition-all">
                    Start Trial
                 </button>
              </div>

              <div className="w-full md:w-72 bg-white p-6 border-2 border-slate-200 flex flex-col gap-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Enterprise</h3>
                 <div className="text-3xl font-black text-slate-900 uppercase">Custom</div>
                 <p className="text-xs text-slate-500">For large firms needing dedicated servers.</p>
                 <button className="w-full py-2 border-2 border-black hover:bg-black hover:text-white text-black transition-colors font-bold text-xs uppercase">Contact Us</button>
              </div>
           </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto py-6 relative z-10 bg-white">
         <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <p>&copy; 2024 BlueprintOS Inc. Dhaka.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               {['Privacy', 'Terms', 'Status'].map(link => (
                  <button key={link} className="hover:text-black transition-colors uppercase" onClick={() => setActiveSection(link as Section)}>{link}</button>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
