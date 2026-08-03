import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const serviceReports: NavigationTree = {
  ...baseNavigationObj["serviceReports"],
  childs: [
    {
      id: "serviceReports.subscriptionReports",
      type: "item",
      path: "/service-reports/subscription-reports",
      title: "Subscription Reports",
      icon: "serviceReports.subscriptionReports",
    },
    {
      id: "serviceReports.inquiryReports",
      type: "item",
      path: "/service-reports/inquiry-reports",
      title: "Inquiry Reports",
      icon: "serviceReports.inquiryReports",
    },
    {
      id: "serviceReports.servicePerformanceReport",
      type: "item",
      path: "/service-reports/service-performance-report",
      title: "Service Performance Report",
      icon: "serviceReports.servicePerformanceReport",
    },
    {
      id: "serviceReports.vendorEarningsReport",
      type: "item",
      path: "/service-reports/vendor-earnings-report",
      title: "Vendor Earnings Report",
      icon: "serviceReports.vendorEarningsReport",
    },
  ],
};
