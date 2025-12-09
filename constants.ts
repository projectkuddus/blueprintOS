
import { Project, Role, Stage, TeamMember, StudioProfile, RolePermissions } from './types';

// Centralized Permission Logic - Simulates Core Account Configuration
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  // Full Access
  [Role.ARCHITECT_HEAD]: { canEdit: true, canUpload: true, canViewFinancials: true, canManageTeam: true },
  [Role.PROJECT_MANAGER]: { canEdit: true, canUpload: true, canViewFinancials: true, canManageTeam: true },
  [Role.ACCOUNT_MANAGER]: { canEdit: true, canUpload: true, canViewFinancials: true, canManageTeam: false },
  
  // Execution Team - Edit/Upload, No Financials
  [Role.ARCHITECT_SENIOR]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.ARCHITECT_JUNIOR]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.ENGINEER_MAIN]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.ENGINEER_STRUCTURAL]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.ENGINEER_SITE]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.CONSTRUCTION_MANAGER]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: true },
  [Role.SUPERVISOR]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.SITE_DOCUMENTATION]: { canEdit: true, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.PHOTOGRAPHER]: { canEdit: false, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.AWARD_SUBMISSION]: { canEdit: false, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.CARPENTER]: { canEdit: false, canUpload: false, canViewFinancials: false, canManageTeam: false },

  // Business / External - View Only or Limited
  [Role.CLIENT]: { canEdit: false, canUpload: false, canViewFinancials: false, canManageTeam: false },
  [Role.DEVELOPER]: { canEdit: false, canUpload: false, canViewFinancials: true, canManageTeam: false },
  [Role.MARKETING]: { canEdit: false, canUpload: true, canViewFinancials: false, canManageTeam: false },
  [Role.BUSINESS_ANALYST]: { canEdit: false, canUpload: false, canViewFinancials: true, canManageTeam: false },
};

export const DEFAULT_PROJECT_TYPES = [
  'Residential', 'Commercial', 'Hospitality', 'Healthcare', 'Institutional', 'Mixed-Use', 'Industrial'
];

export const DEFAULT_CLASSIFICATIONS = [
  'Public', 'Private', 'Semi-Public'
];

