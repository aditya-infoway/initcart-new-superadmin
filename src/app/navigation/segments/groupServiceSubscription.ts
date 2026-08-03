import { NavigationTree } from "@/@types/navigation";

export const groupServiceSubscription: NavigationTree = {
  id: "groupServiceSubscription",
  type: "collapse",
  path: "/services",
  title: "Service Subscription Platform",
  icon: "groupServiceSubscription",
  childs: [
    // ── Services ──────────────────────────────────────────────────────
    {
      id: "services",
      type: "collapse",
      path: "/services",
      title: "Services",
      icon: "services",
      childs: [
        {
          id: "services.manageServices",
          type: "collapse",
          path: "/services/manage-services",
          title: "Manage Services",
          icon: "services.manageServices",
          childs: [
            { id: "services.manageServices.serviceCategories",    type: "item", path: "/services/manage-services/service-categories",    title: "Service Categories",    icon: "services.manageServices.serviceCategories" },
            { id: "services.manageServices.serviceSubCategories", type: "item", path: "/services/manage-services/service-sub-categories", title: "Service Sub Categories", icon: "services.manageServices.serviceSubCategories" },
          ],
        },
        { id: "services.serviceInquiries",      type: "item", path: "/services/service-inquiries",      title: "Service Inquiries",       icon: "services.serviceInquiries" },
        { id: "services.flashDealParticipation",type: "item", path: "/services/flash-deal-participation",title: "Flash Deal Participation", icon: "services.flashDealParticipation" },
        { id: "services.featuredServices",      type: "item", path: "/services/featured-services",      title: "Featured Services",       icon: "services.featuredServices" },
      ],
    },

    // ── Service Approvals ─────────────────────────────────────────────
    {
      id: "serviceApprovals",
      type: "collapse",
      path: "/service-approvals",
      title: "Service Approvals",
      icon: "serviceApprovals",
      childs: [
        { id: "serviceApprovals.approvalRequests", type: "item", path: "/service-approvals/approval-requests", title: "Service Approval Requests", icon: "serviceApprovals.approvalRequests" },
      ],
    },

    // ── Subscription Management ───────────────────────────────────────
    {
      id: "subscriptionManagement",
      type: "collapse",
      path: "/subscription-management",
      title: "Subscription Management",
      icon: "subscriptionManagement",
      childs: [
        { id: "subscriptionManagement.list", type: "item", path: "/subscription-management", title: "Subscription Management", icon: "subscriptionManagement.list" },
      ],
    },

    // ── Service Reports ───────────────────────────────────────────────
    {
      id: "serviceReports",
      type: "collapse",
      path: "/service-reports",
      title: "Service Reports",
      icon: "serviceReports",
      childs: [
        { id: "serviceReports.subscriptionReports",      type: "item", path: "/service-reports/subscription-reports",       title: "Subscription Reports",         icon: "serviceReports.subscriptionReports" },
        { id: "serviceReports.inquiryReports",           type: "item", path: "/service-reports/inquiry-reports",            title: "Inquiry Reports",              icon: "serviceReports.inquiryReports" },
        { id: "serviceReports.servicePerformanceReport", type: "item", path: "/service-reports/service-performance-report", title: "Service Performance Report",   icon: "serviceReports.servicePerformanceReport" },
        { id: "serviceReports.vendorEarningsReport",     type: "item", path: "/service-reports/vendor-earnings-report",     title: "Vendor Earnings Report",       icon: "serviceReports.vendorEarningsReport" },
      ],
    },
  ],
};
