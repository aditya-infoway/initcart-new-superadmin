import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const commissionsMLM: NavigationTree = {
  ...baseNavigationObj["commissionsMLM"],
  childs: [
    {
      id: "commissionsMLM.commissionReports",
      type: "item",
      path: "/commissions-mlm/commission-reports",
      title: "Commission Reports",
      icon: "commissionsMLM.commissionReports",
    },
    {
      id: "commissionsMLM.profitDistribution",
      type: "item",
      path: "/commissions-mlm/profit-distribution",
      title: "Profit Distribution",
      icon: "commissionsMLM.profitDistribution",
    },
    {
      id: "commissionsMLM.mlmLevels",
      type: "item",
      path: "/commissions-mlm/mlm-levels",
      title: "MLM Levels",
      icon: "commissionsMLM.mlmLevels",
    },
  ],
};
