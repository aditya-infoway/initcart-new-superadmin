export interface ParentCategoryOption {
  id: string;
  label: string;
}

export interface SubCategory {
  id: string;
  parentCategoryId: string;
  parentCategoryName: string;
  name: string;
  description: string;
  icon: string;
  banner: string;
  status: string;
  isActive: boolean;
}

export interface SubCategoryFormValues {
  categoryId: string;
  name: string;
  description: string;
  status: boolean;
  icon?: File | null;
  banner?: File | null;
}

export const emptySubCategory = (): SubCategory => ({
  id: "",
  parentCategoryId: "",
  parentCategoryName: "",
  name: "",
  description: "",
  icon: "",
  banner: "",
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

const isActiveValue = (v: any) => v === true || v === "active" || v === "Active";

export const mapApiCategoryOption = (item: any): ParentCategoryOption => ({
  id: String(item.id ?? ""),
  label: pickString(item.name),
});

export const mapApiSubCategory = (item: any): SubCategory => ({
  id: String(item.id ?? ""),
  parentCategoryId: String(item.category ?? item.category_details?.id ?? item.parent_category ?? ""),
  parentCategoryName: pickString(item.category_details?.name, item.category_name, item.parent_category_name),
  name: pickString(item.name),
  description: pickString(item.description),
  icon: pickString(item.icon_url, item.icon),
  banner: pickString(item.banner_url, item.banner),
  status: isActiveValue(item.status) ? "active" : "inactive",
  isActive: isActiveValue(item.status),
});

export const buildSubCategoryFormData = (values: SubCategoryFormValues) => {
  const formData = new FormData();
  formData.append("category", values.categoryId);
  formData.append("name", values.name.trim());
  formData.append("description", (values.description || "").trim());
  formData.append("status", values.status ? "true" : "false");

  if (values.icon) formData.append("icon", values.icon);
  if (values.banner) formData.append("banner_image", values.banner);

  return formData;
};