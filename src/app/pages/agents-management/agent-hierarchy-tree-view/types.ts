// src/pages/agent-hierarchy/types.ts

export interface AgentInfo {
  agent_id: number;
  agent_type: string;
  status: string;
  total_sales: number;
  is_active: boolean;
  referral_code?: string;
}

export interface UserBrief {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
}

export interface SearchResult extends UserBrief {
  agent: AgentInfo | null;
}

export interface AgentTypeStat {
  type: string;
  label: string;
  count: number;
}

export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_sales: number;
  total_users: number;
  top_level_agents: number;
  by_type: AgentTypeStat[];
}

export interface DownlineTreeNodeData {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  user_type: string;
  depth: number;
  agent: AgentInfo | null;
  downline_count: number;
  children: DownlineTreeNodeData[];
}

export interface DownlineResponse {
  target_user: UserBrief;
  max_depth: number;
  total_downline: number;
  root: DownlineTreeNodeData;
}

export interface RawSibling {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  agent: AgentInfo | null;
  is_active: boolean;
  is_direct_parent: boolean;
}

export interface RawUplineNode {
  level: number;
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  agent: AgentInfo | null;
  siblings: RawSibling[];
}

export interface RawRoot {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  depth: number;
  agent: AgentInfo | null;
  siblings: RawSibling[];
}

export interface UplineTreeResponse {
  target_user: UserBrief;
  max_levels: number;
  upline_count: number;
  root: RawRoot;
  upline_tree: RawUplineNode[];
}

export interface DisplayNode {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  depth: number;
  agent: AgentInfo | null;
  children: DisplayNode[];
  isDirectPath?: boolean;
  isSelf?: boolean;
}

export type HierarchyMode = "downline" | "upline";
export type ViewMode = "tree" | "list";