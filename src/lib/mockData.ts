import { User, Project, ConformanceRun, ConformanceResult, MaterialIndexVersion } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.martinez@acco.com',
    firstName: 'John',
    lastName: 'Martinez',
    role: 'Admin',
    status: 'Active',
    assignedProjects: ['proj-1', 'proj-2', 'proj-3'],
    lastLogin: new Date('2024-01-28T09:30:00'),
    createdAt: new Date('2023-06-15'),
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'user-2',
    email: 'sarah.chen@acco.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'User',
    status: 'Active',
    assignedProjects: ['proj-1', 'proj-2'],
    lastLogin: new Date('2024-01-27T14:20:00'),
    createdAt: new Date('2023-08-20'),
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'user-3',
    email: 'mike.johnson@acco.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'User',
    status: 'Active',
    assignedProjects: ['proj-2', 'proj-3'],
    lastLogin: new Date('2024-01-26T11:45:00'),
    createdAt: new Date('2023-09-10'),
    // No avatar - will show initials
  },
  {
    id: 'user-4',
    email: 'emily.davis@acco.com',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'User',
    status: 'Pending',
    assignedProjects: [],
    createdAt: new Date('2024-01-25'),
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'user-5',
    email: 'robert.wilson@acco.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    role: 'Admin',
    status: 'Active',
    assignedProjects: ['proj-1', 'proj-3'],
    lastLogin: new Date('2024-01-28T08:00:00'),
    createdAt: new Date('2023-05-01'),
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
];

