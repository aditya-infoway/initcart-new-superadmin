import { NavigationTree } from "@/@types/navigation";

export const groupWebSite: NavigationTree = {
  id: "groupWebSite",
  type: "collapse",
  path: "/web-site",
  title: "Web Site",
  icon: "groupWebSite",
  childs: [
    // ── Web Site ──────────────────────────────────────────────────────
    {
      id: "webSite.sliderImage",
      type: "item",
      path: "/web-site/slider-image",
      title: "Slider Image",
      icon: "webSite.sliderImage",
    },
    {
      id: "webSite.adsManager",
      type: "item",
      path: "/web-site/ads-manager",
      title: "Ads Manager",
      icon: "webSite.adsManager",
    },
    {
      id: "webSite.mobileBanner",
      type: "item",
      path: "/web-site/mobile-banner",
      title: "Mobile Banner",
      icon: "webSite.mobileBanner",
    },
  ],
};
