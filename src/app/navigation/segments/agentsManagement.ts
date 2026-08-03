import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const agentsManagement: NavigationTree = {
  ...baseNavigationObj["agentsManagement"],
  childs: [
    {
      id: "agentsManagement.createAgent",
      type: "item",
      path: "/agents-management/create-agent",
      title: "Create Agent",
      icon: "agentsManagement.createAgent",
    },
    {
      id: "agentsManagement.agentHierarchyTreeView",
      type: "item",
      path: "/agents-management/agent-hierarchy-tree-view",
      title: "Agent Hierarchy Tree View",
      icon: "agentsManagement.agentHierarchyTreeView",
    },
    {
      id: "agentsManagement.agentApproval",
      type: "item",
      path: "/agents-management/agent-approval",
      title: "Agent Approval",
      icon: "agentsManagement.agentApproval",
    },
  ],
};
