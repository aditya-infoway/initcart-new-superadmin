import { NavigationTree } from "@/@types/navigation";

export const groupEcommerce: NavigationTree = {
  id: "groupEcommerce",
  type: "collapse",
  path: "/vendor-management",
  title: "E-Commerce (Multi-Vendor)",
  icon: "groupEcommerce",
  childs: [
    // ── Vendor Management ─────────────────────────────────────────────
    {
      id: "vendorManagement",
      type: "collapse",
      path: "/vendor-management",
      title: "Vendors Management",
      icon: "vendorManagement",
      childs: [
        { id: "vendorManagement.createVendor",     type: "item", path: "/vendor-management/create-vendor",     title: "Create Vendor",             icon: "vendorManagement.createVendor" },
        { id: "vendorManagement.vendorList",        type: "item", path: "/vendor-management/vendor-list",        title: "Vendor List",               icon: "vendorManagement.vendorList" },
        { id: "vendorManagement.approvalRequests",  type: "item", path: "/vendor-management/approval-requests",  title: "Vendor Approval Requests",  icon: "vendorManagement.approvalRequests" },
        { id: "vendorManagement.brandCreation",     type: "item", path: "/vendor-management/brand-creation",     title: "Brand Creation",            icon: "vendorManagement.brandCreation" },
      ],
    },

    // ── Products ──────────────────────────────────────────────────────
    {
      id: "products",
      type: "collapse",
      path: "/products",
      title: "Products",
      icon: "products",
      childs: [
        { id: "products.verification", type: "item", path: "/products/product-verification", title: "Product Verification", icon: "products.verification" },
        {
          id: "products.categoryMaster",
          type: "collapse",
          path: "/products/category-master",
          title: "Category Master",
          icon: "products.categoryMaster",
          childs: [
            { id: "products.categoryMaster.category",       type: "item", path: "/products/category-master/category",         title: "Category",         icon: "products.categoryMaster.category" },
            { id: "products.categoryMaster.subCategory",    type: "item", path: "/products/category-master/sub-category",     title: "Sub Category",     icon: "products.categoryMaster.subCategory" },
            { id: "products.categoryMaster.subSubCategory", type: "item", path: "/products/category-master/sub-sub-category", title: "Sub Sub Category", icon: "products.categoryMaster.subSubCategory" },
          ],
        },
      ],
    },

    // ── Deals & Campaigns ─────────────────────────────────────────────
    {
      id: "dealsCampaigns",
      type: "collapse",
      path: "/deals-campaigns",
      title: "Deals & Campaigns",
      icon: "dealsCampaigns",
      childs: [
        { id: "dealsCampaigns.createCampaign", type: "item", path: "/deals-campaigns/create-campaign", title: "Create Campaign",  icon: "dealsCampaigns.createCampaign" },
        { id: "dealsCampaigns.dealOfTheDay",   type: "item", path: "/deals-campaigns/deal-of-the-day", title: "Deal Of The Day",  icon: "dealsCampaigns.dealOfTheDay" },
        { id: "dealsCampaigns.flashDeal",      type: "item", path: "/deals-campaigns/flash-deal",      title: "Flash Deal",       icon: "dealsCampaigns.flashDeal" },
        { id: "dealsCampaigns.featuredDeal",   type: "item", path: "/deals-campaigns/featured-deal",   title: "Featured Deal",    icon: "dealsCampaigns.featuredDeal" },
      ],
    },

    // ── Orders ────────────────────────────────────────────────────────
    {
      id: "orders",
      type: "collapse",
      path: "/orders",
      title: "Orders",
      icon: "orders",
      childs: [
        { id: "orders.allOrders",          type: "item", path: "/orders/all-orders",           title: "All Orders",           icon: "orders.allOrders" },
        { id: "orders.orderProfitReport",  type: "item", path: "/orders/order-profit-report",  title: "Order Profit Report",  icon: "orders.orderProfitReport" },
      ],
    },

    // ── Reports ───────────────────────────────────────────────────────
    {
      id: "reports",
      type: "collapse",
      path: "/reports",
      title: "Reports",
      icon: "reports",
      childs: [
        { id: "reports.salesReport", type: "item", path: "/reports/sales-report", title: "Sales Report", icon: "reports.salesReport" },
      ],
    },

    // ── Loyalty Points ────────────────────────────────────────────────
    {
      id: "loyaltyPoints",
      type: "collapse",
      path: "/loyalty-points",
      title: "Loyalty Points",
      icon: "loyaltyPoints",
      childs: [
        { id: "loyaltyPoints.create",      type: "item", path: "/loyalty-points/create",      title: "Loyalty Points Create",      icon: "loyaltyPoints.create" },
        { id: "loyaltyPoints.transaction", type: "item", path: "/loyalty-points/transaction", title: "Loyalty Points Transaction", icon: "loyaltyPoints.transaction" },
      ],
    },

    // ── Campaigns ─────────────────────────────────────────────────────
    {
      id: "campaigns",
      type: "collapse",
      path: "/campaigns",
      title: "Campaigns",
      icon: "campaigns",
      childs: [
        { id: "campaigns.createCampaign",             type: "item", path: "/campaigns/create-campaign",              title: "Create Campaign",              icon: "campaigns.createCampaign" },
        { id: "campaigns.vendorParticipationApproval",type: "item", path: "/campaigns/vendor-participation-approval",title: "Vendor Participation Approval",icon: "campaigns.vendorParticipationApproval" },
        { id: "campaigns.activeCampaignsList",        type: "item", path: "/campaigns/active-campaigns-list",        title: "Active Campaigns List",        icon: "campaigns.activeCampaignsList" },
      ],
    },

    // ── Marketing Banners ─────────────────────────────────────────────
    {
      id: "marketingBanners",
      type: "collapse",
      path: "/marketing-banners",
      title: "Marketing Banners",
      icon: "marketingBanners",
      childs: [
        { id: "marketingBanners.gym",          type: "item", path: "/marketing-banners/gym",           title: "Gym",           icon: "marketingBanners.gym" },
        { id: "marketingBanners.saloon",       type: "item", path: "/marketing-banners/saloon",        title: "Saloon",        icon: "marketingBanners.saloon" },
        { id: "marketingBanners.travelAgency", type: "item", path: "/marketing-banners/travel-agency", title: "Travel Agency", icon: "marketingBanners.travelAgency" },
        { id: "marketingBanners.realEstate",   type: "item", path: "/marketing-banners/real-estate",   title: "Real Estate",   icon: "marketingBanners.realEstate" },
        { id: "marketingBanners.techIndustry", type: "item", path: "/marketing-banners/tech-industry", title: "Tech Industry", icon: "marketingBanners.techIndustry" },
        { id: "marketingBanners.professional", type: "item", path: "/marketing-banners/professional",  title: "Professional",  icon: "marketingBanners.professional" },
        { id: "marketingBanners.finance",      type: "item", path: "/marketing-banners/finance",       title: "Finance",       icon: "marketingBanners.finance" },
        { id: "marketingBanners.healthcare",   type: "item", path: "/marketing-banners/healthcare",    title: "Healthcare",    icon: "marketingBanners.healthcare" },
        { id: "marketingBanners.education",    type: "item", path: "/marketing-banners/education",     title: "Education",     icon: "marketingBanners.education" },
        { id: "marketingBanners.restaurant",   type: "item", path: "/marketing-banners/restaurant",    title: "Restaurant",    icon: "marketingBanners.restaurant" },
        { id: "marketingBanners.hotel",        type: "item", path: "/marketing-banners/hotel",         title: "Hotel",         icon: "marketingBanners.hotel" },
      ],
    },

    // ── E-Commerce Settings ───────────────────────────────────────────
    {
      id: "ecommerceSettings",
      type: "collapse",
      path: "/ecommerce-settings",
      title: "E-Commerce Settings",
      icon: "ecommerceSettings",
      childs: [
        { id: "ecommerceSettings.shippingConfiguration", type: "item", path: "/ecommerce-settings/shipping-configuration",  title: "Shipping Configuration",    icon: "ecommerceSettings.shippingConfiguration" },
        { id: "ecommerceSettings.paymentGatewaySetup",   type: "item", path: "/ecommerce-settings/payment-gateway-setup",   title: "Payment Gateway Setup",     icon: "ecommerceSettings.paymentGatewaySetup" },
        { id: "ecommerceSettings.returnRefundPolicy",    type: "item", path: "/ecommerce-settings/return-refund-policy",    title: "Return & Refund Policy",    icon: "ecommerceSettings.returnRefundPolicy" },
      ],
    },

    // ── Finance & Withdrawals ─────────────────────────────────────────
    {
      id: "financeWithdrawals",
      type: "collapse",
      path: "/finance-withdrawals",
      title: "Finance & Withdrawals",
      icon: "financeWithdrawals",
      childs: [
        { id: "financeWithdrawals.vendorWithdrawals",   type: "item", path: "/finance-withdrawals/vendor-withdrawals",   title: "Vendor Withdrawals",    icon: "financeWithdrawals.vendorWithdrawals" },
        { id: "financeWithdrawals.transactionReports",  type: "item", path: "/finance-withdrawals/transaction-reports",  title: "Transaction Reports",   icon: "financeWithdrawals.transactionReports" },
      ],
    },
  ],
};
