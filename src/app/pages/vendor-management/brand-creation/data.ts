export interface Brand {
  id: string;
  brandName: string;
  description: string;
  brandLogo: string;
  totalProducts: number;
  approvedProducts: number;
  status: string;
  createdAt?: string;
}

export interface BrandFormValues {
  brandName: string;
  description: string;
  status: string;
  brandLogo?: FileList;
}

export const emptyBrand = (): Brand => ({
  id: "",
  brandName: "",
  description: "",
  brandLogo: "",
  totalProducts: 0,
  approvedProducts: 0,
  status: "active",
});

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
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

export const mapApiBrandToBrand = (item: any): Brand => ({
  id: String(item.id ?? item.brand_id ?? item.brandId ?? ""),
  brandName: pickString(item.brand_name, item.brandName, item.name),
  description: pickString(item.description, item.brand_description, item.brandDescription),
  brandLogo: pickString(item.brand_logo, item.brandLogo, item.logo, item.logo_url, item.logoUrl),
  totalProducts: pickNumber(item.total_products, item.totalProducts, item.total_product_count),
  approvedProducts: pickNumber(item.approved_products, item.approvedProducts, item.approved_product_count),
  status: pickString(item.status).toLowerCase() || "active",
  createdAt: item.created_at ?? item.createdAt ?? item.created,
});

export const buildBrandFormData = (
  values: BrandFormValues,
  brandId?: string,
) => {
  const formData = new FormData();

  if (brandId) formData.append("id", brandId);
  formData.append("brand_name", values.brandName.trim());
  formData.append("description", values.description.trim());
  formData.append("status", values.status);

  const logoFile = values.brandLogo?.[0];
  if (logoFile) {
    formData.append("brand_logo", logoFile);
  }

  return formData;
};
