import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Get, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Badge, Button } from "@/components/ui";
import {
  formatCurrency,
  mapApiOrderDetail,
  OrderDetail,
} from "./data";

function InfoBlock({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-dark-800">
      <div className="text-xs text-gray-500 dark:text-dark-200">{title}</div>
      <div className="mt-1 font-medium text-gray-900 dark:text-white">{value || "—"}</div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700 dark:shadow-none">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await Get(`ecommerce/superadmin/orders/${orderId}/`, {}, false);
      setOrder(mapApiOrderDetail(response.data));
    } catch {
      toasterrormsg("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchOrder]);

  return (
    <Page title="Order Details">
      <div className="transition-content w-full pb-5">
        <div className="px-(--margin-x) pt-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-dark-500 dark:bg-dark-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="outlined" onClick={() => navigate("/orders/all-orders")}>
                  <span className="flex items-center gap-2">
                    <ArrowLeftIcon className="size-4" />
                    Back
                  </span>
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-50">
                    {loading ? "Order Details" : order?.orderNumber || "Order Details"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                    View customer, payment, delivery and item level information.
                  </p>
                </div>
              </div>
              <Button color="primary" variant="outlined" onClick={fetchOrder}>
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="size-4" />
                  Refresh
                </span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200">
              Loading order details...
            </div>
          ) : !order ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-200">
              Order details not found.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 xl:grid-cols-4">
                <InfoBlock title="Order Date" value={order.createdAt} />
                <InfoBlock title="Final Amount" value={order.finalAmount} />
                <InfoBlock title="Payment Method" value={String(order.paymentMethod).toUpperCase()} />
                <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-dark-800">
                  <div className="text-xs text-gray-500 dark:text-dark-200">Order Status</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge color="success" variant="soft">{order.orderStatusLabel}</Badge>
                    <Badge color={order.paymentStatus === "completed" ? "success" : "warning"} variant="soft">
                      Payment {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SectionCard title="Customer Information" icon={<UserIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Name:</span> {order.customerName}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Email:</span> {order.customerEmail}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Phone:</span> {order.customerPhone}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Notes:</span> {order.notes}</div>
                  </div>
                </SectionCard>

                <SectionCard title="Billing Address" icon={<MapPinIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Name:</span> {order.billingName}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Email:</span> {order.billingEmail}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Phone:</span> {order.billingPhone}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Address:</span> {order.billingAddress}</div>
                  </div>
                </SectionCard>

                <SectionCard title="Shipping Address" icon={<MapPinIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Name:</span> {order.shippingName}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Phone:</span> {order.shippingPhone}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Address:</span> {order.shippingAddress}</div>
                  </div>
                </SectionCard>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SectionCard title="Payment Summary" icon={<CreditCardIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div className="flex items-center justify-between gap-3"><span>Total Amount</span><span className="font-medium text-gray-800 dark:text-dark-100">{order.totalAmount}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Shipping Charge</span><span className="font-medium text-gray-800 dark:text-dark-100">{order.shippingCharge}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Tax Amount</span><span className="font-medium text-gray-800 dark:text-dark-100">{order.taxAmount}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Discount</span><span className="font-medium text-gray-800 dark:text-dark-100">{order.discountAmount}</span></div>
                    <div className="border-t border-gray-200 pt-3 font-semibold text-gray-900 dark:border-dark-500 dark:text-white flex items-center justify-between gap-3"><span>Final Amount</span><span>{order.finalAmount}</span></div>
                  </div>
                </SectionCard>

                <SectionCard title="Loyalty & Referral" icon={<CheckCircleIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Loyalty Used:</span> {order.loyaltyPointsUsed}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Loyalty Earned:</span> {order.loyaltyPointsEarned}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Referral Agent:</span> {order.referralAgentName}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Agent Type:</span> {order.referralAgentType}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">MLM Commission:</span> {order.mlmCommissionProcessed ? "Processed" : "Pending"}</div>
                  </div>
                </SectionCard>

                <SectionCard title="Order Timeline" icon={<ShoppingBagIcon className="size-5" />}>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-dark-200">
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Created At:</span> {order.createdAt}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Updated At:</span> {order.updatedAt}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Items:</span> {order.items.length}</div>
                    <div><span className="font-medium text-gray-800 dark:text-dark-100">Payable:</span> {formatCurrency(order.finalAmount)}</div>
                  </div>
                </SectionCard>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-500 dark:bg-dark-700 dark:shadow-none">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    <ShoppingBagIcon className="size-5" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ordered Items</h2>
                </div>

                <div className="grid gap-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-dark-500 dark:bg-dark-800">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.productName}</div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-dark-300">SKU: {item.sku}</div>
                          <div className="mt-2 text-sm text-gray-600 dark:text-dark-200">Vendor: {item.vendorName}</div>
                        </div>
                        <Badge color="success" variant="soft">{item.itemStatus}</Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <InfoBlock title="Quantity" value={item.quantity} />
                        <InfoBlock title="Unit Price" value={item.unitPrice} />
                        <InfoBlock title="Tax Amount" value={item.taxAmount} />
                        <InfoBlock title="Discount" value={item.discountAmount} />
                        <InfoBlock title="Total" value={item.totalPrice} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
