export interface CodRefundItem {
  id: number;
  refund_id: string;
  return_id: string;
  order_number: string;
  product_name: string;
  customer_name: string;
  vendor_name: string;
  refund_amount: number;
  paid_amount: number | null;
  status: "pending" | "processed" | "failed";
  processed_at: string | null;
  created_at: string;
  has_bank_details: boolean | null;
  voucher_no: string | null;
  bank_account_name: string | null;
  payment_mode_display: string | null;
  payment_proof: string | null;
}

export interface CodStats {
  total: number;
  pending: number;
  processed: number;
  total_amount: number;
  pending_amount: number;
  processed_amount: number;
}

export const EMPTY_COD_STATS: CodStats = {
  total: 0, pending: 0, processed: 0, total_amount: 0, pending_amount: 0, processed_amount: 0,
};

export interface BankAccount {
  id: number;
  account_name: string;
  bank_name: string;
  account_number: string;
  closing_balance: number;
}

export interface PayableRefund {
  id: number;
  refund_id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  refund_amount: number;
  has_bank_details: boolean;
}

export interface RefundDetail {
  id: number;
  refund_id: string;
  status: string;
  refund_amount: number;
  customer_info: { username: string; email: string; phone: string; billing_name: string };
  order_info: { order_number: string; order_date: string; final_amount: number };
  return_info: { return_id: string; reason: string; description: string | null; quantity: number };
  product_info: {
    product_name: string; sku: string; color: string | null; size: string | null;
    ordered_quantity: number; returned_quantity_requested: number; unit_price: number;
    total_price: number; image: string | null;
  };
  vendor_name: string;
  bank_details: {
    account_holder_name: string; bank_name: string; account_number: string;
    ifsc_code: string; account_type: string; upi_id: string;
  } | null;
}

export const PAYMENT_MODES = [
  { value: "neft", label: "NEFT" },
  { value: "imps", label: "IMPS" },
  { value: "rtgs", label: "RTGS" },
  { value: "upi", label: "UPI" },
  { value: "net_banking", label: "Net Banking" },
  { value: "cheque", label: "Cheque" },
];

export const MAX_PROOF = 1 * 1024 * 1024;
export const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

export const LIST_URL = "ecommerce/admin/refunds/";
export const PAYABLE_URL = "ecommerce/admin/cod-refunds/payable/";
export const DETAIL_URL = "ecommerce/admin/cod-refunds/";
export const ACCOUNTS_URL = "ecommerce/admin/refund-bank-accounts/";