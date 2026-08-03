// ── Types ──────────────────────────────────────────────────────────────────

export type PropertyStatus = "pending" | "approved" | "rejected" | string;

export interface PropertyImage {
  id: number;
  image: string;
  image_url: string;
  image_type: "main" | "thumbnail" | "additional" | string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface VendorDetails {
  id: number;
  business_name: string;
  vendor_type: string;
  vendor_subtype: string;
  owner_name: string;
  email: string;
  phone: string;
  status: string;
  verification_label: string;
  created_at: string;
  store_logo: string;
  store_logo_url: string;
}

export interface RealEstateProperty {
  id: number;
  property_id: string;
  title: string;
  slug: string;
  transaction_type: string; // sale | rent
  description: string;
  short_description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string | null;
  longitude: string | null;
  google_map_url: string | null;
  landmark: string | null;
  total_area_size: string;
  carpet_area: string;
  built_up_area: string;
  bedrooms: number;
  bathrooms: string;
  balconies: number;
  furnishing_status: string;
  floor_number: number;
  total_floors: number;
  facing_direction: string;
  property_age: string;
  ownership_type: string;
  encumbrance_certificate: string;
  rea_number: string;
  rera_number: string;
  rera_registered: boolean;
  loan_availability: boolean;
  documents_available: string;
  negotiable: boolean;
  price: string;
  maintenance_charges: string;
  booking_amount: string;
  security_deposit: string;
  price_per_sqft: string;
  contact_type: string;
  contact_name: string;
  contact_mobile: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_preferred_time: string | null;
  use_vendor_info: boolean;
  status: PropertyStatus;
  is_featured: boolean;
  is_verified: boolean;
  is_premium: boolean;
  views_count: number;
  enquiry_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  approved_at: string | null;
  construction_status: string;
  amenities: string[];
  nearby_facilities: Record<string, string>;
  documents: any;
  document_url: string | null;
  floor_plan: string | null;
  virtual_tour_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  property_type: string;
  subcategory: string | null;
  vendor: number;
  user: number;
  approved_by: number | null;
  vendor_details: VendorDetails;
  images: PropertyImage[];
}

export interface RealEstateSubcategory {
  id: string;
  parent_service: string;
  subcategory_name: string;
  description: string;
  status: string;
}

export interface PropertyEnquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
  status: string;
}

// ── Mapper ──────────────────────────────────────────────────────────────────

export function mapApiToProperty(raw: any): RealEstateProperty {
  return {
    id: Number(raw.id ?? 0),
    property_id: String(raw.property_id ?? ""),
    title: String(raw.title ?? "").trim() || "—",
    slug: String(raw.slug ?? ""),
    transaction_type: String(raw.transaction_type ?? ""),
    description: String(raw.description ?? ""),
    short_description: raw.short_description ?? null,
    address: String(raw.address ?? ""),
    city: String(raw.city ?? ""),
    state: String(raw.state ?? ""),
    pincode: String(raw.pincode ?? ""),
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    google_map_url: raw.google_map_url ?? null,
    landmark: raw.landmark ?? null,
    total_area_size: String(raw.total_area_size ?? "0"),
    carpet_area: String(raw.carpet_area ?? "0"),
    built_up_area: String(raw.built_up_area ?? "0"),
    bedrooms: Number(raw.bedrooms ?? 0),
    bathrooms: String(raw.bathrooms ?? "0"),
    balconies: Number(raw.balconies ?? 0),
    furnishing_status: String(raw.furnishing_status ?? ""),
    floor_number: Number(raw.floor_number ?? 0),
    total_floors: Number(raw.total_floors ?? 0),
    facing_direction: String(raw.facing_direction ?? ""),
    property_age: String(raw.property_age ?? ""),
    ownership_type: String(raw.ownership_type ?? ""),
    encumbrance_certificate: String(raw.encumbrance_certificate ?? ""),
    rea_number: String(raw.rea_number ?? ""),
    rera_number: String(raw.rera_number ?? ""),
    rera_registered: Boolean(raw.rera_registered),
    loan_availability: Boolean(raw.loan_availability),
    documents_available: String(raw.documents_available ?? ""),
    negotiable: Boolean(raw.negotiable),
    price: String(raw.price ?? "0"),
    maintenance_charges: String(raw.maintenance_charges ?? "0"),
    booking_amount: String(raw.booking_amount ?? "0"),
    security_deposit: String(raw.security_deposit ?? "0"),
    price_per_sqft: String(raw.price_per_sqft ?? "0"),
    contact_type: String(raw.contact_type ?? ""),
    contact_name: String(raw.contact_name ?? ""),
    contact_mobile: String(raw.contact_mobile ?? ""),
    contact_whatsapp: String(raw.contact_whatsapp ?? ""),
    contact_email: String(raw.contact_email ?? ""),
    contact_preferred_time: raw.contact_preferred_time ?? null,
    use_vendor_info: Boolean(raw.use_vendor_info),
    status: String(raw.status ?? "pending").toLowerCase(),
    is_featured: Boolean(raw.is_featured),
    is_verified: Boolean(raw.is_verified),
    is_premium: Boolean(raw.is_premium),
    views_count: Number(raw.views_count ?? 0),
    enquiry_count: Number(raw.enquiry_count ?? 0),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    published_at: raw.published_at ?? null,
    approved_at: raw.approved_at ?? null,
    construction_status: String(raw.construction_status ?? ""),
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    nearby_facilities:
      raw.nearby_facilities && typeof raw.nearby_facilities === "object"
        ? raw.nearby_facilities
        : {},
    documents: raw.documents ?? null,
    document_url: raw.document_url ?? null,
    floor_plan: raw.floor_plan ?? null,
    virtual_tour_url: raw.virtual_tour_url ?? null,
    seo_title: raw.seo_title ?? null,
    seo_description: raw.seo_description ?? null,
    seo_keywords: raw.seo_keywords ?? null,
    property_type: String(raw.property_type ?? ""),
    subcategory: raw.subcategory ?? null,
    vendor: Number(raw.vendor ?? 0),
    user: Number(raw.user ?? 0),
    approved_by: raw.approved_by != null ? Number(raw.approved_by) : null,
    vendor_details: raw.vendor_details ?? {
      id: 0,
      business_name: "—",
      vendor_type: "",
      vendor_subtype: "",
      owner_name: "—",
      email: "",
      phone: "",
      status: "",
      verification_label: "",
      created_at: "",
      store_logo: "",
      store_logo_url: "",
    },
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function formatIndianPrice(value: string | number): string {
  const n = Number(value);
  if (isNaN(n)) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

export function capitalize(s: string): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

export const FURNISHING_LABEL: Record<string, string> = {
  fully_furnished: "Fully Furnished",
  semi_furnished: "Semi Furnished",
  unfurnished: "Unfurnished",
};

export const CONSTRUCTION_LABEL: Record<string, string> = {
  ready_to_move: "Ready to Move",
  under_construction: "Under Construction",
  new_launch: "New Launch",
};
