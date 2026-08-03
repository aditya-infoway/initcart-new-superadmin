import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const branch: NavigationTree = {
  ...baseNavigationObj["branch"],
  childs: [
    {
      id: "branch.itemVerification",
      type: "item",
      path: "/branch/item-verification",
      title: "Item Verification",
      icon: "branch.itemVerification",
    },
  ],
};