// Mock Conformance Results
const mockConformanceResults: ConformanceResult[] = [
  {
    id: 'result-1',
    materialDescription: 'Centrifugal Chiller, Water-Cooled, 500 Ton Capacity, Variable Speed Drive',
    specSection: '23 64 16',
    division: 'Division 23 - HVAC',
    systemType: 'Chilled Water System',
    overallStatus: 'Pre-Approved',
    confidenceScore: 98,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'Water-cooled centrifugal chillers shall have a minimum capacity of 500 tons at ARI 550/590 conditions.',
        'Chillers shall be equipped with variable speed drives for capacity modulation and energy efficiency.',
      ],
      pageReferences: [234, 235],
      explanation: 'The submitted chiller meets all specification requirements for capacity, cooling type, and VSD equipment.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Trane CenTraVac CVHF Series - 500 Ton - Approved baseline equipment'],
      pageReferences: [45],
      explanation: 'This chiller model is listed in the approved Material Index as baseline equipment.',
    }],
  },
  {
    id: 'result-2',
    materialDescription: 'VAV Box with Hot Water Reheat, 2000 CFM, DDC Controls',
    specSection: '23 36 00',
    division: 'Division 23 - HVAC',
    systemType: 'Air Distribution',
    overallStatus: 'Pre-Approved',
    confidenceScore: 95,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'VAV terminal units shall be pressure-independent type with DDC controls.',
        'Units serving perimeter zones shall include hot water reheat coils.',
      ],
      pageReferences: [187, 188],
      explanation: 'VAV box specifications align with project requirements for airflow, controls, and reheat capability.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Titus?"VAV Units with Reheat - Approved'],
      pageReferences: [32],
      explanation: 'Product is in the approved materials list.',
    }],
  },
  {
    id: 'result-3',
    materialDescription: 'Fire Sprinkler Head, Pendant, Standard Response, 155°F, K-Factor 5.6',
    specSection: '21 13 13',
    division: 'Division 21 - Fire Suppression',
    systemType: 'Wet Pipe Sprinkler',
    overallStatus: 'Review Required',
    confidenceScore: 72,
    projectSpecEvidence: [{
      status: 'Potential Issue',
      chunks: [
        'Sprinkler heads in areas with high ceilings exceeding 20 feet shall be quick-response type.',
        'All sprinkler heads shall have a minimum K-factor of 5.6.',
      ],
      pageReferences: [156, 157],
      explanation: 'The submitted standard response sprinkler heads may not meet requirements for high-ceiling areas. Verify ceiling heights in installation locations.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Viking VK302 Pendant Sprinkler - Standard Response - Approved for standard ceiling heights'],
      pageReferences: [18],
      explanation: 'Product is approved but with ceiling height restrictions.',
    }],
    discrepancy: undefined,
  },
  {
    id: 'result-4',
    materialDescription: 'Copper Pipe, Type L, 4" Diameter, for Chilled Water',
    specSection: '23 21 13',
    division: 'Division 23 - HVAC',
    systemType: 'Hydronic Piping',
    overallStatus: 'Pre-Approved',
    confidenceScore: 99,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'Copper piping for chilled water systems 2-1/2 inches and larger shall be Type L.',
      ],
      pageReferences: [201],
      explanation: 'Type L copper pipe meets specification requirements for chilled water piping.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Mueller Copper Tube Type L - Approved for all hydronic applications'],
      pageReferences: [28],
      explanation: 'Standard approved material.',
    }],
  },
  {
    id: 'result-5',
    materialDescription: 'Ductwork Insulation, Fiberglass, 2" Thick, R-8',
    specSection: '23 07 13',
    division: 'Division 23 - HVAC',
    systemType: 'HVAC Insulation',
    overallStatus: 'Action Mandatory',
    confidenceScore: 45,
    projectSpecEvidence: [{
      status: 'Discrepancy',
      chunks: [
        'Ductwork insulation for supply air ducts shall have a minimum R-value of R-12.',
        'Insulation thickness shall be minimum 3 inches for all supply ductwork.',
      ],
      pageReferences: [178, 179],
      explanation: 'The submitted R-8, 2" insulation does NOT meet the specification requirement of R-12 minimum with 3" thickness.',
    }],
    materialIndexEvidence: [{
      status: 'Discrepancy',
      chunks: ['Owens Corning 703 - R-8 - NOT approved for supply duct applications requiring R-12+'],
      pageReferences: [35],
      explanation: 'Material Index explicitly excludes this product for high-R-value applications.',
    }],
    discrepancy: undefined,
  },
  {
    id: 'result-6',
    materialDescription: 'Air Handling Unit, 15,000 CFM, DX Cooling, Gas Heat',
    specSection: '23 73 13',
    division: 'Division 23 - HVAC',
    systemType: 'Air Handling',
    overallStatus: 'Review Required',
    confidenceScore: 68,
    projectSpecEvidence: [{
      status: 'Potential Issue',
      chunks: [
        'Air handling units shall be factory-assembled, draw-through configuration.',
        'Units shall include energy recovery wheels with minimum 70% effectiveness.',
      ],
      pageReferences: [220, 221],
      explanation: 'Submittal does not indicate energy recovery wheel. Verify if unit includes ERV or if waiver is needed.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Carrier 39M Series AHU - Approved with energy recovery options'],
      pageReferences: [42],
      explanation: 'Base unit is approved; energy recovery configuration needs verification.',
    }],
  },
  {
    id: 'result-7',
    materialDescription: 'Building Automation System Controller, DDC, BACnet MS/TP',
    specSection: '23 09 23',
    division: 'Division 23 - HVAC',
    systemType: 'Controls',
    overallStatus: 'Pre-Approved',
    confidenceScore: 94,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'All DDC controllers shall communicate via BACnet MS/TP protocol.',
        'Controllers shall be BTL listed.',
      ],
      pageReferences: [245],
      explanation: 'Controller meets BACnet and BTL listing requirements.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Johnson Controls FX-PC Series - BACnet MS/TP - BTL Listed - Approved'],
      pageReferences: [51],
      explanation: 'Product is on approved list.',
    }],
  },
  {
    id: 'result-8',
    materialDescription: 'Fire Pump, Electric Motor Driven, 1500 GPM, 125 PSI',
    specSection: '21 31 13',
    division: 'Division 21 - Fire Suppression',
    systemType: 'Fire Pump',
    overallStatus: 'Pre-Approved',
    confidenceScore: 91,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'Fire pump shall be horizontal split-case type with minimum 1500 GPM capacity at 125 PSI.',
        'Motor shall be electric, suitable for 480V/3Ph/60Hz power supply.',
      ],
      pageReferences: [162, 163],
      explanation: 'Fire pump meets all capacity, pressure, and electrical requirements.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Aurora Pump 411 Series - Fire Pump - UL/FM Listed - Approved'],
      pageReferences: [22],
      explanation: 'Listed in approved materials.',
    }],
  },
  {
    id: 'result-9',
    materialDescription: 'Exhaust Fan, Centrifugal, Belt-Drive, 5000 CFM',
    specSection: '23 34 16',
    division: 'Division 23 - HVAC',
    systemType: 'Exhaust Systems',
    overallStatus: 'Review Required',
    confidenceScore: 75,
    projectSpecEvidence: [{
      status: 'Potential Issue',
      chunks: [
        'Exhaust fans for kitchen applications shall be listed for grease-laden air service.',
        'Fan motors shall be located outside the airstream.',
      ],
      pageReferences: [195],
      explanation: 'Submittal does not specify if fan is rated for grease-laden air. Confirm application and fan rating.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Greenheck CUBE Series - General exhaust applications - Approved'],
      pageReferences: [38],
      explanation: 'Fan is approved for general exhaust; grease rating verification needed.',
    }],
  },
  {
    id: 'result-10',
    materialDescription: 'Refrigerant Piping, ACR Copper, 1-1/8" OD',
    specSection: '23 23 00',
    division: 'Division 23 - HVAC',
    systemType: 'Refrigerant Piping',
    overallStatus: 'Pre-Approved',
    confidenceScore: 97,
    projectSpecEvidence: [{
      status: 'Match',
      chunks: [
        'Refrigerant piping shall be ACR copper tubing, cleaned, dehydrated, and sealed.',
      ],
      pageReferences: [208],
      explanation: 'ACR copper meets specification for refrigerant piping.',
    }],
    materialIndexEvidence: [{
      status: 'Match',
      chunks: ['Mueller Streamline ACR Copper - Approved for all refrigerant applications'],
      pageReferences: [30],
      explanation: 'Standard approved material.',
    }],
  },
];

