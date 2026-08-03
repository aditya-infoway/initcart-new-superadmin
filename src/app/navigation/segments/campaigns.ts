import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const campaigns: NavigationTree = {
  ...baseNavigationObj["campaigns"],
  childs: [
    {
      id: "campaigns.createCampaign",
      type: "item",
      path: "/campaigns/create-campaign",
      title: "Create Campaign",
      icon: "campaigns.createCampaign",
    },
    {
      id: "campaigns.vendorParticipationApproval",
      type: "item",
      path: "/campaigns/vendor-participation-approval",
      title: "Vendor Participation Approval",
      icon: "campaigns.vendorParticipationApproval",
    },
    {
      id: "campaigns.activeCampaignsList",
      type: "item",
      path: "/campaigns/active-campaigns-list",
      title: "Active Campaigns List",
      icon: "campaigns.activeCampaignsList",
    },
  ],
};
