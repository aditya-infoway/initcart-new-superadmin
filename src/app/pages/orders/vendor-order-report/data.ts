// pages/ecommerce/admin/reports/data.ts

export interface AdminOrderReportRow {
  sr_no: number;
  order_id: number;
  order_number: string;
  order_time: string;
  order_status: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_email: string;
  payment_mode: string;
  order_amount: number;
  platform_charge: number;
  received_amount: number;
  order_age_days: number;
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
}

export interface Pagination {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export const DEFAULT_PAGE_SIZE = 15;

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Date helpers (local date, not UTC: avoids "yesterday" in IST mornings) ──
const pad = (n: number) => String(n).padStart(2, '0');

export const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayStr = () => toLocalDateStr(new Date());

export const daysAgoStr = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateStr(d);
};

// ── Export helpers ──────────────────────────────────────────────────────────
export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const csvCell = (value: unknown): string =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

export const orderAgeLabel = (days: number) =>
  days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''}`;