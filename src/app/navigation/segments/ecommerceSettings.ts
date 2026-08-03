import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const ecommerceSettings: NavigationTree = {
  ...baseNavigationObj["ecommerceSettings"],
  childs: [
    {
      id: "ecommerceSettings.shippingConfiguration",
      type: "item",
      path: "/ecommerce-settings/shipping-configuration",
      title: "Shipping Configuration",
      icon: "ecommerceSettings.shippingConfiguration",
    },
    {
      id: "ecommerceSettings.paymentGatewaySetup",
      type: "item",
      path: "/ecommerce-settings/payment-gateway-setup",
      title: "Payment Gateway Setup",
      icon: "ecommerceSettings.paymentGatewaySetup",
    },
    {
      id: "ecommerceSettings.returnRefundPolicy",
      type: "item",
      path: "/ecommerce-settings/return-refund-policy",
      title: "Return & Refund Policy",
      icon: "ecommerceSettings.returnRefundPolicy",
    },
  ],
};
