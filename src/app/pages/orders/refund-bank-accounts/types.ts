export interface Account {
  id: number;
  account_name: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  opening_balance: number;
  is_active: boolean;
  total_paid: number;
  closing_balance: number;
  payments_count: number;
}

export interface AccountStats {
  total: number;
  active: number;
  inactive: number;
  total_paid: number;
}

export const EMPTY_ACCOUNT_STATS: AccountStats = { total: 0, active: 0, inactive: 0, total_paid: 0 };

export interface AccountFormValues {
  account_name: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  opening_balance: string;
}

export const emptyAccountForm = (): AccountFormValues => ({
  account_name: "",
  bank_name: "",
  account_holder_name: "",
  account_number: "",
  ifsc_code: "",
  opening_balance: "0",
});

export interface LedgerRow {
  id: number;
  date: string;
  voucher_no: string;
  refund_id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  payment_mode: string;
  reference_no: string;
  narration: string;
  amount_out: number;
  balance: number;
  proof: string | null;
}

export interface LedgerData {
  account: {
    id: number;
    account_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    is_active: boolean;
  };
  opening_balance: number;
  total_paid: number;
  closing_balance: number;
  count: number;
  ledger: LedgerRow[];
}

export const BASE = "ecommerce/admin/refund-bank-accounts/";