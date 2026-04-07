export interface RepoMeta {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  default_branch: string;
}

export interface RepoFiles {
  packageJson: string;
  tsconfig: string;
  dockerfile: string;
  requirements: string;
  composerJson: string;
  gemfile: string;
  cargoToml: string;
  goMod: string;
  envExample: string;
  ciConfig: string;
}

export interface RepoData {
  meta: RepoMeta;
  readme: string;
  structure: string[];
  tree: TreeItem[];
  files: RepoFiles;
}

export interface TreeItem {
  path: string;
  type: string;
}

export interface ArchitectAnalysis {
  techStack: string[];
  architecture: string;
  patterns: string[];
  dataFlow: string;
  infraLayer: string;
}

export interface FeatureAnalysis {
  coreFeatures: string[];
  allFeatures: string[];
  missingFeatures: string[];
  userFlows: string[];
}

export interface CriticAnalysis {
  issues: string[];
  securityRisks: string[];
  scalabilityProblems: string[];
  improvements: string[];
  codeQuality: string;
}

export interface BuilderAnalysis {
  rebuildPlan: string;
  folderStructure: string;
  techRecommendations: string[];
  mvpPrompt: string;
  saasPrompt: string;
  estimatedBuildTime: string;
}

export interface RepoAnalysis {
  architect: ArchitectAnalysis;
  features: FeatureAnalysis;
  critic: CriticAnalysis;
  builder: BuilderAnalysis;
  meta: {
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratedProject {
  files: GeneratedFile[];
  instructions: string;
  stack: string;
}
