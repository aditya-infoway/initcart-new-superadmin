import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const reports: NavigationTree = {
  ...baseNavigationObj["reports"],
  childs: [
    {
      id: "reports.salesReport",
      type: "item",
      path: "/reports/sales-report",
      title: "Sales Report",
      icon: "reports.salesReport",
    },
  ],
};
