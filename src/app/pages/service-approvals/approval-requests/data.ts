// Types & helpers for Service Approval page

export type ServiceStatus = "pending" | "approved" | "rejected";

export type ServiceCategory =
  | "gym"
  | "salon"
  | "restaurant"
  | "professional"
  | "travel_agency"
  | "tech_industry"
  | string;

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: string;
}

export interface ServiceImage {
  id: number;
  image: string;
}

export interface ServiceApproval {
  // unique key = category + id (ids repeat across categories)
  uid: string;
  id: number;
  category: ServiceCategory;
  subcategory: string;
  subcategoryName: string;
  businessName: string;
  address: string;
  location: string;
  country: string;
  state: string;
  city: string;
  openTime: string | null;
  closeTime: string | null;
  contactNo: string;
  whatsappNo: string;
  gmailId: string;
  rating: string;
  description: string;
  taxDescription: string;
  mainImage: string;
  secondImage: string | null;
  multiImages: ServiceImage[];
  status: ServiceStatus;
  isActive: boolean;
  approvedBy: number | null;
  vendor: number;
  approvedDate: string;
  createdAt: string;
  type: string;
  items: ServiceItem[];
}

export function mapApiToServiceApproval(raw: any): ServiceApproval {
  const status = String(raw.status || "pending").toLowerCase() as ServiceStatus;
  return {
    uid: `${raw.category ?? raw.type ?? "unknown"}-${raw.id ?? 0}`,
    id: Number(raw.id ?? 0),
    category: String(raw.category ?? raw.type ?? "unknown").toLowerCase(),
    subcategory: String(raw.subcategory ?? ""),
    subcategoryName: String(raw.subcategory_name ?? raw.subcategoryName ?? ""),
    businessName: String(
      raw.business_name ??
        raw.businessName ??
        raw.restaurant_name ??
        raw.restaurantName ??
        "",
    ).trim() || "—",
    address: String(raw.address ?? ""),
    location: String(raw.location ?? ""),
    country: String(raw.country ?? ""),
    state: String(raw.state ?? ""),
    city: String(raw.city ?? ""),
    openTime: raw.open_time ?? raw.openTime ?? null,
    closeTime: raw.close_time ?? raw.closeTime ?? null,
    contactNo: String(raw.contact_no ?? raw.contactNo ?? ""),
    whatsappNo: String(raw.whatsapp_no ?? raw.whatsappNo ?? ""),
    gmailId: String(raw.gmail_id ?? raw.gmailId ?? raw.email ?? ""),
    rating: String(raw.restaurant_rating ?? raw.rating ?? ""),
    description: String(raw.description ?? ""),
    taxDescription: String(raw.tax_description ?? raw.taxDescription ?? ""),
    mainImage: String(raw.main_image ?? raw.mainImage ?? ""),
    secondImage: raw.second_image ?? raw.secondImage ?? null,
    multiImages: Array.isArray(raw.multi_images)
      ? raw.multi_images
      : Array.isArray(raw.multiImages)
        ? raw.multiImages
        : [],
    status: ["pending", "approved", "rejected"].includes(status) ? status : "pending",
    isActive: Boolean(raw.is_active ?? raw.isActive ?? false),
    approvedBy: raw.approved_by != null ? Number(raw.approved_by) : null,
    vendor: Number(raw.vendor ?? 0),
    approvedDate: String(raw.approved_date ?? raw.approvedDate ?? ""),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
    type: String(raw.type ?? raw.category ?? ""),
    items: Array.isArray(raw.items) ? raw.items : [],
  };
}

export const CATEGORY_LABEL: Record<string, string> = {
  gym: "Gym",
  salon: "Salon",
  restaurant: "Restaurant",
  professional: "Professional",
  travel_agency: "Travel Agency",
  tech: "Tech Industry",
  tech_industry: "Tech Industry",
};

export const CATEGORY_COLOR: Record<
  string,
  "primary" | "success" | "warning" | "info" | "error" | "neutral"
> = {
  gym: "success",
  salon: "warning",
  restaurant: "error",
  professional: "primary",
  travel_agency: "info",
  tech: "neutral",
  tech_industry: "neutral",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABEL[category.toLowerCase()] ?? category;
}

export function getCategoryColor(
  category: string,
): "primary" | "success" | "warning" | "info" | "error" | "neutral" {
  return CATEGORY_COLOR[category.toLowerCase()] ?? "primary";
}

// Static service category tiles shown at the top
export const SERVICE_CATEGORY_TILES = [
  {
    id: "gym-salon-tech-travel",
    label: "Gym & Salon & Tech Industrial Services & Travel Agency",
    icon: "fitness",
    categories: ["gym", "salon", "restaurant", "professional", "travel_agency", "tech", "tech_industry"],
  },
];
