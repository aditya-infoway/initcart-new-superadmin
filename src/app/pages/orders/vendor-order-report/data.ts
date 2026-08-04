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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};