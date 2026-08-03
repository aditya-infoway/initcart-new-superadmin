export interface Category {
  id: string;
  name: string;
  description: string;
  platformCharge: string;
  icon: string;
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
  icon?: FileList;
}

export const emptyCategory = (): Category => ({
  id: "",
  name: "",
  description: "",
  platformCharge: "0",
  icon: "",
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
  name: pickString(item.name),
  description: pickString(item.description),
  platformCharge: pickString(item.platform_charge, item.platformCharge, 0),
  icon: pickString(item.icon_url, item.icon),
  status: item.status === true || item.status === "active" ? "active" : "inactive",
  isActive: Boolean(item.status === true || item.status === "active"),
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

  const iconFile = values.icon?.[0];
  if (iconFile) {
    formData.append("icon", iconFile);
  }

  return formData;
};
