import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const marketingBanners: NavigationTree = {
  ...baseNavigationObj["marketingBanners"],
  childs: [
    {
      id: "marketingBanners.gym",
      type: "item",
      path: "/marketing-banners/gym",
      title: "Gym",
      icon: "marketingBanners.gym",
    },
    {
      id: "marketingBanners.saloon",
      type: "item",
      path: "/marketing-banners/saloon",
      title: "Saloon",
      icon: "marketingBanners.saloon",
    },
    {
      id: "marketingBanners.travelAgency",
      type: "item",
      path: "/marketing-banners/travel-agency",
      title: "Travel Agency",
      icon: "marketingBanners.travelAgency",
    },
    {
      id: "marketingBanners.realEstate",
      type: "item",
      path: "/marketing-banners/real-estate",
      title: "Real Estate",
      icon: "marketingBanners.realEstate",
    },
    {
      id: "marketingBanners.techIndustry",
      type: "item",
      path: "/marketing-banners/tech-industry",
      title: "Tech Industry",
      icon: "marketingBanners.techIndustry",
    },
    {
      id: "marketingBanners.professional",
      type: "item",
      path: "/marketing-banners/professional",
      title: "Professional",
      icon: "marketingBanners.professional",
    },
    {
      id: "marketingBanners.finance",
      type: "item",
      path: "/marketing-banners/finance",
      title: "Finance",
      icon: "marketingBanners.finance",
    },
    {
      id: "marketingBanners.healthcare",
      type: "item",
      path: "/marketing-banners/healthcare",
      title: "Healthcare",
      icon: "marketingBanners.healthcare",
    },
    {
      id: "marketingBanners.education",
      type: "item",
      path: "/marketing-banners/education",
      title: "Education",
      icon: "marketingBanners.education",
    },
    {
      id: "marketingBanners.restaurant",
      type: "item",
      path: "/marketing-banners/restaurant",
      title: "Restaurant",
      icon: "marketingBanners.restaurant",
    },
    {
      id: "marketingBanners.hotel",
      type: "item",
      path: "/marketing-banners/hotel",
      title: "Hotel",
      icon: "marketingBanners.hotel",
    },
  ],
};
