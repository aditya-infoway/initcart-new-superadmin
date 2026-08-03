import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const posMaster: NavigationTree = {
  ...baseNavigationObj["posMaster"],
  childs: [
    {
      id: "posMaster.branchMaster",
      type: "item",
      path: "/pos-master/branch-master",
      title: "Branch Master",
      icon: "posMaster.branchMaster",
    },
  ],
};
