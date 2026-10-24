import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const webSite: NavigationTree = {
  ...baseNavigationObj["webSite"],
  childs: [
    {
      id: "webSite.sliderImage",
      type: "item",
      path: "/web-site/slider-image",
      title: "Slider Image",
      // transKey: "nav.webSite.sliderImage",
      icon: "webSite.sliderImage",
    },
    {
      id: "webSite.adsManager",
      type: "item",
      path: "/web-site/ads-manager",
      title: "Ads Manager",
      // transKey: "nav.webSite.adsManager",
      icon: "webSite.adsManager",
    },
    {
      id: "webSite.mobileBanner",
      type: "item",
      path: "/web-site/mobile-banner",
      title: "Mobile Banner",
      // transKey: "nav.webSite.mobileBanner",
      icon: "webSite.mobileBanner",
    },
    {
      id: "webSite.TopSellerManagement",
      type: "item",
      path: "/web-site/topsellermanagement",
      title: "Top Seller Management",
      icon: "webSite.topsellermanagement",
    },
  ],
};
