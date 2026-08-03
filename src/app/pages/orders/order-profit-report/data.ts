import { formatCurrency as baseFormatCurrency, formatDateTime, getOrderStatusLabel, normalizeOrderStatus, OrderStatusTab } from "../all-orders/data";

export interface ProfitOrderRow {
  id: string;
  orderId: string;
  date: string;
  dateRaw: string;
  customer: string;
  amount: number;
  amountLabel: string;
  status: OrderStatusTab;
  statusLabel: string;
  agentName: string;
  agentType: string;
  commissionAmount: number;
  commissionAmountLabel: string;
  commissionStatus: "distributed" | "pending";
  hasAgent: boolean;
}

export interface ProfitStats {
  totalPlatformProfit: number;
  totalAgentsPaid: number;
  totalCompanyProfit: number;
  distributedOrders: number;
  pendingOrders: number;
  totalOrders: number;
  deliveredOrders: number;
  directSales: number;
  agentOrders: number;
}

export interface ProfitReportDistributionRow {
  id: string;
  recipient: string;
  recipientSubtext: string;
  type: string;
  typeTag: string;
  poolAmount: string;
  paidAmount: string;
  undistributedAmount: string;
  highlight?: "company" | "warning";
}

export interface ProfitReportDetail {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string;
  discountAmount: string;
  shippingCharge: string;
  finalAmount: string;
  totalPlatformProfit: string;
  platformProfitRaw: number;
  totalVendorReceivable: string;
  totalAgentsPaid: string;
  totalAgentsPaidRaw: number;
  companyProfit: string;
  companyProfitRaw: number;
  commissionStatus: "distributed" | "pending";
  referralAgentName: string;
  referralAgentUsername: string;
  referralAgentType: string;
  referralAgentActive: boolean;
  mlmCommissionProcessed: boolean;
  itemsCount: number;
  distributionRows: ProfitReportDistributionRow[];
  companyConfigured: string;
  companyUndistributedMlm: string;
  companyUndistributedPos: string;
  companyUndistributedSoc: string;
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: unknown): string {
  return baseFormatCurrency(toNumber(value));
}

