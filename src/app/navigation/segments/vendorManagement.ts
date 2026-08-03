import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const vendorManagement: NavigationTree = {
  ...baseNavigationObj["vendorManagement"],
  childs: [
    {
      id: "vendorManagement.createVendor",
      type: "item",
      path: "/vendor-management/create-vendor",
      title: "Create Vendor",
      icon: "vendorManagement.createVendor",
    },
    {
      id: "vendorManagement.vendorList",
      type: "item",
      path: "/vendor-management/vendor-list",
      title: "Vendor List",
      icon: "vendorManagement.vendorList",
    },
    {
      id: "vendorManagement.approvalRequests",
      type: "item",
      path: "/vendor-management/approval-requests",
      title: "Vendor Approval Requests",
      icon: "vendorManagement.approvalRequests",
    },
    {
      id: "vendorManagement.brandCreation",
      type: "item",
      path: "/vendor-management/brand-creation",
      title: "Brand creation",
      icon: "vendorManagement.brandCreation",
    },
  ],
};
