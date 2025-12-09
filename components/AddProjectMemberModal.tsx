
import React, { useState } from 'react';
import { Role, TeamMember, Project } from '../types';
import { X, UserPlus, Briefcase, User } from 'lucide-react';

interface AddProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (role: Role, memberName: string) => void;
  teamMembers: TeamMember[];
  currentProject: Project;
}

const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({ 
  isOpen, onClose, onAdd, teamMembers, currentProject 
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  if (!isOpen) return null;

  // Filter roles that are NOT yet assigned in this project
  const availableRoles = Object.values(Role).filter(role => !currentProject.team[role]);

  // Only show active team members
  const activeTeamMembers = teamMembers.filter(m => m.status === 'active' || m.status === 'pending');

  const handleSubmit = () => {
    if (selectedRole && selectedMemberId) {
      const member = teamMembers.find(m => m.id === selectedMemberId);
      if (member) {
        onAdd(selectedRole, member.name);
        onClose();
        setSelectedRole('');
        setSelectedMemberId('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full animate-in fade-in zoom-in duration-200 border-2 border-black shadow-2xl p-6">
        
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-black uppercase flex items-center gap-2">
            <UserPlus size={20} /> Add to Project Team
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-50 p-4 border border-slate-200 text-xs text-slate-500 mb-4">
             <p>Assign an existing studio member to a specific role for <strong>{currentProject.name}</strong>.</p>
          </div>

          {/* Role Selection */}
          <div>
             <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
               <Briefcase size={10} /> Select Role (Empty Positions)
             </label>
             <select 
               className="w-full border border-slate-300 p-3 text-sm focus:border-black outline-none bg-white font-bold"
               value={selectedRole}
               onChange={(e) => setSelectedRole(e.target.value as Role)}
             >
                <option value="">-- Choose an open role --</option>
                {availableRoles.map(role => (
                   <option key={role} value={role}>{role}</option>
                ))}
             </select>
             {availableRoles.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1 font-bold">All roles are currently filled.</p>
             )}
          </div>

          {/* Member Selection */}
          <div>
             <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block flex items-center gap-1">
               <User size={10} /> Select Team Member
             </label>
             <select 
               className="w-full border border-slate-300 p-3 text-sm focus:border-black outline-none bg-white"
               value={selectedMemberId}
               onChange={(e) => setSelectedMemberId(e.target.value)}
             >
                <option value="">-- Choose a person --</option>
                {activeTeamMembers.map(member => (
                   <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                   </option>
                ))}
             </select>
          </div>

          <button 
             onClick={handleSubmit}
             disabled={!selectedRole || !selectedMemberId}
             className="w-full bg-black text-white py-3 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
             Assign to Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectMemberModal;
