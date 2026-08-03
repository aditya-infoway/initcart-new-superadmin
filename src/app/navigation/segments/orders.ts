import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const orders: NavigationTree = {
  ...baseNavigationObj["orders"],
  childs: [
    {
      id: "orders.allOrders",
      type: "item",
      path: "/orders/all-orders",
      title: "All Orders",
      icon: "orders.allOrders",
    },
    {
      id: "orders.orderProfitReport",
      type: "item",
      path: "/orders/order-profit-report",
      title: "Order Profit Report",
      icon: "orders.orderProfitReport",
    },
  ],
};
