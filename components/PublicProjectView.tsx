
import React from 'react';
import { Project } from '../types';
import { ArrowLeft, MapPin, Layout, Tag, Building, Globe } from 'lucide-react';

interface PublicProjectViewProps {
  project: Project;
  onBack: () => void;
}

const PublicProjectView: React.FC<PublicProjectViewProps> = ({ project, onBack }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto z-50 absolute inset-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-black/5 z-50 px-8 py-6 flex justify-between items-center">
        <div 
          onClick={onBack}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-lg group-hover:bg-emerald-600 transition-colors">B</div>
          <span className="font-bold tracking-widest uppercase text-xs">BlueprintOS</span>
        </div>
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Studio
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[70vh] w-full mt-20">
        <img 
          src={project.thumbnailUrl} 
          alt={project.name} 
          className="w-full h-full object-cover grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
           <div className="max-w-7xl mx-auto">
              <div className="inline-block bg-white text-black px-4 py-1 mb-4 text-xs font-bold uppercase tracking-widest">
                 {project.classification} Project
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                {project.name}
              </h1>
              <p className="flex items-center gap-2 text-white/90 font-medium text-lg">
                 <MapPin size={20} /> {project.location}
              </p>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Details */}
            <aside className="lg:col-span-4 space-y-12">
               <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-6 tracking-widest border-b border-black pb-2">Project Data</h3>
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <Building size={20} className="text-black" />
                        <div>
                           <p className="text-xs font-bold uppercase text-slate-500">Typology</p>
                           <p className="text-lg font-bold">{project.type}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <Layout size={20} className="text-black" />
                        <div>
                           <p className="text-xs font-bold uppercase text-slate-500">Area</p>
                           <p className="text-lg font-bold">{project.squareFootage.toLocaleString()} sq ft</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <Tag size={20} className="text-black" />
                        <div>
                           <p className="text-xs font-bold uppercase text-slate-500">Client</p>
                           <p className="text-lg font-bold">{project.clientName}</p>
                        </div>
                     </div>
                     {project.googleMapLink && (
                        <div className="flex items-start gap-4 pt-4">
                           <a 
                             href={project.googleMapLink} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 text-xs font-bold uppercase border border-black px-4 py-3 hover:bg-black hover:text-white transition-all"
                           >
                              <Globe size={14} /> View Location Map
                           </a>
                        </div>
                     )}
                  </div>
               </div>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-8 space-y-16">
               <div className="prose prose-lg max-w-none">
                  <h3 className="text-3xl font-bold uppercase tracking-tight mb-6">About the Project</h3>
                  <div className="text-xl font-serif leading-relaxed text-slate-800 space-y-6">
                     {project.description ? (
                        project.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
                     ) : (
                        <p className="text-slate-400 italic">No description provided for this project.</p>
                     )}
                  </div>
               </div>

               {/* Gallery */}
               <div className="border-t border-black pt-16">
                  <h3 className="text-3xl font-bold uppercase tracking-tight mb-8">Visual Gallery</h3>
                  
                  {project.gallery && project.gallery.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.gallery.map((imgUrl, index) => (
                           <div 
                             key={index} 
                             className={`relative group overflow-hidden ${index % 3 === 0 ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                           >
                              <img 
                                src={imgUrl} 
                                alt={`Gallery ${index}`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="py-20 border-2 border-dashed border-slate-200 text-center text-slate-400">
                        <p className="font-bold uppercase text-sm">No gallery images available</p>
                     </div>
                  )}
               </div>
            </article>
         </div>
      </main>

      <footer className="bg-black text-white py-20 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
               <div className="text-2xl font-black uppercase mb-2">BlueprintOS</div>
               <p className="text-xs text-zinc-500 uppercase tracking-widest">Architectural Portfolio 2024</p>
            </div>
            <button onClick={onBack} className="text-sm font-bold uppercase hover:text-emerald-400 transition-colors">
               Close Project View
            </button>
         </div>
      </footer>
    </div>
  );
};

export default PublicProjectView;