// Mock Conformance Runs
const mockConformanceRuns: ConformanceRun[] = [
  {
    id: 'run-1',
    projectId: 'proj-1',
    version: 1,
    status: 'Ready for Review',
    submittalFiles: [
      { id: 'f1', name: 'HVAC_Submittal_Package.pdf', size: 15728640, type: 'application/pdf', uploadProgress: 100, status: 'complete' },
      { id: 'f2', name: 'Equipment_Schedule.xlsx', size: 524288, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadProgress: 100, status: 'complete' },
    ],
    specificationFiles: [
      { id: 'f3', name: 'Project_Specifications_Div21-23.pdf', size: 52428800, type: 'application/pdf', uploadProgress: 100, status: 'complete' },
    ],
    materialIndexVersion: 'v2.1',
    results: mockConformanceResults,
    createdBy: 'user-2',
    createdAt: new Date('2024-01-26T10:30:00'),
    processingProgress: 100,
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Medical Center HVAC Renovation',
    jobId: 'DMC-2024-001',
    location: 'Los Angeles, CA',
    status: 'Active',
    conformanceStatus: 'Ready for Review',
    assignedUsers: [mockUsers[0], mockUsers[1], mockUsers[4]],
    conformanceRuns: mockConformanceRuns,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: 'proj-2',
    name: 'Tech Campus Building B Fire Suppression',
    jobId: 'TCB-2024-015',
    location: 'San Jose, CA',
    status: 'Active',
    conformanceStatus: 'Processing',
    assignedUsers: [mockUsers[0], mockUsers[1], mockUsers[2]],
    conformanceRuns: [{
      id: 'run-2',
      projectId: 'proj-2',
      version: 1,
      status: 'Processing',
      submittalFiles: [
        { id: 'f4', name: 'Fire_Suppression_Package.pdf', size: 8388608, type: 'application/pdf', uploadProgress: 100, status: 'complete' },
      ],
      specificationFiles: [
        { id: 'f5', name: 'Division_21_Specs.pdf', size: 31457280, type: 'application/pdf', uploadProgress: 100, status: 'complete' },
      ],
      materialIndexVersion: 'v2.1',
      results: [],
      createdBy: 'user-3',
      createdAt: new Date('2024-01-28T08:00:00'),
      processingProgress: 65,
    }],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: 'proj-3',
    name: 'Airport Terminal Expansion HVAC',
    jobId: 'ATE-2024-042',
    location: 'Phoenix, AZ',
    status: 'Planning',
    assignedUsers: [mockUsers[0], mockUsers[2], mockUsers[4]],
    conformanceRuns: [],
    createdBy: 'user-5',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'proj-4',
    name: 'Hotel Resort Chiller Plant',
    jobId: 'HRC-2023-089',
    location: 'San Diego, CA',
    status: 'Completed',
    conformanceStatus: 'Completed',
    assignedUsers: [mockUsers[0], mockUsers[1]],
    conformanceRuns: [],
    createdBy: 'user-1',
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'proj-5',
    name: 'University Science Building Renovation',
    jobId: 'USB-2024-003',
    location: 'Berkeley, CA',
    status: 'On Hold',
    assignedUsers: [mockUsers[0]],
    conformanceRuns: [],
    createdBy: 'user-1',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
  },
];

