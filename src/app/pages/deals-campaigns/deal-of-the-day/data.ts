export type DealPlacement = "main_section" | "product_list" | "hero_banner" | "unassigned";

export interface DealOfTheDayRow {
  id: string;
  productId: string;
  productName: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  campaignId: string;
  campaignName: string;
  startTime: string;
  endTime: string;
  pricing: string;
  placement: DealPlacement;
  discountCheck: string;
  status: string;
  isBannerProduct: boolean;
}

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
};

const pickArray = (...values: any[]) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

const normalizeStatus = (value: any) => {
  return String(value || "inactive").toLowerCase() === "active" ? "approved" : "pending";
};

const resolvePlacement = (item: any): DealPlacement => {
  const raw = pickString(item.placement, item.deal_of_day_placement).toLowerCase();
  if (raw.includes("main")) return "main_section";
  if (raw.includes("product")) return "product_list";
  if (raw.includes("hero") || raw.includes("banner")) return "hero_banner";
  return "unassigned";
};

const buildVendorSummary = (vendor: any) => ({
  vendorName: pickString(vendor?.business_name, vendor?.owner_name, "—"),
  vendorEmail: pickString(vendor?.email),
  vendorPhone: pickString(vendor?.phone),
});

export const mapApiDealOfTheDayRows = (item: any): DealOfTheDayRow[] => {
  const vendors = pickArray(item.selected_vendors_details);
  const placement = resolvePlacement(item);
  const status = normalizeStatus(item.status);
  const categoriesText = pickArray(item.categories_details)
    .map((category: any) => pickString(category?.name))
    .filter(Boolean)
    .join(", ");

  if (vendors.length === 0) {
    return [
      {
        id: `${item.id}-0`,
        productId: pickString(item.id),
        productName: categoriesText || item.campaign_name || "Deal of the Day Product",
        vendorName: "—",
        vendorEmail: "",
        vendorPhone: "",
        campaignId: pickString(item.campaign_id, item.id),
        campaignName: pickString(item.campaign_name),
        startTime: pickString(item.start_datetime),
        endTime: pickString(item.end_datetime),
        pricing: `Min ${pickString(item.minimum_discount, 0)}%`,
        placement,
        discountCheck: `${pickString(item.minimum_discount, 0)}%`,
        status,
        isBannerProduct: placement === "hero_banner",
      },
    ];
  }

  return vendors.map((vendor: any, index: number) => {
    const summary = buildVendorSummary(vendor);
    return {
      id: `${item.id}-${vendor?.id ?? index}`,
      productId: pickString(vendor?.id, item.id),
      productName: categoriesText || item.campaign_name || "Deal of the Day Product",
      vendorName: summary.vendorName,
      vendorEmail: summary.vendorEmail,
      vendorPhone: summary.vendorPhone,
      campaignId: pickString(item.campaign_id, item.id),
      campaignName: pickString(item.campaign_name),
      startTime: pickString(item.start_datetime),
      endTime: pickString(item.end_datetime),
      pricing: `Min ${pickString(item.minimum_discount, 0)}%`,
      placement,
      discountCheck: `${pickString(item.minimum_discount, 0)}%`,
      status,
      isBannerProduct: placement === "hero_banner",
    };
  });
};

export const placementOptions = [
  { id: "", label: "All Placements" },
  { id: "main_section", label: "Main Section" },
  { id: "product_list", label: "Product List" },
  { id: "hero_banner", label: "Hero Banner" },
  { id: "unassigned", label: "Unassigned" },
];

export const statusOptions = [
  { id: "", label: "All Status" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
];
