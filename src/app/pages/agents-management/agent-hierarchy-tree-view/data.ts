// pages/agent-hierarchy/data.ts

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

export const getGradient = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'pos': return 'from-purple-500 to-purple-700';
    case 'society': return 'from-teal-500 to-teal-700';
    case 'master': return 'from-purple-500 to-purple-700';
    case 'senior': return 'from-indigo-500 to-indigo-700';
    case 'junior': return 'from-teal-500 to-teal-700';
    default: return 'from-blue-500 to-blue-700';
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const buildParentMap = (node: { id: number; children: any[] }, parentId: number | null = null): Map<number, number | null> => {
  const map = new Map<number, number | null>();
  map.set(node.id, parentId);
  node.children.forEach((child: any) => {
    const childMap = buildParentMap(child, node.id);
    childMap.forEach((value, key) => map.set(key, value));
  });
  return map;
};

export const buildDisplayTree = (data: UplineTreeResponse): DisplayNode => {
  const { root, upline_tree } = data;

  if (upline_tree.length === 0) {
    return {
      id: root.id,
      full_name: root.full_name,
      username: root.username,
      email: root.email,
      phone: root.phone || '',
      depth: 0,
      agent: root.agent,
      children: [],
      isDirectPath: true,
      isSelf: true,
    };
  }

  const sibToLeaf = (sib: RawSibling, displayDepth: number): DisplayNode => ({
    id: sib.id,
    full_name: sib.full_name,
    username: sib.username,
    email: sib.email,
    phone: sib.phone || '',
    depth: displayDepth,
    agent: sib.id === root.id ? root.agent : sib.agent,
    children: [],
    isDirectPath: sib.is_direct_parent,
    isSelf: sib.id === root.id,
  });

  const buildNode = (levelIndex: number, displayDepth: number): DisplayNode => {
    const lvl = upline_tree[levelIndex];
    let children: DisplayNode[];

    if (levelIndex === 0) {
      children = lvl.siblings.map(sib => sibToLeaf(sib, displayDepth + 1));
    } else {
      children = lvl.siblings.map(sib => {
        if (sib.is_direct_parent) {
          return buildNode(levelIndex - 1, displayDepth + 1);
        }
        return sibToLeaf(sib, displayDepth + 1);
      });
    }

    return {
      id: lvl.id,
      full_name: lvl.full_name,
      username: lvl.username,
      email: lvl.email,
      phone: lvl.phone || '',
      depth: lvl.level,
      agent: lvl.agent,
      children,
      isDirectPath: true,
    };
  };

  return buildNode(upline_tree.length - 1, 1);
};

export const statusOptions = [
  { id: 'all', label: 'All Status' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];