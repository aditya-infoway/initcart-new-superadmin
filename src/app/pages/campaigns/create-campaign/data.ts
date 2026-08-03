export interface CategoryOption {
  id: string;
  label: string;
}

export interface VendorOption {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  productsCount: number;
}

export interface Campaign {
  id: string;
  campaignId: string;
  campaignName: string;
  type: string;
  categories: CategoryOption[];
  startDate: string;
  endDate: string;
  maxVendors: string;
  minDiscount: string;
  minProducts: string;
  description: string;
  status: string;
  vendors: VendorOption[];
}

export interface CampaignFormValues {
  campaignName: string;
  type: string;
  categories: CategoryOption[];
  startDate: string;
  endDate: string;
  maxVendors: string;
  minDiscount: string;
  minProducts: string;
  description: string;
  status: string;
  vendors: VendorOption[];
}

export const campaignTypeOptions = [
  { id: "Flash", label: "Flash Deal" },
  { id: "Deal of the Day", label: "Deal of the Day" },
  { id: "Featured", label: "Featured Products" },
];

export const statusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

export const emptyCampaign = (): Campaign => ({
  id: "",
  campaignId: "",
  campaignName: "",
  type: "Deal of the Day",
  categories: [],
  startDate: "",
  endDate: "",
  maxVendors: "10",
  minDiscount: "0",
  minProducts: "1",
  description: "",
  status: "active",
  vendors: [],
});

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

export const mapApiCategoryOption = (item: any): CategoryOption => ({
  id: String(item.id ?? item.category ?? ""),
  label: pickString(item.name, item.category_name),
});

export const mapApiVendorOption = (item: any): VendorOption => ({
  id: String(item.id ?? item.vendor_id ?? item.vendor?.id ?? ""),
  businessName: pickString(item.business_name, item.businessName, item.vendor_details?.business_name, item.vendor?.business_name),
  ownerName: pickString(item.owner_name, item.ownerName, item.vendor_details?.owner_name, item.vendor?.owner_name),
  email: pickString(item.email, item.vendor_details?.email, item.vendor?.email),
  phone: pickString(item.phone, item.vendor_details?.phone, item.vendor?.phone),
  productsCount: Number(
    item.products_count ??
      item.product_count ??
      item.productsCount ??
      item.approved_products_count ??
      0,
  ),
});

export const mapApiCampaign = (item: any): Campaign => ({
  id: String(item.id ?? ""),
  campaignId: pickString(item.campaign_id, item.id),
  campaignName: pickString(item.campaign_name, item.name, item.title),
  type: pickString(item.campaign_type, item.type),
  categories: pickArray(item.categories_details, item.category_details, item.categories).map(mapApiCategoryOption),
  startDate: pickString(item.start_datetime, item.start_date, item.start_at),
  endDate: pickString(item.end_datetime, item.end_date, item.end_at),
  maxVendors: pickString(item.max_products_per_vendor, item.max_vendors, item.maxVendors),
  minDiscount: pickString(item.minimum_discount, item.min_discount, item.minDiscount),
  minProducts: pickString(item.minimum_product_limit, item.min_products, item.minProducts),
  description: pickString(item.description),
  status: String(item.status).toLowerCase() === "active" || item.status === true ? "active" : "inactive",
  vendors: pickArray(item.selected_vendors_details, item.selected_vendors, item.vendors, item.vendor_details).map(mapApiVendorOption),
});

export const buildCampaignPayload = (values: CampaignFormValues) => ({
  campaign_name: values.campaignName.trim(),
  campaign_type: values.type,
  categories: values.categories.map((item) => Number(item.id)),
  start_datetime: values.startDate,
  end_datetime: values.endDate,
  max_products_per_vendor: Number(values.maxVendors || 0),
  minimum_discount: Number(values.minDiscount || 0),
  minimum_product_limit: Number(values.minProducts || 0),
  description: values.description.trim(),
  status: values.status === "active" ? "Active" : "Inactive",
  selected_vendors: values.vendors.map((item) => Number(item.id)),
});