function formatAgentType(value: string | null | undefined): string {
  const raw = String(value || "normal");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function mapApiProfitOrderRow(item: any): ProfitOrderRow {
  const status = normalizeOrderStatus(item?.order_status);
  const referral = item?.referral_agent_info || item?.referral_agent || null;
  const commissionAmount = toNumber(item?.commission_amount ?? item?.total_agent_commission ?? item?.profit_summary?.total_agents_paid);
  const orderId = String(item?.order_number || item?.id || "—");

  return {
    id: orderId,
    orderId,
    date: formatDateTime(item?.created_at || item?.order_date),
    dateRaw: String(item?.created_at || item?.order_date || ""),
    customer: String(item?.billing_name || item?.customer_details?.username || item?.customer_name || "—"),
    amount: toNumber(item?.final_amount ?? item?.total_amount),
    amountLabel: formatCurrency(item?.final_amount ?? item?.total_amount),
    status,
    statusLabel: getOrderStatusLabel(status),
    agentName: String(referral?.full_name || "Direct Order"),
    agentType: formatAgentType(referral?.agent_type),
    commissionAmount,
    commissionAmountLabel: formatCurrency(commissionAmount),
    commissionStatus: item?.mlm_commission_processed || commissionAmount > 0 ? "distributed" : "pending",
    hasAgent: Boolean(referral?.id),
  };
}

export function createProfitStats(rows: ProfitOrderRow[]): ProfitStats {
  const deliveredRows = rows.filter((row) => row.status === "delivered");
  const distributedOrders = deliveredRows.filter((row) => row.commissionStatus === "distributed").length;
  const pendingOrders = deliveredRows.filter((row) => row.commissionStatus === "pending").length;
  const totalAgentsPaid = deliveredRows.reduce((sum, row) => sum + row.commissionAmount, 0);
  const totalPlatformProfit = deliveredRows.reduce((sum, row) => sum + row.amount * 0.05, 0);
  const directSales = deliveredRows.filter((row) => !row.hasAgent).length;
  const agentOrders = deliveredRows.filter((row) => row.hasAgent).length;
  const totalCompanyProfit = Math.max(totalPlatformProfit - totalAgentsPaid, 0);

  return {
    totalPlatformProfit,
    totalAgentsPaid,
    totalCompanyProfit,
    distributedOrders,
    pendingOrders,
    totalOrders: rows.length,
    deliveredOrders: deliveredRows.length,
    directSales,
    agentOrders,
  };
}

export function mapApiProfitReport(payload: any): ProfitReportDetail {
  const orderInfo = payload?.order_info ?? {};
  const profitSummary = payload?.profit_summary ?? {};
  const distribution = payload?.distribution ?? {};
  const company = distribution?.company ?? {};
  const paid = distribution?.paid ?? {};
  const undistributed = distribution?.undistributed ?? {};
  const pools = distribution?.pools ?? {};
  const chain = Array.isArray(distribution?.mlm_chain) ? distribution.mlm_chain : [];
  const referral = profitSummary?.referral_agent ?? {};
  const totalPlatformProfit = toNumber(profitSummary?.total_platform_profit);
  const totalAgentsPaid = toNumber(profitSummary?.total_agents_paid);
  const companyProfit = toNumber(company?.total);

  const distributionRows: ProfitReportDistributionRow[] = [
    ...chain.map((agent: any, index: number) => ({
      id: `mlm-${index + 1}`,
      recipient: String(agent?.agent_name || "—"),
      recipientSubtext: `@${String(agent?.username || "—")}`,
      type: `MLM L${toNumber(agent?.level)} · ${toNumber(agent?.percentage)}%`,
      typeTag: "mlm",
      poolAmount: "—",
      paidAmount: formatCurrency(agent?.amount),
      undistributedAmount: "—",
    })),
    {
      id: "mlm-undistributed",
      recipient: "MLM Undistributed (short chain)",
      recipientSubtext: "Company",
      type: "Company",
      typeTag: "company",
      poolAmount: formatCurrency(pools?.mlm_pool),
      paidAmount: formatCurrency(paid?.mlm_paid),
      undistributedAmount: formatCurrency(undistributed?.mlm),
      highlight: "warning",
    },
    {
      id: "pos-pool",
      recipient: "POS Pool",
      recipientSubtext: "Company via POS agents",
      type: "Company",
      typeTag: "company",
      poolAmount: formatCurrency(pools?.pos_pool),
      paidAmount: formatCurrency(paid?.pos_paid),
      undistributedAmount: formatCurrency(undistributed?.pos),
    },
    {
      id: "society-pool",
      recipient: "Society Pool",
      recipientSubtext: "Company via Society agents",
      type: "Company",
      typeTag: "company",
      poolAmount: formatCurrency(pools?.soc_pool),
      paidAmount: formatCurrency(paid?.society_paid),
      undistributedAmount: formatCurrency(undistributed?.soc),
    },
    {
      id: "company",
      recipient: "Company",
      recipientSubtext: "Configured + undistributed",
      type: "Configured",
      typeTag: "company-profit",
      poolAmount: formatCurrency(company?.configured_share),
      paidAmount: "—",
      undistributedAmount: formatCurrency(company?.total),
      highlight: "company",
    },
  ];

  return {
    orderId: String(orderInfo?.order_number || "—"),
    customerName: String(orderInfo?.customer_name || "—"),
    customerEmail: String(orderInfo?.customer_email || "—"),
    customerPhone: String(orderInfo?.customer_phone || "—"),
    orderDate: formatDateTime(orderInfo?.order_date),
    orderStatus: String(orderInfo?.order_status || "—"),
    paymentStatus: String(orderInfo?.payment_status || "—"),
    paymentMethod: String(orderInfo?.payment_method || "—"),
    totalAmount: formatCurrency(orderInfo?.total_amount),
    discountAmount: formatCurrency(orderInfo?.discount_amount),
    shippingCharge: formatCurrency(orderInfo?.shipping_charge),
    finalAmount: formatCurrency(orderInfo?.final_amount),
    totalPlatformProfit: formatCurrency(totalPlatformProfit),
    platformProfitRaw: totalPlatformProfit,
    totalVendorReceivable: formatCurrency(profitSummary?.total_vendor_receivable),
    totalAgentsPaid: formatCurrency(totalAgentsPaid),
    totalAgentsPaidRaw: totalAgentsPaid,
    companyProfit: formatCurrency(companyProfit),
    companyProfitRaw: companyProfit,
    commissionStatus: profitSummary?.commission_status === "distributed" ? "distributed" : "pending",
    referralAgentName: String(referral?.full_name || "—"),
    referralAgentUsername: String(referral?.username || "—"),
    referralAgentType: formatAgentType(referral?.agent_type),
    referralAgentActive: Boolean(referral?.is_active),
    mlmCommissionProcessed: Boolean(profitSummary?.mlm_commission_processed),
    itemsCount: Array.isArray(payload?.items) ? payload.items.length : 0,
    distributionRows,
    companyConfigured: formatCurrency(company?.configured_share),
    companyUndistributedMlm: formatCurrency(company?.undistributed_mlm),
    companyUndistributedPos: formatCurrency(company?.undistributed_pos),
    companyUndistributedSoc: formatCurrency(company?.undistributed_soc),
  };
}

export const profitStatusTabs: { key: OrderStatusTab | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "delivered", label: "Delivered" },
  { key: "confirmed", label: "Confirmed" },
  { key: "pending", label: "Pending" },
  { key: "packaging", label: "Packaging" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "canceled", label: "Canceled" },
  { key: "returned", label: "Returned" },
];
