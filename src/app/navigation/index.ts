import { dashboards } from "./segments/dashboards";
import { groupWebSite } from "./segments/groupWebSite";
import { groupEcommerce } from "./segments/groupEcommerce";
import { groupServiceSubscription } from "./segments/groupServiceSubscription";
import { groupMLM } from "./segments/groupMLM";
import { groupPOS } from "./segments/groupPOS";
import { logout } from "./segments/logout";

// ── Navigation ─────────────────────────────────────────────────────────────
// Sidebar rail shows exactly 7 icons:
//   Dashboard | Web Site | E-Commerce | Service Subscription | MLM | POS | Logout
// Every existing submenu is nested inside its parent group.

export const navigation = [
  dashboards,               // Dashboard
  groupWebSite,             // Web Site → Slider Image · Ads Manager · Mobile Banner
  groupEcommerce,           // E-Commerce (Multi-Vendor) → all ecommerce submenus
  groupServiceSubscription, // Service Subscription Platform → all service submenus
  groupMLM,                 // MLM (Multi-Level Marketing) → Agents + Commissions
  groupPOS,                 // POS (Point of Sale) → POS Master + Branch
  logout,                   // Logout
];
