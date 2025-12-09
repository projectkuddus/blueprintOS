
export enum Role {
  // Core / Design Team
  ARCHITECT_HEAD = 'Principal Architect',
  ARCHITECT_SENIOR = 'Senior Architect',
  ARCHITECT_JUNIOR = 'Junior Architect',
  PROJECT_MANAGER = 'Project Manager',
  
  // Engineering & Site
  ENGINEER_STRUCTURAL = 'Structural Engineer',
  ENGINEER_SITE = 'Site Engineer',
  ENGINEER_MAIN = 'Main Engineer',
  CONSTRUCTION_MANAGER = 'Construction Manager',
  SUPERVISOR = 'Construction Supervisor',
  CARPENTER = 'Head Carpenter',
  
  // Client & Business
  CLIENT = 'Client',
  DEVELOPER = 'Developer',
  ACCOUNT_MANAGER = 'Account Manager',
  BUSINESS_ANALYST = 'Business Analyst',
  MARKETING = 'Marketing Dept',
  
  // Specialized / Documentation
  PHOTOGRAPHER = 'Project Photographer',
  SITE_DOCUMENTATION = 'Site Documentation',
  AWARD_SUBMISSION = 'Award Submission Team'
}

export interface RolePermissions {
  canEdit: boolean;      // Can add/edit tasks, move stages
  canUpload: boolean;    // Can upload assets
  canViewFinancials: boolean; // Can view budget/invoices
  canManageTeam: boolean; // Can add/remove people
}

export type AssetType = 'image' | 'pdf' | 'cad' | '3d' | 'document';

// New Categories
export type ProjectType = string;
export type ProjectClassification = string;

export interface Asset {
  id: string;
  title: string;
  type: AssetType;
  url: string;
  uploadedBy: string; // Name of uploader
  uploadDate: string;
  size?: number; // Size in bytes
  verificationStatus?: 'verified' | 'pending' | 'none'; // Status for official docs
}

export interface Comment {
  id: string;
  author: string;
  role: Role;
  text: string;
  timestamp: number;
  attachments?: Asset[]; // Added support for chat attachments
}

export interface Task {
  id: string;
  title: string;
  description?: string; // Detailed description of the work
  benchmark?: string; // Standard/Goal (e.g. "Must meet ISO 9001")
  requirements?: string[]; // Specific checklist items within the task
  assignedTo: Role;
  assigneeName?: string; // Specific team member name
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completedAt?: number;
  dependencies?: string[]; // IDs of prerequisite tasks
}

export interface ExpenseItem {
  id: string;
  description: string;
  category: 'Material' | 'Labor' | 'Service' | 'Permit' | 'Overhead';
  vendor?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalAmount: number;
  date: string;
  status: 'estimated' | 'purchased' | 'invoiced';
  invoiceId?: string; // Link to generated invoice
}

export interface Stage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  description?: string;
  tasks: Task[];
  assets: Asset[];
  discussions: Comment[];
  participants?: string[]; // List of names who have access/tasks in this stage
  startDate?: string;
  endDate?: string;
  expenses: ExpenseItem[]; // NEW: Granular financial tracking per phase
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'invoice' | 'payment' | 'expense';
  status: 'pending' | 'paid' | 'overdue';
  reference?: string; // Invoice # or Check #
  items?: ExpenseItem[]; // Linked items for auto-invoicing
  stageId?: string; // Link transaction to a specific project phase
}

export interface ProjectFinancials {
  totalInvoiced: number;
  totalCollected: number;
  totalExpenses: number;
  pendingBills: number;
  transactions?: Transaction[]; // Detailed history
}

export interface Project {
  id: string;
  name: string;
  description?: string; // Added description field
  location: string;
  googleMapLink?: string; // Link to Google Maps
  clientName: string;
  clientPointOfContact?: string; // Responsible person on client side
  clientEmail?: string;
  type: ProjectType;
  classification: ProjectClassification;
  squareFootage: number;
  budget: number;
  financials: ProjectFinancials;
  currentStageId: string; // Refers to Stage.id
  stages: Stage[]; // Ordered list of stages
  documents: Asset[]; // Global project documents (Agreements, BOQ, Safety Plan)
  thumbnailUrl: string;
  gallery?: string[]; // Additional project photos (Max 10)
  team: Partial<Record<Role, string>>;
  history: ProjectActivity[];
}

export interface ProjectActivity {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  email: string;
  monthlyCost: number; // Salary or Retainer
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  bio?: string;
  avatarUrl?: string;
}

export interface StudioProfile {
  name: string;
  tagline: string;
  description: string;
  website: string;
  email: string;
  location: string;
  foundedYear: number;
  logoUrl: string;
  heroImageUrl: string;
  specialties: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  projectId?: string; // Optional ID to link to a project
}
