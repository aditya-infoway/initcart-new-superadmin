export interface PageStats {
  stats: {
    total_platform_profit: number;
    total_agents_paid: number;
    total_company_profit: number;
    breakdown_agents: { mlm: number; pos: number; society: number };
    total_refunded_amount: number;
    pending_refund_amount: number;
  };
  order_counts: {
    total: number;
    agent_orders: number;
    direct_orders: number;
    distributed: number;
    pending: number;
  };
  refund_counts: { processed: number; pending: number; failed: number };
}

export interface ProfitOrderRow {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  commissionStatus: "distributed" | "pending" | "no_agent";
  agentInfo: {
    full_name: string;
    agent_type: string;
    username: string;
    is_active: boolean;
  } | null;
}

export interface OrderItem {
  product_name: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_receivable: number;
  platform_profit: number;
  vendor_name: string;
  item_status: string;
  is_refunded: boolean;
  refund: {
    refund_id: string;
    refund_amount: number;
    status: string;
    commission_reversed: boolean;
    processed_at: string | null;
  } | null;
}

export interface MLMEntry {
  agent_name: string;
  agent_type: string;
  username: string;
  amount: number;
  level: number;
  percentage: number;
  type: string;
  is_reversal: boolean;
  product_name: string | null;
  date: string;
}

export interface RefundEntry {
  refund_id: string;
  product_name: string;
  refund_amount: number;
  status: "pending" | "processed" | "failed";
  commission_reversed: boolean;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface ProfitData {
  order_info: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_date: string;
    order_status: string;
    payment_status: string;
    payment_method: string;
    total_amount: number;
    discount_amount: number;
    shipping_charge: number;
    final_amount: number;
  };
  profit_summary: {
    total_platform_profit: number;
    total_vendor_receivable: number;
    total_agents_paid: number;
    commission_status: string;
    referral_agent: {
      id: number;
      full_name: string;
      agent_type: string;
      username: string;
      is_active: boolean;
      status: string;
    } | null;
    mlm_commission_processed: boolean;
    refund_status: "none" | "partially_refunded" | "fully_refunded";
    total_refunded_amount: number;
    total_refunded_profit: number;
    refunded_items_count: number;
    total_items_count: number;
  };
  config: {
    pos_percentage: number;
    service_percentage: number;
    mlm_percentage: number;
    company_percentage: number;
  };
  items: OrderItem[];
  refunds: RefundEntry[];
  distribution: {
    mlm_chain: MLMEntry[];
    extra_profit_entries?: MLMEntry[];
    pools: { pos_pool: number; soc_pool: number; mlm_pool: number; config_co: number };
    paid: { mlm_paid: number; pos_paid: number; society_paid: number };
    undistributed: { mlm: number; pos: number; soc: number };
    company: {
      configured_share: number;
      undistributed_mlm: number;
      undistributed_pos: number;
      undistributed_soc: number;
      total: number;
    };
  };
}

/* ---------------- helpers ---------------- */

export const PROFIT_URL = "ecommerce/admin/order-profit/";
export const STATS_URL = "ecommerce/admin/order-profit-stats/";
export const ORDERS_URL = "ecommerce/superadmin/orders/";

export const fmt = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export type BadgeColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export const STATUS_FILTERS: { label: string; api: string }[] = [
  { label: "All", api: "" },
  { label: "Delivered", api: "delivered" },
  { label: "Confirmed", api: "confirmed" },
  { label: "Pending", api: "pending" },
  { label: "Packaging", api: "processing" },
  { label: "Out for Delivery", api: "shipped" },
  { label: "Canceled", api: "cancelled" },
  { label: "Returned", api: "refunded" },
];

export const orderStatusColor = (s: string): BadgeColor => {
  switch (s) {
    case "delivered": return "success";
    case "confirmed": return "info";
    case "pending": return "warning";
    case "processing": return "secondary";
    case "shipped": return "primary";
    case "cancelled": return "error";
    case "refunded": return "warning";
    default: return "neutral";
  }
};

export const agentTypeColor = (t: string): BadgeColor =>
  t === "pos" ? "secondary" : t === "society" ? "success" : "info";

export const levelColor = (l: number): BadgeColor =>
  l === 1 ? "info" : l === 2 ? "primary" : l === 3 ? "secondary" : "warning";

export const refundStatusColor = (s: string): BadgeColor =>
  s === "processed" ? "success" : s === "failed" ? "error" : "warning";

export const mapApiProfitOrderRow = (o: any): ProfitOrderRow => ({
  orderId: o.order_number || `ORD${o.id}`,
  orderDate: o.created_at,
  customerName: o.billing_name || o.customer_details?.username || "Customer",
  customerPhone: o.billing_phone || o.customer_details?.phone || "",
  finalAmount: parseFloat(o.final_amount || "0"),
  orderStatus: o.order_status || "pending",
  paymentStatus: o.payment_status || "pending",
  agentInfo: o.referral_agent_info || null,
  commissionStatus: o.mlm_commission_processed
    ? "distributed"
    : o.referral_agent_info
      ? "pending"
      : "no_agent",
});