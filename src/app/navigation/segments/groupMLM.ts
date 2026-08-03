import { NavigationTree } from "@/@types/navigation";

export const groupMLM: NavigationTree = {
  id: "groupMLM",
  type: "collapse",
  path: "/agents-management",
  title: "MLM (Multi-Level Marketing)",
  icon: "groupMLM",
  childs: [
    // ── Agents Management ─────────────────────────────────────────────
    {
      id: "agentsManagement",
      type: "collapse",
      path: "/agents-management",
      title: "Agents Management",
      icon: "agentsManagement",
      childs: [
        { id: "agentsManagement.createAgent",           type: "item", path: "/agents-management/create-agent",             title: "Create Agent",              icon: "agentsManagement.createAgent" },
        { id: "agentsManagement.agentHierarchyTreeView",type: "item", path: "/agents-management/agent-hierarchy-tree-view",title: "Agent Hierarchy Tree View", icon: "agentsManagement.agentHierarchyTreeView" },
        { id: "agentsManagement.agentApproval",         type: "item", path: "/agents-management/agent-approval",           title: "Agent Approval",            icon: "agentsManagement.agentApproval" },
      ],
    },

    // ── Commissions & MLM ─────────────────────────────────────────────
    {
      id: "commissionsMLM",
      type: "collapse",
      path: "/commissions-mlm",
      title: "Commissions & MLM",
      icon: "commissionsMLM",
      childs: [
        { id: "commissionsMLM.commissionReports",  type: "item", path: "/commissions-mlm/commission-reports",  title: "Commission Reports",   icon: "commissionsMLM.commissionReports" },
        { id: "commissionsMLM.profitDistribution", type: "item", path: "/commissions-mlm/profit-distribution", title: "Profit Distribution",  icon: "commissionsMLM.profitDistribution" },
        { id: "commissionsMLM.mlmLevels",          type: "item", path: "/commissions-mlm/mlm-levels",          title: "MLM Levels",           icon: "commissionsMLM.mlmLevels" },
      ],
    },
  ],
};
