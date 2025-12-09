
import React, { useState, useRef } from 'react';
import { TeamMember, Role } from '../types';
import { X, User, Lock, Upload, Save, ShieldCheck } from 'lucide-react';

interface UserProfileModalProps {
  currentUser: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: TeamMember) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ currentUser, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [formData, setFormData] = useState<TeamMember>({ ...currentUser });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local URL for preview
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, avatarUrl: url });
    }
  };

  const handleSave = () => {
    if (activeTab === 'security') {
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match.");
            return;
        }
        // In a real app, handle password update API here
        alert("Password updated successfully.");
        onClose();
    } else {
        onSave(formData);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-2xl w-full animate-in fade-in zoom-in duration-200 border-2 border-black shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h3 className="font-black text-black uppercase text-xl flex items-center gap-2">
               <User size={20} /> User Profile
            </h3>
            <p className="text-xs text-slate-500 font-medium">Manage your personal details and security settings.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${activeTab === 'general' ? 'bg-black text-white' : 'text-slate-500 hover:bg-zinc-50'}`}
            >
                <User size={14} /> General Info
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-4 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 ${activeTab === 'security' ? 'bg-black text-white' : 'text-slate-500 hover:bg-zinc-50'}`}
            >
                <Lock size={14} /> Security & Password
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-zinc-50/50">
            {activeTab === 'general' ? (
                <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 border-2 border-black bg-white flex items-center justify-center overflow-hidden relative group">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} className="text-slate-300" />
                            )}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white flex-col gap-1"
                            >
                                <Upload size={16} />
                                <span className="text-[8px] font-bold uppercase">Change</span>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-black uppercase text-sm">Profile Picture</h4>
                            <p className="text-xs text-slate-500 mb-2">Upload a professional headshot. Max 2MB.</p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[10px] font-bold uppercase bg-white border border-slate-300 px-3 py-1 hover:border-black hover:text-black transition-colors"
                            >
                                Select Image
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Full Name</label>
                            <input 
                                className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Role (Read Only)</label>
                            <div className="w-full border border-slate-200 bg-zinc-100 p-2 text-sm text-slate-500 cursor-not-allowed">
                                {formData.role}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Email Address</label>
                            <input 
                                type="email"
                                className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Short Bio</label>
                            <textarea 
                                className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white h-24 resize-none" 
                                placeholder="Briefly describe your role and expertise..."
                                value={formData.bio || ''}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-w-md mx-auto py-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 text-amber-800 text-xs flex gap-3 items-start">
                        <ShieldCheck size={16} className="mt-0.5" />
                        <div>
                            <p className="font-bold uppercase mb-1">Secure Account</p>
                            <p>Ensure your password is at least 8 characters long and includes a mix of numbers and symbols.</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Current Password</label>
                        <input 
                            type="password"
                            className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                            value={passwordData.current}
                            onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">New Password</label>
                        <input 
                            type="password"
                            className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                            value={passwordData.new}
                            onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Confirm New Password</label>
                        <input 
                            type="password"
                            className="w-full border border-slate-300 p-2 text-sm focus:border-black outline-none bg-white" 
                            value={passwordData.confirm}
                            onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white">
            <button 
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-600 text-xs font-bold uppercase hover:bg-zinc-50 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
                <Save size={14} /> Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
