import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const subscriptionManagement: NavigationTree = {
  ...baseNavigationObj["subscriptionManagement"],
  childs: [
    {
      id: "subscriptionManagement.list",
      type: "item",
      path: "/subscription-management",
      title: "Subscription Management",
      icon: "subscriptionManagement.list",
    },
  ],
};
