export interface ReturnItem {
  id: number;
  return_id: string;
  order_number: string;
  product_name: string;
  vendor_name: string;
  customer_name: string;
  reason: string;
  images: string[];
  vendor_remarks: string | null;
  status: string;
  requested_at: string;
  vendor_responded_at: string | null;
  re_requested_at: string | null;
}

export interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ReturnStats {
  total: number;
  requested: number;
  vendor_approved: number;
  vendor_rejected: number;
  re_requested: number;
  admin_approved: number;
  admin_rejected: number;
}

export const EMPTY_STATS: ReturnStats = {
  total: 0,
  requested: 0,
  vendor_approved: 0,
  vendor_rejected: 0,
  re_requested: 0,
  admin_approved: 0,
  admin_rejected: 0,
};

export const BASE = "ecommerce/admin/returns/";

// Media urls come from the server root (without /api/)
const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getFullImageUrl = (url: string) => {
  if (!url) return url;
  return url.startsWith("http") ? url : `${MEDIA_BASE_URL}${url}`;
};

export const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export type BadgeColor = "success" | "warning" | "error" | "info" | "neutral";

export const statusColor = (s: string): BadgeColor => {
  switch (s) {
    case "vendor_approved":
    case "admin_approved":
      return "success";
    case "vendor_rejected":
      return "warning";
    case "admin_rejected":
      return "error";
    case "re_requested":
      return "info";
    default:
      return "neutral";
  }
};

export const statusLabel = (s: string) => s.replace(/_/g, " ");