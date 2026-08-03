import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const settings: NavigationTree = {
  ...baseNavigationObj["settings"],
  childs: [
    {
      id: "settings.profile",
      type: "item",
      path: "/settings/profile",
      title: "Admin Profile",
      icon: "settings.profile",
    },
    {
      id: "general",
      type: "item",
      path: "/settings/general",
      title: "General",
      transKey: "nav.settings.general",
      icon: "settings.general",
    },
    {
      id: "appearance",
      type: "item",
      path: "/settings/appearance",
      title: "Appearance",
      transKey: "nav.settings.appearance",
      icon: "settings.appearance",
    },
  ],
};
