export interface WorkflowStepDefinition {
  id: string;
  requiredCapability?: string;
  guidance: string;
  notes?: string;
  optional?: boolean;
}

export interface WorkflowDefinition {
  name: string;
  title: string;
  description: string;
  objective: string;
  constraints?: string[];
  steps: WorkflowStepDefinition[];
}

export interface RuleDefinition {
  id: string;
  title: string;
  content: string;
  path: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  content: string;
  path: string;
}
