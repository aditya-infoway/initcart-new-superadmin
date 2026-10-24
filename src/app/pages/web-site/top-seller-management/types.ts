export type TopSellerStatus = "pending" | "approved" | "rejected";

export interface TopSellerRow {
  id: number;
  request_id: string;
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string;
  vendor_city: string;
  vendor_state: string;
  vendor_logo: string | null;
  vendor_joined: string | null;
  message: string;
  banner_url: string | null;
  banner_uploaded_by: "vendor" | "admin" | "";
  status: TopSellerStatus;
  is_active: boolean;
  display_order: number;
  admin_remarks: string | null;
  total_requests: number;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
}

export interface TopSellerStats {
  total: number;
  pending: number;
  approved: number;
  live: number;
  hidden: number;
  rejected: number;
}

export interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export const BASE = "ecommerce/admin/top-seller-requests/";
export const MAX_MB = 3;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export const statusColor = (s: TopSellerStatus) =>
  s === "approved" ? "success" : s === "rejected" ? "error" : "warning";