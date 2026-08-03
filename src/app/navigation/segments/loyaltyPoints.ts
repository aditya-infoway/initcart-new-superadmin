import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const loyaltyPoints: NavigationTree = {
  ...baseNavigationObj["loyaltyPoints"],
  childs: [
    {
      id: "loyaltyPoints.create",
      type: "item",
      path: "/loyalty-points/create",
      title: "Loyalty Points create",
      icon: "loyaltyPoints.create",
    },
    {
      id: "loyaltyPoints.transaction",
      type: "item",
      path: "/loyalty-points/transaction",
      title: "Loyalty Points Transaction",
      icon: "loyaltyPoints.transaction",
    },
  ],
};