// Helper to generate a standard set of stages for a project
export const generateStandardStages = (currentActiveId: string): Stage[] => {
  const stageNames = [
    'Client Onboarding',
    'Ideation & Concept',
    'Deal Lock',
    'Functional Flow',
    'Final Design',
    'CAD Drawings',
    '3D Visualization',
    'Design Approval',
    'Construction Drawings',
    'Working Drawings',
    'Finish Material Selection',
    'Construction: Foundation',
    'Construction: Structure',
    'Finishing & Interiors',
    'Handover',
    'Maintenance',
    'Documentation & Publications'
  ];

  let foundActive = false;

  return stageNames.map((name, index) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let status: 'completed' | 'active' | 'pending' = 'pending';

    if (id === currentActiveId) {
      status = 'active';
      foundActive = true;
    } else if (!foundActive) {
      status = 'completed';
    }

    // Mock content for specific stages
    const assets = [];
    if (status === 'completed' || status === 'active') {
        if (name.includes('Ideation')) {
            assets.push({ id: `a-${index}-1`, title: 'Moodboard v1', type: 'image', url: 'https://picsum.photos/400/300?random=10', uploadedBy: 'Sadia Rahman', uploadDate: '2023-11-20', size: 5242880 }); // 5MB
            assets.push({ id: `a-${index}-2`, title: 'Initial Sketches', type: 'pdf', url: '#', uploadedBy: 'Sadia Rahman', uploadDate: '2023-11-22', size: 12582912 }); // 12MB
        }
        if (name.includes('CAD')) {
            assets.push({ id: `a-${index}-3`, title: 'Floor Plan L1', type: 'cad', url: '#', uploadedBy: 'Sadia Rahman', uploadDate: '2024-01-15', size: 45000000 }); // 45MB
        }
        if (name.includes('3D')) {
             assets.push({ id: `a-${index}-4`, title: 'Exterior Render', type: '3d', url: 'https://picsum.photos/400/300?random=11', uploadedBy: 'Visual Team', uploadDate: '2024-02-01', size: 250000000 }); // 250MB
        }
        if (name.includes('Construction')) {
             assets.push({ id: `a-${index}-5`, title: 'Site Inspection', type: 'image', url: 'https://picsum.photos/400/300?random=12', uploadedBy: 'Marcus Johnson', uploadDate: '2024-03-10', size: 8500000 }); // 8.5MB
        }
    }

    return {
      id,
      name,
      status,
      description: `Phase focused on ${name.toLowerCase()}.`,
      tasks: [
        { 
          id: `t-${index}-1`, 
          title: `Review ${name} requirements`, 
          description: `Conduct a thorough review of all ${name} prerequisites and ensure alignment with the client brief.`,
          benchmark: 'All stakeholders must sign off on the initial draft.',
          requirements: [
              'Review Client Brief v2',
              'Check local zoning regulations',
              'Prepare initial presentation deck'
          ],
          assignedTo: Role.ARCHITECT_HEAD, 
          assigneeName: 'Sadia Rahman',
          status: status === 'completed' ? 'completed' : 'pending', 
          dueDate: '2024-06-01' 
        }
      ],
      assets,
      discussions: [
          { id: `c-${index}`, author: 'Sadia Rahman', role: Role.ARCHITECT_HEAD, text: `Starting work on ${name}.`, timestamp: Date.now() - 10000000 }
      ],
      startDate: '2024-01-01'
    } as Stage;
  });
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Meghna Riverside Residence',
    location: 'Dhaka, BD',
    clientName: 'Jamal Ahmed',
    clientPointOfContact: 'Mrs. Ahmed (Wife)',
    type: 'Residential',
    classification: 'Private',
    squareFootage: 4500,
    budget: 25000000,
    financials: {
      totalInvoiced: 12000000,
      totalCollected: 10000000,
      totalExpenses: 8500000,
      pendingBills: 2000000,
      transactions: [
        { id: 'tx1', date: '2023-10-01', description: 'Initial Mobilization', amount: 5000000, type: 'invoice', status: 'paid' },
        { id: 'tx2', date: '2023-10-05', description: 'Payment Received', amount: 5000000, type: 'payment', status: 'paid', reference: 'CHK-992' },
        { id: 'tx3', date: '2024-01-15', description: 'Foundation Completion', amount: 7000000, type: 'invoice', status: 'paid' },
        { id: 'tx4', date: '2024-02-01', description: 'Partial Payment', amount: 5000000, type: 'payment', status: 'paid', reference: 'TRF-123' },
      ]
    },
    currentStageId: 'construction-structure',
    stages: generateStandardStages('construction-structure'),
    documents: [
      { id: 'd1', title: 'Site Safety Plan', type: 'pdf', url: '#', uploadedBy: 'Sadia Rahman', uploadDate: '2023-11-01', size: 2400000, verificationStatus: 'none' },
      { id: 'd2', title: 'BOQ_Final_v3.xlsx', type: 'document', url: '#', uploadedBy: 'Sadia Rahman', uploadDate: '2023-11-15', size: 850000, verificationStatus: 'none' },
      { id: 'd3', title: 'Signed Agreement', type: 'pdf', url: '#', uploadedBy: 'Jamal Ahmed', uploadDate: '2023-10-25', size: 1200000, verificationStatus: 'verified' }
    ],
    thumbnailUrl: 'https://picsum.photos/800/600?random=1',
    team: {
      [Role.ARCHITECT_HEAD]: 'Sadia Rahman',
      [Role.ARCHITECT_JUNIOR]: 'Emily Davis',
      [Role.ENGINEER_STRUCTURAL]: 'Tanvir Hasan',
      [Role.ENGINEER_SITE]: 'Marcus Johnson',
      [Role.CLIENT]: 'Jamal Ahmed',
      [Role.ACCOUNT_MANAGER]: 'Amanda Lewis',
      [Role.CARPENTER]: 'Rahim Miah',
      [Role.SITE_DOCUMENTATION]: 'Alex Lens'
    }
  },
  {
    id: '2',
    name: 'The Glass Pavilion',
    location: 'Gulshan-2, Dhaka',
    clientName: 'Technovista Ltd',
    clientPointOfContact: 'Mr. Rafiq (CTO)',
    type: 'Commercial',
    classification: 'Semi-Public',
    squareFootage: 12000,
    budget: 80000000,
    financials: {
      totalInvoiced: 1500000,
      totalCollected: 1000000,
      totalExpenses: 500000,
      pendingBills: 500000,
      transactions: [
        { id: 'tx5', date: '2024-03-01', description: 'Design Consultation Fee', amount: 1500000, type: 'invoice', status: 'pending' },
        { id: 'tx6', date: '2024-03-10', description: 'Advance Payment', amount: 1000000, type: 'payment', status: 'paid' },
      ]
    },
    currentStageId: 'ideation-concept',
    stages: generateStandardStages('ideation-concept'),
    documents: [],
    thumbnailUrl: 'https://picsum.photos/800/600?random=2',
    team: {
      [Role.ARCHITECT_HEAD]: 'Sadia Rahman',
      [Role.ARCHITECT_SENIOR]: 'James Wilson',
      [Role.CLIENT]: 'Elara Vance',
      [Role.MARKETING]: 'Creative Agency X',
      [Role.BUSINESS_ANALYST]: 'Tom Baker'
    }
  },
  {
    id: '3',
    name: 'Urban Loft Renovation',
    location: 'Banani, Dhaka',
    clientName: 'Liam Smith',
    clientPointOfContact: 'Liam Smith',
    type: 'Residential',
    classification: 'Private',
    squareFootage: 1800,
    budget: 4500000,
    financials: {
      totalInvoiced: 4000000,
      totalCollected: 4000000,
      totalExpenses: 2800000,
      pendingBills: 0,
      transactions: [
        { id: 'tx7', date: '2024-01-01', description: 'Full Project Fee', amount: 4000000, type: 'invoice', status: 'paid' },
        { id: 'tx8', date: '2024-01-02', description: 'Full Payment', amount: 4000000, type: 'payment', status: 'paid' },
      ]
    },
    currentStageId: 'handover',
    stages: generateStandardStages('handover'),
    documents: [],
    thumbnailUrl: 'https://picsum.photos/800/600?random=3',
    team: {
      [Role.ARCHITECT_HEAD]: 'Sadia Rahman',
      [Role.PHOTOGRAPHER]: 'LensCraft Studios',
      [Role.ACCOUNT_MANAGER]: 'Amanda Lewis',
      [Role.AWARD_SUBMISSION]: 'Sadia Rahman'
    }
  },
  {
    id: '4',
    name: 'Central City Hospital Wing',
    location: 'Chittagong',
    clientName: 'HealthFirst Systems',
    clientPointOfContact: 'Dr. Zafar',
    type: 'Healthcare',
    classification: 'Public',
    squareFootage: 45000,
    budget: 120000000,
    financials: {
      totalInvoiced: 20000000,
      totalCollected: 18000000,
      totalExpenses: 15000000,
      pendingBills: 2000000,
      transactions: []
    },
    currentStageId: 'functional-flow',
    stages: generateStandardStages('functional-flow'),
    documents: [],
    thumbnailUrl: 'https://picsum.photos/800/600?random=4',
    team: {
      [Role.ARCHITECT_HEAD]: 'Sadia Rahman',
      [Role.PROJECT_MANAGER]: 'Kenji Sato',
      [Role.ENGINEER_MAIN]: 'Tanvir Hasan',
      [Role.ACCOUNT_MANAGER]: 'Amanda Lewis',
      [Role.CONSTRUCTION_MANAGER]: 'Bill Gates (Simulated)'
    }
  },
  {
    id: '5',
    name: 'Grand Horizon Hotel',
    location: 'Cox\'s Bazar',
    clientName: 'Horizon Group',
    clientPointOfContact: 'Director of Ops',
    type: 'Hospitality',
    classification: 'Semi-Public',
    squareFootage: 85000,
    budget: 350000000,
    financials: {
      totalInvoiced: 5000000,
      totalCollected: 5000000,
      totalExpenses: 1000000,
      pendingBills: 0,
      transactions: []
    },
    currentStageId: 'client-onboarding',
    stages: generateStandardStages('client-onboarding'),
    documents: [],
    thumbnailUrl: 'https://picsum.photos/800/600?random=5',
    team: {
      [Role.ARCHITECT_HEAD]: 'Sadia Rahman',
      [Role.MARKETING]: 'Creative Agency X',
      [Role.DEVELOPER]: 'Horizon Dev Team'
    }
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Sadia Rahman', role: Role.ARCHITECT_HEAD, email: 'sadia@blueprint.os', monthlyCost: 85000, status: 'active', joinedDate: '2022-03-15' },
  { id: 'm2', name: 'Tanvir Hasan', role: Role.ENGINEER_STRUCTURAL, email: 'tanvir@blueprint.os', monthlyCost: 72000, status: 'active', joinedDate: '2022-06-01' },
  { id: 'm3', name: 'Marcus Johnson', role: Role.ENGINEER_SITE, email: 'marcus@blueprint.os', monthlyCost: 60000, status: 'active', joinedDate: '2023-01-10' },
  { id: 'm4', name: 'Amanda Lewis', role: Role.ACCOUNT_MANAGER, email: 'amanda@blueprint.os', monthlyCost: 55000, status: 'active', joinedDate: '2023-05-20' },
  { id: 'm5', name: 'LensCraft Studios', role: Role.PHOTOGRAPHER, email: 'contact@lenscraft.com', monthlyCost: 20000, status: 'active', joinedDate: '2024-02-01' },
  { id: 'm6', name: 'Creative Agency X', role: Role.MARKETING, email: 'hello@agencyx.com', monthlyCost: 45000, status: 'active', joinedDate: '2024-01-15' },
  { id: 'm7', name: 'Rahim Miah', role: Role.CARPENTER, email: 'rahim@works.com', monthlyCost: 12000, status: 'active', joinedDate: '2024-03-01' },
  { id: 'm8', name: 'Emily Davis', role: Role.ARCHITECT_JUNIOR, email: 'emily@blueprint.os', monthlyCost: 35000, status: 'active', joinedDate: '2023-09-01' },
  { id: 'm9', name: 'Kenji Sato', role: Role.PROJECT_MANAGER, email: 'kenji@blueprint.os', monthlyCost: 80000, status: 'active', joinedDate: '2023-02-01' },
  { id: 'm10', name: 'Sarah Jenkins', role: Role.ARCHITECT_SENIOR, email: 'sarah.j@blueprint.os', monthlyCost: 75000, status: 'inactive', joinedDate: '2021-01-15' },
];

export const MOCK_STUDIO_PROFILE: StudioProfile = {
  name: "Blueprint Architects Studio",
  tagline: "Designing the future, one blueprint at a time.",
  description: "Founded in 2015, Blueprint Architects Studio is an award-winning multidisciplinary firm specializing in sustainable residential complexes and high-tech commercial spaces. We believe in brutalist minimalism combined with organic functionality.",
  website: "www.blueprint-studio.com",
  email: "hello@blueprint-studio.com",
  location: "Dhaka, Bangladesh",
  foundedYear: 2015,
  specialties: ["Residential", "Sustainable Design", "Urban Planning"],
  logoUrl: "https://via.placeholder.com/150", 
  heroImageUrl: "https://picsum.photos/1200/400?grayscale"
};
