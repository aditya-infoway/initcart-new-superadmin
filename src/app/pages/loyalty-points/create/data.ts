export type PointsType = "percentage" | "fixed" | "tiered";

export interface LoyaltyRule {
  id: string;
  ruleName: string;
  pointsType: PointsType | "";
  earnedOn: string;
  priority: number;
  percentageRate: string;
  fixedPoints: string;
  tieredValue: string;
  minOrderAmount: string;
  maxPointsPerOrder: string;
  validFrom: string;
  validTo: string;
  status: string;
  isActive: boolean;
  createdAt?: string;
}

export interface LoyaltyRuleFormValues {
  ruleName: string;
  pointsType: PointsType | "";
  earnedOn: string;
  priority: number;
  percentageRate: string;
  fixedPoints: string;
  tieredValue: string;
  minOrderAmount: string;
  maxPointsPerOrder: string;
  validFrom: string;
  validTo: string;
  status: string;
}

export const pointsTypeOptions = [
  { id: "percentage", label: "Percentage of Purchase" },
  { id: "fixed", label: "Fixed Points per Order" },
  { id: "tiered", label: "Tiered (Price Range Based)" },
];

export const earnedOnOptions = [
  { id: "all_orders", label: "All Orders" },
  { id: "first_order", label: "First Order" },
  { id: "repeat_orders", label: "Repeat Orders" },
  { id: "festival_orders", label: "Festival Orders" },
];

export const emptyLoyaltyRule = (): LoyaltyRule => ({
  id: "",
  ruleName: "",
  pointsType: "",
  earnedOn: "all_orders",
  priority: 1,
  percentageRate: "1",
  fixedPoints: "",
  tieredValue: "",
  minOrderAmount: "0",
  maxPointsPerOrder: "",
  validFrom: "",
  validTo: "",
  status: "active",
  isActive: true,
});

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
};

const pickNumber = (...values: any[]) => {
  for (const value of values) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const normalizePointsType = (value: string): PointsType | "" => {
  const normalized = value.toLowerCase().trim();
  if (["percentage", "fixed", "tiered"].includes(normalized)) {
    return normalized as PointsType;
  }
  return "";
};

const normalizeStatus = (value: string, isActive?: boolean) => {
  if (value) return value.toLowerCase();
  return isActive ? "active" : "inactive";
};

export const mapApiLoyaltyRule = (item: any): LoyaltyRule => {
  const isActive = Boolean(item.is_active ?? item.isActive ?? item.status === "active");
  return {
    id: String(item.id ?? item.rule_id ?? item.ruleId ?? ""),
    ruleName: pickString(item.rule_name, item.ruleName, item.name),
    pointsType: normalizePointsType(pickString(item.points_type, item.pointsType)),
    earnedOn: pickString(item.earned_on, item.earnedOn, "all_orders"),
    priority: pickNumber(item.priority, 1),
    percentageRate: pickString(item.percentage_rate, item.percentageRate),
    fixedPoints: pickString(item.fixed_points, item.fixedPoints),
    tieredValue: pickString(item.tiered_value, item.tieredValue),
    minOrderAmount: pickString(item.min_order_amount, item.minOrderAmount, 0),
    maxPointsPerOrder: pickString(item.max_points_per_order, item.maxPointsPerOrder),
    validFrom: pickString(item.valid_from, item.validFrom),
    validTo: pickString(item.valid_to, item.validTo),
    status: normalizeStatus(pickString(item.status), isActive),
    isActive,
    createdAt: item.created_at ?? item.createdAt ?? item.created,
  };
};

export const buildLoyaltyRulePayload = (values: LoyaltyRuleFormValues) => ({
  rule_name: values.ruleName.trim(),
  points_type: values.pointsType,
  earned_on: values.earnedOn,
  priority: Number(values.priority),
  percentage_rate: values.pointsType === "percentage" ? values.percentageRate.trim() : "",
  fixed_points: values.pointsType === "fixed" ? values.fixedPoints.trim() : "",
  tiered_value: values.pointsType === "tiered" ? values.tieredValue.trim() : "",
  min_order_amount: values.minOrderAmount.trim(),
  max_points_per_order: values.maxPointsPerOrder.trim(),
  valid_from: values.validFrom,
  valid_to: values.validTo,
  status: values.status,
});