// Mock Material Index Versions
export const mockMaterialIndexVersions: MaterialIndexVersion[] = [
  {
    id: 'mi-1',
    versionNumber: 'v2.1',
    name: 'Q1 2024 Material Standards',
    isActive: true,
    files: [
      { id: 'mf1', name: 'ACCO_Material_Index_2024_Q1.xlsx', size: 2097152, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadProgress: 100, status: 'complete' },
      { id: 'mf2', name: 'Approved_Equipment_List.pdf', size: 5242880, type: 'application/pdf', uploadProgress: 100, status: 'complete' },
    ],
    uploadedBy: 'John Martinez',
    uploadedAt: new Date('2024-01-05'),
    itemCount: 1247,
  },
  {
    id: 'mi-2',
    versionNumber: 'v2.0',
    name: 'Q4 2023 Material Standards',
    isActive: false,
    files: [
      { id: 'mf3', name: 'ACCO_Material_Index_2023_Q4.xlsx', size: 1887436, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadProgress: 100, status: 'complete' },
    ],
    uploadedBy: 'Robert Wilson',
    uploadedAt: new Date('2023-10-02'),
    itemCount: 1189,
  },
  {
    id: 'mi-3',
    versionNumber: 'v1.9',
    name: 'Q3 2023 Material Standards',
    isActive: false,
    files: [
      { id: 'mf4', name: 'ACCO_Material_Index_2023_Q3.xlsx', size: 1677721, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadProgress: 100, status: 'complete' },
    ],
    uploadedBy: 'John Martinez',
    uploadedAt: new Date('2023-07-01'),
    itemCount: 1102,
  },
];

// Division options for filtering
export const divisionOptions = [
  { value: '', label: 'All Divisions' },
  { value: 'Division 21 - Fire Suppression', label: 'Division 21 - Fire Suppression' },
  { value: 'Division 23 - HVAC', label: 'Division 23 - HVAC' },
];

// System type options for filtering
export const systemTypeOptions = [
  { value: '', label: 'All Systems' },
  { value: 'Air Distribution', label: 'Air Distribution' },
  { value: 'Air Handling', label: 'Air Handling' },
  { value: 'Chilled Water System', label: 'Chilled Water System' },
  { value: 'Controls', label: 'Controls' },
  { value: 'Exhaust Systems', label: 'Exhaust Systems' },
  { value: 'Fire Pump', label: 'Fire Pump' },
  { value: 'HVAC Insulation', label: 'HVAC Insulation' },
  { value: 'Hydronic Piping', label: 'Hydronic Piping' },
  { value: 'Refrigerant Piping', label: 'Refrigerant Piping' },
  { value: 'Wet Pipe Sprinkler', label: 'Wet Pipe Sprinkler' },
];

// Approval reason options
export const approvalReasonOptions = [
  { value: 'equivalent', label: 'Equivalent product' },
  { value: 'customer-approved', label: 'Customer approved substitution' },
  { value: 'engineering-judgment', label: 'Engineering judgment' },
  { value: 'other', label: 'Other' },
];
