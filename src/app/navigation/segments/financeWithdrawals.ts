import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const financeWithdrawals: NavigationTree = {
  ...baseNavigationObj["financeWithdrawals"],
  childs: [
    {
      id: "financeWithdrawals.vendorWithdrawals",
      type: "item",
      path: "/finance-withdrawals/vendor-withdrawals",
      title: "Vendor Withdrawals",
      icon: "financeWithdrawals.vendorWithdrawals",
    },
    {
      id: "financeWithdrawals.transactionReports",
      type: "item",
      path: "/finance-withdrawals/transaction-reports",
      title: "Transaction Reports",
      icon: "financeWithdrawals.transactionReports",
    },
  ],
};
