export interface ParentCategoryOption {
  id: string;
  label: string;
}

export interface SubCategory {
  id: string;
  parentCategoryId: string;
  parentCategoryName: string;
  name: string;
  icon: string;
  status: string;
  isActive: boolean;
}

export interface SubCategoryFormValues {
  categoryId: string;
  name: string;
  status: boolean;
  icon?: FileList;
}

export const emptySubCategory = (): SubCategory => ({
  id: "",
  parentCategoryId: "",
  parentCategoryName: "",
  name: "",
  icon: "",
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

export const mapApiCategoryOption = (item: any): ParentCategoryOption => ({
  id: String(item.id ?? ""),
  label: pickString(item.name),
});

export const mapApiSubCategory = (item: any): SubCategory => ({
  id: String(item.id ?? ""),
  parentCategoryId: String(item.category ?? item.category_details?.id ?? item.parent_category ?? ""),
  parentCategoryName: pickString(item.category_details?.name, item.category_name, item.parent_category_name),
  name: pickString(item.name),
  icon: pickString(item.icon_url, item.icon),
  status: item.status === true || item.status === "active" ? "active" : "inactive",
  isActive: Boolean(item.status === true || item.status === "active"),
});

export const buildSubCategoryFormData = (values: SubCategoryFormValues) => {
  const formData = new FormData();
  formData.append("category", values.categoryId);
  formData.append("name", values.name.trim());
  formData.append("status", values.status ? "true" : "false");

  const iconFile = values.icon?.[0];
  if (iconFile) {
    formData.append("icon", iconFile);
  }

  return formData;
};
