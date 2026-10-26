// Item Verification – TypeScript types & helpers

export type ItemStatus = "pending" | "approved" | "rejected" | "draft";

export interface ItemVariant {
  id: number;
  size?: string | null;
  color?: string | null;
  mrp: number;
  price: number;
  stock: number;
  image?: string | null;
}

export interface ItemSpec {
  title: string;
  value: string;
}

export interface WebsiteItem {
  id: number;
  itemName: string;
  branchName: string;
  category: string;
  subCategory?: string | null;
  variants: ItemVariant[];
  variantsCount: number;
  totalStock: number;
  finalPrice: number;
  websiteStatus: ItemStatus;
  linkedProduct: number | null;
  createdAt: string;
  // images
  mainImage?: string | null;
  thumbnailImage?: string | null;
  displayImage?: string | null;
  // detail fields
  shortDescription?: string | null;
  fullDescription?: string | null;
  features: string[];
  specifications: ItemSpec[];
  warrantyAvailable: boolean;
  warrantyType?: string | null;
  warrantyPeriod?: string | null;
  warrantyDescription?: string | null;
  returnPolicy?: string | null;
  returnDays: number;
  deliveryInfo?: string | null;
  freeShipping: boolean;
  condition?: string | null;
}

// ── Media URL helper ─────────────────────────────────────────────────────────
// Backend origin used for /media/... files. Set VITE_API_URL in your .env
// (a trailing "/api" is stripped automatically). Fallback is local dev.
const MEDIA_BASE: string =
  (((import.meta as any).env?.VITE_API_URL as string | undefined) || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "") || "http://localhost:8000";

export function getMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return "";
  if (/^(https?:|data:|blob:)/i.test(mediaPath)) return mediaPath;
  if (mediaPath.startsWith("/media/")) return `${MEDIA_BASE}${mediaPath}`;
  if (!mediaPath.includes("/")) return `${MEDIA_BASE}/media/${mediaPath}`;
  return `${MEDIA_BASE}${mediaPath.startsWith("/") ? "" : "/"}${mediaPath}`;
}

// Inline placeholder (no external request)
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f0f4f8"/><text x="50" y="54" font-size="12" text-anchor="middle" fill="#94a3b8" font-family="sans-serif">No image</text></svg>',
  );

function parseList(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapApiItem(raw: Record<string, any>): WebsiteItem {
  const status = String(
    raw.website_status ?? raw.websiteStatus ?? raw.status ?? "pending",
  ).toLowerCase() as ItemStatus;

  const variants: ItemVariant[] = (
    raw.variants ?? raw.product_variants ?? []
  ).map((v: any) => ({
    id: Number(v.id ?? 0),
    size: v.size ?? v.size_name ?? null,
    color: v.color ?? v.color_name ?? null,
    mrp: Number(v.mrp ?? v.original_price ?? 0),
    price: Number(
      v.salesPrice ?? v.price ?? v.selling_price ?? v.final_price ?? 0,
    ),
    // current_stock comes as a decimal string ("0.00"); fall back to opStock
    stock:
      Number(v.current_stock) ||
      Number(v.opStock) ||
      Number(v.stock) ||
      Number(v.quantity) ||
      0,
    image: getMediaUrl(v.variant_image_url ?? v.variant_image ?? v.image) || null,
  }));

  const features: string[] = parseList(raw.description_features ?? raw.features)
    .map((f: any) => (typeof f === "string" ? f : String(f?.value ?? "")))
    .filter(Boolean);

  const specifications: ItemSpec[] = parseList(
    raw.specifications ?? raw.specs,
  ).map((s: any) =>
    typeof s === "string"
      ? { title: "", value: s }
      : { title: String(s?.title ?? s?.name ?? ""), value: String(s?.value ?? "") },
  );

  const mainImage = getMediaUrl(raw.main_image) || null;
  const thumbnailImage = getMediaUrl(raw.thumbnail_image) || null;
  const displayImage = mainImage || thumbnailImage || variants[0]?.image || null;

  const stockFromVariants = variants.reduce((s, v) => s + v.stock, 0);
  const priceFromVariants =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

  return {
    id: Number(raw.id ?? 0),
    itemName: String(raw.itemName ?? raw.item_name ?? raw.name ?? ""),
    branchName: String(raw.branch_name ?? raw.branchName ?? ""),
    category: String(raw.category ?? ""),
    subCategory: raw.subCategory ?? raw.sub_category ?? raw.sub_cat ?? null,
    variants,
    variantsCount: Number(raw.variants_count ?? variants.length),
    totalStock: Number(raw.total_stock ?? stockFromVariants),
    finalPrice: Number(raw.final_price ?? priceFromVariants),
    websiteStatus: ["pending", "approved", "rejected", "draft"].includes(status)
      ? status
      : "pending",
    linkedProduct: raw.linked_product ? Number(raw.linked_product) : null,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    mainImage,
    thumbnailImage,
    displayImage,
    shortDescription: raw.short_description ?? raw.shortDescription ?? raw.short ?? null,
    fullDescription: raw.full_description ?? raw.fullDescription ?? null,
    features,
    specifications,
    warrantyAvailable: Boolean(raw.warranty_available ?? false),
    warrantyType: raw.warranty_type ?? null,
    warrantyPeriod: raw.warranty_period ?? null,
    warrantyDescription: raw.warranty_description ?? null,
    returnPolicy: raw.return_policy ?? raw.returnPolicy ?? null,
    returnDays: Number(raw.return_days ?? 0),
    deliveryInfo: raw.estimated_delivery_time ?? raw.delivery_info ?? raw.delivery ?? null,
    freeShipping: Boolean(raw.free_shipping ?? raw.freeShipping ?? false),
    condition: raw.product_condition ?? raw.condition ?? null,
  };
}

export const STATUS_TABS: { key: ItemStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "draft", label: "Draft" },
];

export function statusColor(s: ItemStatus | string) {
  if (s === "approved") return "success";
  if (s === "rejected") return "error";
  if (s === "draft") return "neutral";
  return "warning";
}