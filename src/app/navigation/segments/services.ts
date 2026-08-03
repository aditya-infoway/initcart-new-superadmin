import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const services: NavigationTree = {
  ...baseNavigationObj["services"],
  childs: [
    {
      id: "services.manageServices",
      type: "collapse",
      path: "/services/manage-services",
      title: "Manage Services",
      icon: "services.manageServices",
      childs: [
        {
          id: "services.manageServices.serviceCategories",
          type: "item",
          path: "/services/manage-services/service-categories",
          title: "Service Categories",
          icon: "services.manageServices.serviceCategories",
        },
        {
          id: "services.manageServices.serviceSubCategories",
          type: "item",
          path: "/services/manage-services/service-sub-categories",
          title: "Service Sub Categories",
          icon: "services.manageServices.serviceSubCategories",
        },
      ],
    },
    {
      id: "services.serviceInquiries",
      type: "item",
      path: "/services/service-inquiries",
      title: "Service Inquiries",
      icon: "services.serviceInquiries",
    },
    {
      id: "services.flashDealParticipation",
      type: "item",
      path: "/services/flash-deal-participation",
      title: "Flash Deal Participation",
      icon: "services.flashDealParticipation",
    },
    {
      id: "services.featuredServices",
      type: "item",
      path: "/services/featured-services",
      title: "Featured Services",
      icon: "services.featuredServices",
    },
  ],
};
