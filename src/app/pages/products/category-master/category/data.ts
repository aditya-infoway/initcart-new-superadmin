
//data.tsx
export interface Category {
  id: string;
  name: string;
  description: string;
  platformCharge: string;
  icon: string;
  banner: string;
  status: string;
  isActive: boolean;
  showOnHomepage: boolean;
  featured: boolean;
  featuredOrder: number;
}

export interface CategoryFormValues {
  name: string;
  description: string;
  platformCharge: string;
  status: string;
  showOnHomepage: string;
  icon?: File | null;
  banner?: File | null;
}

export const emptyCategory = (): Category => ({
  id: "",
  name: "",
  description: "",
  platformCharge: "0",
  icon: "",
  banner: "",
  status: "active",
  isActive: true,
  showOnHomepage: false,
  featured: false,
  featuredOrder: 0,
});

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
};

export const mapApiCategoryToCategory = (item: any): Category => ({
  id: String(item.id ?? ""),
  name: pickString(item.name, item.category),
  description: pickString(item.description),
  platformCharge: pickString(item.platform_charge, item.platformCharge, 0),
  icon: pickString(item.icon_url, item.icon),
  banner: pickString(item.banner_url, item.banner),
  status:
    item.status === true || item.status === "active" || item.status === "Active"
      ? "active"
      : "inactive",
  isActive: Boolean(
    item.status === true || item.status === "active" || item.status === "Active",
  ),
  showOnHomepage: Boolean(item.web_home),
  featured: Boolean(item.is_featured),
  featuredOrder: Number(item.featured_order ?? 0),
});

export const buildCategoryFormData = (values: CategoryFormValues) => {
  const formData = new FormData();
  formData.append("name", values.name.trim());
  formData.append("description", values.description.trim());
  formData.append("platform_charge", values.platformCharge.trim());
  formData.append("status", values.status === "active" ? "true" : "false");
  formData.append("web_home", values.showOnHomepage === "yes" ? "true" : "false");

  if (values.icon) formData.append("icon", values.icon);
  if (values.banner) formData.append("banner_image", values.banner);

  return formData;
};