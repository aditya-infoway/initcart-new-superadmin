import { NavigationTree } from "@/@types/navigation";

export const groupPOS: NavigationTree = {
  id: "groupPOS",
  type: "collapse",
  path: "/pos-master",
  title: "POS (Point of Sale)",
  icon: "groupPOS",
  childs: [
    // ── POS Master ────────────────────────────────────────────────────
    {
      id: "posMaster",
      type: "collapse",
      path: "/pos-master",
      title: "POS Master",
      icon: "posMaster",
      childs: [
        { id: "posMaster.branchMaster", type: "item", path: "/pos-master/branch-master", title: "Branch Master", icon: "posMaster.branchMaster" },
      ],
    },

    // ── Branch ────────────────────────────────────────────────────────
    {
      id: "branch",
      type: "collapse",
      path: "/branch",
      title: "Branch",
      icon: "branch",
      childs: [
        { id: "branch.itemVerification", type: "item", path: "/branch/item-verification", title: "Item Verification", icon: "branch.itemVerification" },
      ],
    },
  ],
};
