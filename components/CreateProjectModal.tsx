
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, ProjectType, ProjectClassification } from '../types';
import { DEFAULT_PROJECT_TYPES, DEFAULT_CLASSIFICATIONS } from '../constants';
import { simulateCloudUpload } from '../services/storageService';
import { 
  X, Briefcase, MapPin, User, DollarSign, Layout, FilePlus, Globe, Pencil, 
  Trash2, Image, Mail, Loader2, AlertCircle, Save, Plus 
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  onDelete?: (projectId: string) => void;
  currentUserRole: Role;
  projectToEdit?: Project | null;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, currentUserRole, projectToEdit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    googleMapLink: '',
    clientName: '',
    clientPointOfContact: '',
    clientEmail: '',
    type: 'Residential',
    classification: 'Private',
    budget: '',
    squareFootage: '',
    description: '',
    thumbnailUrl: '',
    gallery: []
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setFormData({
          name: projectToEdit.name,
          location: projectToEdit.location,
          googleMapLink: projectToEdit.googleMapLink || '',
          clientName: projectToEdit.clientName,
          clientPointOfContact: projectToEdit.clientPointOfContact || '',
          clientEmail: projectToEdit.clientEmail || '',
          type: projectToEdit.type,
          classification: projectToEdit.classification,
          budget: projectToEdit.budget.toString(),
          squareFootage: projectToEdit.squareFootage.toString(),
          description: projectToEdit.description || '',
          thumbnailUrl: projectToEdit.thumbnailUrl || '',
          gallery: projectToEdit.gallery || []
        });
      } else {
        setFormData({
          name: '',
          location: '',
          googleMapLink: '',
          clientName: '',
          clientPointOfContact: '',
          clientEmail: '',
          type: 'Residential',
          classification: 'Private',
          budget: '',
          squareFootage: '',
          description: '',
          thumbnailUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`,
          gallery: []
        });
      }
    }
  }, [isOpen, projectToEdit]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const url = await simulateCloudUpload(file);
        setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      } catch (error) {
        console.error("Image upload failed");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (formData.gallery.length + files.length > 10) {
        alert("You can only upload up to 10 photos in the gallery.");
        return;
      }

      setIsUploadingGallery(true);
      try {
        const uploadPromises = Array.from(files).map((file) => simulateCloudUpload(file as File));
        const urls = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
      } catch (error) {
        console.error("Gallery upload failed");
      } finally {
        setIsUploadingGallery(false);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location || !formData.clientName) {
      alert("Please fill in all required fields (Name, Location, Client).");
      return;
    }

    const projectData: Partial<Project> = {
      name: formData.name,
      location: formData.location,
      googleMapLink: formData.googleMapLink,
      clientName: formData.clientName,
      clientPointOfContact: formData.clientPointOfContact,
      clientEmail: formData.clientEmail,
      type: formData.type,
      classification: formData.classification,
      budget: Number(formData.budget) || 0,
      squareFootage: Number(formData.squareFootage) || 0,
      description: formData.description,
      thumbnailUrl: formData.thumbnailUrl,
      gallery: formData.gallery
    };

    if (!projectToEdit) {
        projectData.financials = {
            totalInvoiced: 0,
            totalCollected: 0,
            totalExpenses: 0,
            pendingBills: 0
        };
    }

    onSave(projectData);
    onClose();
  };

  const handleDelete = () => {
    if (projectToEdit && onDelete) {
        onDelete(projectToEdit.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-4xl w-full animate-in fade-in zoom-in duration-200 border-2 border-black shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-zinc-50">
          <div>
            <h3 className="font-black text-black uppercase text-xl flex items-center gap-2">
               {projectToEdit ? <Pencil size={20} /> : <FilePlus size={20} />} 
               {projectToEdit ? 'Project Settings' : 'Create New Project'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
                {projectToEdit ? `Configure settings for ${projectToEdit.name}.` : 'Initialize a new project workspace.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Col: Core Info */}
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                          <Briefcase size={10} /> Project Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          autoFocus={!projectToEdit}
                          className="w-full border border-slate-300 p-3 text-sm font-bold text-black focus:border-black outline-none bg-white placeholder:font-normal" 
                          placeholder="e.g. Apex Tower Construction"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                              <MapPin size={10} /> Location <span className="text-red-500">*</span>
                            </label>
                            <input 
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                              placeholder="e.g. Dhaka, Gulshan-2"
                              value={formData.location}
                              onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                              <Globe size={10} /> Google Maps Link
                            </label>
                            <input 
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                              placeholder="https://maps.app.goo.gl/..."
                              value={formData.googleMapLink}
                              onChange={e => setFormData({...formData, googleMapLink: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Project Type</label>
                            <select 
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white"
                              value={formData.type}
                              onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                               {DEFAULT_PROJECT_TYPES.map(t => (
                                 <option key={t} value={t}>{t}</option>
                               ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Classification</label>
                            <select 
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white"
                              value={formData.classification}
                              onChange={e => setFormData({...formData, classification: e.target.value})}
                            >
                               {DEFAULT_CLASSIFICATIONS.map(c => (
                                 <option key={c} value={c}>{c}</option>
                               ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                              <DollarSign size={10} /> Budget
                            </label>
                            <input 
                              type="number"
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                              placeholder="0.00"
                              value={formData.budget}
                              onChange={e => setFormData({...formData, budget: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                              <Layout size={10} /> Area (sq ft)
                            </label>
                            <input 
                              type="number"
                              className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                              placeholder="5000"
                              value={formData.squareFootage}
                              onChange={e => setFormData({...formData, squareFootage: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Internal Description / Notes</label>
                        <textarea 
                            className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white h-24 resize-none" 
                            placeholder="Brief project summary, key constraints, etc..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Right Col: Client & Visuals */}
                <div className="w-full lg:w-80 space-y-6">
                    
                    {/* Cover Image */}
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
                           <Image size={10} /> Project Cover Image
                        </label>
                        <div 
                           className="w-full aspect-video bg-zinc-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative group overflow-hidden cursor-pointer hover:border-black transition-colors"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           {formData.thumbnailUrl ? (
                              <>
                                <img src={formData.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <p className="text-white text-xs font-bold uppercase flex items-center gap-2"><Pencil size={12}/> Change Cover</p>
                                </div>
                              </>
                           ) : (
                              <div className="text-center text-slate-400">
                                 <Image size={32} className="mx-auto mb-2 opacity-50" />
                                 <p className="text-xs font-bold uppercase">Upload Image</p>
                              </div>
                           )}
                           
                           {isUploadingImage && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                 <Loader2 size={24} className="animate-spin text-black" />
                              </div>
                           )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    {/* Gallery Images */}
                    <div>
                       <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1 justify-between">
                          <span className="flex items-center gap-1"><Image size={10} /> Project Gallery (Max 10)</span>
                          <span className="text-zinc-400">{formData.gallery.length}/10</span>
                       </label>
                       
                       <div className="grid grid-cols-4 gap-2">
                          {formData.gallery.map((url, index) => (
                             <div key={index} className="aspect-square bg-zinc-100 border border-slate-200 relative group overflow-hidden">
                                <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button 
                                   onClick={() => removeGalleryImage(index)}
                                   className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <X size={12} />
                                </button>
                             </div>
                          ))}
                          
                          {formData.gallery.length < 10 && (
                             <div 
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-black hover:text-black cursor-pointer transition-colors"
                             >
                                {isUploadingGallery ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                             </div>
                          )}
                       </div>
                       <input 
                          type="file" 
                          ref={galleryInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          multiple
                          onChange={handleGalleryUpload} 
                       />
                    </div>

                    {/* Client Details */}
                    <div className="bg-zinc-50 border border-slate-200 p-4">
                        <h4 className="text-xs font-bold uppercase border-b border-slate-200 pb-2 mb-3 text-slate-700">Client Details</h4>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">Client Name</label>
                                <input 
                                  className="w-full border border-slate-300 p-2 text-xs font-bold bg-white focus:border-black outline-none"
                                  value={formData.clientName}
                                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                                  placeholder="Company or Individual"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">Point of Contact</label>
                                <input 
                                  className="w-full border border-slate-300 p-2 text-xs bg-white focus:border-black outline-none"
                                  value={formData.clientPointOfContact}
                                  onChange={e => setFormData({...formData, clientPointOfContact: e.target.value})}
                                  placeholder="e.g. Mr. Rafiq"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 mb-1 block">Email</label>
                                <input 
                                  className="w-full border border-slate-300 p-2 text-xs bg-white focus:border-black outline-none"
                                  value={formData.clientEmail}
                                  onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                                  placeholder="client@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delete Project */}
                    {projectToEdit && onDelete && (
                       <div className="pt-6 mt-6 border-t border-slate-200">
                          <button 
                             onClick={handleDelete}
                             className="w-full border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-xs font-bold uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                          >
                             <Trash2 size={14} /> Delete Project
                          </button>
                       </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-zinc-50">
            <button 
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-600 text-xs font-bold uppercase hover:bg-white hover:border-slate-400 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="px-8 py-3 bg-black text-white text-xs font-bold uppercase hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
            >
                <Save size={14} /> {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
