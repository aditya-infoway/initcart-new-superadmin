import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const serviceApprovals: NavigationTree = {
  ...baseNavigationObj["serviceApprovals"],
  childs: [
    {
      id: "serviceApprovals.approvalRequests",
      type: "item",
      path: "/service-approvals/approval-requests",
      title: "Service Approval Requests",
      icon: "serviceApprovals.approvalRequests",
    },
  ],
};
