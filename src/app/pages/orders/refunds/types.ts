export interface RefundItem {
  id: number;
  refund_id: string;
  return_id: string;
  return_status: string;
  order_number: string;
  product_name: string;
  customer_name: string;
  vendor_name: string;
  refund_amount: number;
  status: "pending" | "processed" | "failed";
  razorpay_refund_id: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface RefundStats {
  total: number;
  pending: number;
  processed: number;
  failed: number;
  total_amount: number;
  pending_amount: number;
  processed_amount: number;
  failed_amount: number;
}

export const EMPTY_STATS: RefundStats = {
  total: 0,
  pending: 0,
  processed: 0,
  failed: 0,
  total_amount: 0,
  pending_amount: 0,
  processed_amount: 0,
  failed_amount: 0,
};

export const BASE = "ecommerce/admin/refunds/";

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export const statusColor = (s: string): "success" | "error" | "warning" =>
  s === "processed" ? "success" : s === "failed" ? "error" : "warning";