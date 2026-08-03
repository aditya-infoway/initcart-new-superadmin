export type OrderStatusTab =
  | "all"
  | "pending"
  | "confirmed"
  | "packaging"
  | "out_for_delivery"
  | "delivered"
  | "canceled"
  | "returned"
  | "failed";

export interface OrderStats {
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  todayOrders: number;
  todayRevenue: number;
  counts: Record<OrderStatusTab, number>;
  paymentCompleted: number;
  paymentPending: number;
}

export interface OrderRow {
  id: string;
  numericId?: number;
  orderId: string;
  orderDate: string;
  orderDateRaw: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  storeName: string;
  totalAmount: number;
  totalAmountLabel: string;
  paymentStatus: string;
  orderStatus: OrderStatusTab;
  orderStatusLabel: string;
  itemCount: number;
}

export interface OrderItemRow {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  itemStatus: string;
  vendorName: string;
  taxAmount: string;
  discountAmount: string;
  image: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatusTab;
  orderStatusLabel: string;
  notes: string;
  totalAmount: string;
  shippingCharge: string;
  taxAmount: string;
  discountAmount: string;
  finalAmount: string;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  items: OrderItemRow[];
  referralAgentName: string;
  referralAgentType: string;
  mlmCommissionProcessed: boolean;
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number | string | null | undefined): string {
  const amount = typeof value === "number" ? value : toNumber(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function normalizeOrderStatus(status: string | null | undefined): OrderStatusTab {
  const value = String(status || "").toLowerCase().trim();

  switch (value) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "packaging":
    case "packed":
    case "processing":
      return "packaging";
    case "shipped":
    case "out_for_delivery":
    case "out for delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    case "cancelled":
    case "canceled":
      return "canceled";
    case "refunded":
    case "returned":
      return "returned";
    case "failed":
    case "failed_to_deliver":
    case "failed to deliver":
      return "failed";
    default:
      return "pending";
  }
}

export function getOrderStatusLabel(status: OrderStatusTab): string {
  switch (status) {
    case "all":
      return "All Orders";
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "packaging":
      return "Packaging";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
    case "canceled":
      return "Canceled";
    case "returned":
      return "Returned";
    case "failed":
      return "Failed to Deliver";
    default:
      return "Pending";
  }
}

export const orderStatusTabs: { key: OrderStatusTab; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packaging", label: "Packaging" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "canceled", label: "Canceled" },
  { key: "returned", label: "Returned" },
  { key: "failed", label: "Failed to Deliver" },
];

export function createEmptyOrderStats(): OrderStats {
  return {
    totalOrders: 0,
    totalCustomers: 0,
    totalVendors: 0,
    todayOrders: 0,
    todayRevenue: 0,
    counts: {
      all: 0,
      pending: 0,
      confirmed: 0,
      packaging: 0,
      out_for_delivery: 0,
      delivered: 0,
      canceled: 0,
      returned: 0,
      failed: 0,
    },
    paymentCompleted: 0,
    paymentPending: 0,
  };
}

export function mapDashboardStats(payload: any): OrderStats {
  const data = payload?.data ?? payload ?? {};
  const statusCounts = data?.status_counts ?? {};
  const stats = createEmptyOrderStats();

  stats.totalOrders = toNumber(data?.total_orders);
  stats.totalCustomers = toNumber(data?.total_customers);
  stats.totalVendors = toNumber(data?.total_vendors);
  stats.todayOrders = toNumber(data?.today_orders);
  stats.todayRevenue = toNumber(data?.today_revenue);
  stats.paymentCompleted = toNumber(data?.payment_status_counts?.completed);
  stats.paymentPending = toNumber(data?.payment_status_counts?.pending);

  Object.entries(statusCounts).forEach(([rawKey, rawValue]) => {
    const normalized = normalizeOrderStatus(rawKey);
    stats.counts[normalized] += toNumber(rawValue);
  });

  stats.counts.all = stats.totalOrders;
  return stats;
}

export function mapApiOrderRow(item: any): OrderRow {
  const orderStatus = normalizeOrderStatus(item?.order_status);
  const items = Array.isArray(item?.items) ? item.items : [];
  const primaryItem = items[0];
  const customerName = item?.billing_name || item?.customer_details?.username || "—";
  const customerPhone = item?.billing_phone || item?.customer_details?.phone || item?.customer_details?.username || "—";
  const customerEmail = item?.billing_email || item?.customer_details?.email || "—";
  const storeName =
    primaryItem?.vendor_details?.business_name ||
    item?.vendor_details?.business_name ||
    item?.store_name ||
    "—";
  const amount = toNumber(item?.final_amount ?? item?.total_amount);
  const orderId = String(item?.order_number || item?.id || "—");

  return {
    id: orderId,
    numericId: toNumber(item?.id),
    orderId,
    orderDate: formatDateTime(item?.created_at),
    orderDateRaw: String(item?.created_at || ""),
    customerName: String(customerName),
    customerEmail: String(customerEmail),
    customerPhone: String(customerPhone),
    storeName: String(storeName),
    totalAmount: amount,
    totalAmountLabel: formatCurrency(amount),
    paymentStatus: String(item?.payment_status || "pending"),
    orderStatus,
    orderStatusLabel: getOrderStatusLabel(orderStatus),
    itemCount: items.length,
  };
}

export function mapApiOrderDetail(item: any): OrderDetail {
  const orderStatus = normalizeOrderStatus(item?.order_status);

  return {
    id: toNumber(item?.id),
    orderNumber: String(item?.order_number || "—"),
    createdAt: formatDateTime(item?.created_at),
    updatedAt: formatDateTime(item?.updated_at),
    customerName: String(item?.billing_name || item?.customer_details?.username || "—"),
    customerEmail: String(item?.billing_email || item?.customer_details?.email || "—"),
    customerPhone: String(item?.billing_phone || item?.customer_details?.phone || item?.customer_details?.username || "—"),
    billingName: String(item?.billing_name || "—"),
    billingEmail: String(item?.billing_email || "—"),
    billingPhone: String(item?.billing_phone || "—"),
    billingAddress: [item?.billing_address, item?.billing_city, item?.billing_state, item?.billing_pincode]
      .filter(Boolean)
      .join(", ") || "—",
    shippingName: String(item?.shipping_name || "—"),
    shippingPhone: String(item?.shipping_phone || "—"),
    shippingAddress: [item?.shipping_address, item?.shipping_city, item?.shipping_state, item?.shipping_pincode]
      .filter(Boolean)
      .join(", ") || "—",
    paymentMethod: String(item?.payment_method || "—"),
    paymentStatus: String(item?.payment_status || "pending"),
    orderStatus,
    orderStatusLabel: getOrderStatusLabel(orderStatus),
    notes: String(item?.notes || "—"),
    totalAmount: formatCurrency(item?.total_amount),
    shippingCharge: formatCurrency(item?.shipping_charge),
    taxAmount: formatCurrency(item?.tax_amount),
    discountAmount: formatCurrency(item?.discount_amount),
    finalAmount: formatCurrency(item?.final_amount),
    loyaltyPointsUsed: toNumber(item?.loyalty_points_used),
    loyaltyPointsEarned: toNumber(item?.loyalty_points_earned),
    items: Array.isArray(item?.items)
      ? item.items.map((row: any) => ({
          id: toNumber(row?.id),
          productName: String(row?.product_name || row?.product_details?.product_name || "—"),
          sku: String(row?.sku || "—"),
          quantity: toNumber(row?.quantity),
          unitPrice: formatCurrency(row?.unit_price),
          totalPrice: formatCurrency(row?.total_price),
          itemStatus: String(row?.item_status || "—"),
          vendorName: String(row?.vendor_details?.business_name || "—"),
          taxAmount: formatCurrency(row?.tax_amount),
          discountAmount: formatCurrency(row?.discount_amount),
          image: String(row?.product_details?.main_image || row?.variant_image || ""),
        }))
      : [],
    referralAgentName: String(item?.referral_agent_info?.full_name || "—"),
    referralAgentType: String(item?.referral_agent_info?.agent_type || "—"),
    mlmCommissionProcessed: Boolean(item?.mlm_commission_processed),
  };
}

export const orderExportColumns = [
  { key: "orderId", header: "Order ID" },
  { key: "orderDate", header: "Order Date" },
  { key: "customerName", header: "Customer" },
  { key: "customerPhone", header: "Phone" },
  { key: "storeName", header: "Store" },
  { key: "totalAmountLabel", header: "Total Amount" },
  { key: "orderStatusLabel", header: "Order Status" },
] as const;
