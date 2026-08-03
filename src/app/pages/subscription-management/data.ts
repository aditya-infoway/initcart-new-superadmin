export interface SubscriptionPlan {
  id: string;
  numericId: number;
  serviceType: string;
  subscriptionType: string;
  amount: number;
  amountLabel: string;
  description: string;
  isActive: boolean;
}

export interface SubscriptionFormValues {
  serviceType: string;
  subscriptionType: string;
  amount: string;
  description: string;
  isActive: boolean;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activePlans: number;
  serviceTypes: number;
  averageAmount: number;
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(toNumber(value));
}

function normalizeServiceType(item: any): string {
  return String(item?.service_type || item?.serviceType || item?.service_type_name || "—");
}

function normalizeSubscriptionType(item: any): string {
  return String(item?.subscription_type || item?.subscriptionType || item?.duration || "—");
}

export function mapApiSubscriptionPlan(item: any): SubscriptionPlan {
  const amount = toNumber(item?.amount);
  return {
    id: String(item?.id || ""),
    numericId: toNumber(item?.id),
    serviceType: normalizeServiceType(item),
    subscriptionType: normalizeSubscriptionType(item),
    amount,
    amountLabel: formatCurrency(amount),
    description: String(item?.description || "—"),
    isActive: Boolean(item?.is_active),
  };
}

export function createSubscriptionStats(rows: SubscriptionPlan[]): SubscriptionStats {
  const totalSubscriptions = rows.length;
  const activePlans = rows.filter((row) => row.isActive).length;
  const serviceTypes = new Set(rows.map((row) => row.serviceType).filter(Boolean)).size;
  const averageAmount = totalSubscriptions
    ? rows.reduce((sum, row) => sum + row.amount, 0) / totalSubscriptions
    : 0;

  return {
    totalSubscriptions,
    activePlans,
    serviceTypes,
    averageAmount,
  };
}

export function buildSubscriptionPayload(values: SubscriptionFormValues) {
  return {
    service_type: values.serviceType,
    subscription_type: values.subscriptionType,
    amount: Number(values.amount || 0),
    description: values.description,
    is_active: values.isActive,
  };
}

export function emptySubscriptionForm(): SubscriptionFormValues {
  return {
    serviceType: "",
    subscriptionType: "",
    amount: "",
    description: "",
    isActive: true,
  };
}
