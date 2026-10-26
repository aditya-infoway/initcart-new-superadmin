export interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export const EMPTY_PAGINATION: PaginationInfo = {
  count: 0, total_pages: 1, current_page: 1, page_size: 10, has_next: false, has_previous: false,
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

// message / detail / first field error from the API
export const apiError = (error: any, fallback: string) => {
  const d = error?.response?.data;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  if (d.message) return String(d.message);
  if (d.detail) return String(d.detail);
  return fallback;
};

export const REFUND_ROUTES = {
  codRefunds: "/orders/cod-refunds",
  bankAccounts: "/orders/refund-bank-accounts",
};