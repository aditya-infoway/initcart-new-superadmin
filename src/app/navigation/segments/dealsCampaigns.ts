import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const dealsCampaigns: NavigationTree = {
  ...baseNavigationObj["dealsCampaigns"],
  childs: [
    {
      id: "dealsCampaigns.createCampaign",
      type: "item",
      path: "/deals-campaigns/create-campaign",
      title: "Create Campaign",
      icon: "dealsCampaigns.createCampaign",
    },
    {
      id: "dealsCampaigns.dealOfTheDay",
      type: "item",
      path: "/deals-campaigns/deal-of-the-day",
      title: "Deal Of The Day",
      icon: "dealsCampaigns.dealOfTheDay",
    },
    {
      id: "dealsCampaigns.flashDeal",
      type: "item",
      path: "/deals-campaigns/flash-deal",
      title: "Flash Deal",
      icon: "dealsCampaigns.flashDeal",
    },
    {
      id: "dealsCampaigns.featuredDeal",
      type: "item",
      path: "/deals-campaigns/featured-deal",
      title: "featured deal",
      icon: "dealsCampaigns.featuredDeal",
    },
  ],
};
