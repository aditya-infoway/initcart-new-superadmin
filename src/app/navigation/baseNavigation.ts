import { NavigationTree } from "@/@types/navigation";

/**
 * Object containing the base navigation items for the application.
 * This object serves as a centralized configuration for main navigation elements.
 */
export const baseNavigationObj: Record<string, NavigationTree> = {
  dashboards: {
    id: "dashboards",
    type: "item",
    path: "/dashboards/home",
    title: "Dashboard",
    transKey: "nav.dashboards.dashboards",
    icon: "dashboards",
  },

  master: {
    id: "master",
    type: "collapse",
    path: "/master",
    title: "Master",
    transKey: "nav.master.master",
    icon: "master",
  },

  itemMaster: {
    id: "itemMaster",
    type: "collapse",
    path: "/item-master",
    title: "Item Master",
    transKey: "nav.itemMaster.itemMaster",
    icon: "itemMaster",
  },
    leadMaster: {
    id: "leadMaster",
    type: "collapse", 
    path: "/lead-master",
    title: "Lead Master",
    icon: "leadMaster",
  },


  enquiryMaster: {
    id: "enquiryMaster",
    type: "collapse",
    path: "/enquiry-master",
    title: "Enquiry Master",
    icon: "enquiryMaster",
  },

  accountingMaster: {
    id: "accountingMaster",
    type: "collapse",
    path: "/accounting-master",
    title: "Accounting Master",
    icon: "accountingMaster",
  },
  purchaseMaster: {
    id: "purchaseMaster",
    type: "collapse",
    path: "/purchase-master",
    title: "Purchase Master",
    icon: "purchaseMaster",
  },
  stockReport: {
    id: "stockReport",
    type: "collapse",
    path: "/stock-report",
    title: "Stock Report",
    icon: "stockReport",
  },
  userMaster: {
    id: "userMaster",
    type: "collapse",
    path: "/user-master",
    title: "User Master",
    icon: "userMaster",
  },
  webSite: {
    id: "webSite",
    type: "collapse",
    path: "/web-site",
    title: "Web Site",
    icon: "webSite",
  },

  vendorManagement: {
    id: "vendorManagement",
    type: "collapse",
    path: "/vendor-management",
    title: "Vendors Management",
    icon: "vendorManagement",
  },

  loyaltyPoints: {
    id: "loyaltyPoints",
    type: "collapse",
    path: "/loyalty-points",
    title: "Loyalty Points",
    icon: "loyaltyPoints",
  },

  products: {
    id: "products",
    type: "collapse",
    path: "/products",
    title: "Products",
    icon: "products",
  },

  dealsCampaigns: {
    id: "dealsCampaigns",
    type: "collapse",
    path: "/deals-campaigns",
    title: "Deals & Campaigns",
    icon: "dealsCampaigns",
  },

  orders: {
    id: "orders",
    type: "collapse",
    path: "/orders",
    title: "Orders",
    icon: "orders",
  },

  reports: {
    id: "reports",
    type: "collapse",
    path: "/reports",
    title: "Reports",
    icon: "reports",
  },

  subscriptionManagement: {
    id: "subscriptionManagement",
    type: "collapse",
    path: "/subscription-management",
    title: "Subscription Management",
    icon: "subscriptionManagement",
  },

  ecommerceSettings: {
    id: "ecommerceSettings",
    type: "collapse",
    path: "/ecommerce-settings",
    title: "E-Commerce Settings",
    icon: "ecommerceSettings",
  },

  settings: {
    id: "settings",
    type: "collapse",
    path: "/settings",
    title: "Settings",
    icon: "settings",
  },

  financeWithdrawals: {
    id: "financeWithdrawals",
    type: "collapse",
    path: "/finance-withdrawals",
    title: "Finance & Withdrawals",
    icon: "financeWithdrawals",
  },

  services: {
    id: "services",
    type: "collapse",
    path: "/services",
    title: "Services",
    icon: "services",
  },

  serviceApprovals: {
    id: "serviceApprovals",
    type: "collapse",
    path: "/service-approvals",
    title: "Service Approvals",
    icon: "serviceApprovals",
  },

  campaigns: {
    id: "campaigns",
    type: "collapse",
    path: "/campaigns",
    title: "Campaigns",
    icon: "campaigns",
  },

  marketingBanners: {
    id: "marketingBanners",
    type: "collapse",
    path: "/marketing-banners",
    title: "Marketing Banners",
    icon: "marketingBanners",
  },

  serviceReports: {
    id: "serviceReports",
    type: "collapse",
    path: "/service-reports",
    title: "Service Reports",
    icon: "serviceReports",
  },

  agentsManagement: {
    id: "agentsManagement",
    type: "collapse",
    path: "/agents-management",
    title: "Agents Management",
    icon: "agentsManagement",
  },

  posMaster: {
    id: "posMaster",
    type: "collapse",
    path: "/pos-master",
    title: "POS Master",
    icon: "posMaster",
  },

  branch: {
    id: "branch",
    type: "collapse",
    path: "/branch",
    title: "Branch",
    icon: "branch",
  },

  commissionsMLM: {
    id: "commissionsMLM",
    type: "collapse",
    path: "/commissions-mlm",
    title: "Commissions & MLM",
    icon: "commissionsMLM",
  },

  logout: {
    id: "logout",
    type: "item",
    path: "/login",
    title: "Logout",
    transKey: "nav.logout",
    icon: "logout",
  },
};

/**
 * Array of navigation items derived from baseNavigationObj.
 * This array format is used for rendering the navigation menu in the application.
 */
export const baseNavigation: NavigationTree[] = Array.from(
  Object.values(baseNavigationObj),
);