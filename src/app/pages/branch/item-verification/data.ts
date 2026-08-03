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

export interface WebsiteItem {
  id: number;
  itemName: string;
  branchName: string;
  category: string;
  subCategory?: string | null;
  variants: ItemVariant[];
  totalStock: number;
  finalPrice: number;
  websiteStatus: ItemStatus;
  createdAt: string;
  // detail fields
  shortDescription?: string | null;
  features?: string[] | null;
  specifications?: string[] | null;
  warranty?: string | null;
  returnPolicy?: string | null;
  deliveryInfo?: string | null;
  freeShipping?: boolean;
  condition?: string | null;
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
    price: Number(v.price ?? v.selling_price ?? v.final_price ?? 0),
    stock: Number(v.stock ?? v.quantity ?? 0),
    image: v.image ?? v.variant_image ?? null,
  }));

  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const finalPrice =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

  return {
    id: Number(raw.id ?? 0),
    itemName: String(raw.itemName ?? raw.item_name ?? raw.name ?? ""),
    branchName: String(raw.branch_name ?? raw.branchName ?? ""),
    category: String(raw.category ?? ""),
    subCategory: raw.sub_category ?? raw.subCategory ?? raw.sub_cat ?? null,
    variants,
    totalStock,
    finalPrice,
    websiteStatus: ["pending", "approved", "rejected", "draft"].includes(status)
      ? status
      : "pending",
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    shortDescription: raw.short ?? raw.short_description ?? raw.shortDescription ?? null,
    features: raw.features ?? null,
    specifications: raw.specifications ?? raw.specs ?? null,
    warranty: raw.warranty ?? null,
    returnPolicy: raw.return_policy ?? raw.returnPolicy ?? raw.return ?? null,
    deliveryInfo: raw.delivery ?? raw.delivery_info ?? null,
    freeShipping: Boolean(raw.free_shipping ?? raw.freeShipping ?? false),
    condition: raw.condition ?? null,
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
