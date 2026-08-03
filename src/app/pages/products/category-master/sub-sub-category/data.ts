export interface CategoryOption {
  id: string;
  label: string;
}

export interface SubCategoryOption {
  id: string;
  label: string;
  categoryId: string;
}

export interface SubSubCategory {
  id: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  name: string;
  icon: string;
  status: string;
  isActive: boolean;
}

export interface SubSubCategoryFormValues {
  categoryId: string;
  subCategoryId: string;
  name: string;
  status: boolean;
  icon?: FileList;
}

export const emptySubSubCategory = (): SubSubCategory => ({
  id: "",
  categoryId: "",
  categoryName: "",
  subCategoryId: "",
  subCategoryName: "",
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

export const mapApiCategoryOption = (item: any): CategoryOption => ({
  id: String(item.id ?? ""),
  label: pickString(item.name),
});

export const mapApiSubCategoryOption = (item: any): SubCategoryOption => ({
  id: String(item.id ?? ""),
  label: pickString(item.name),
  categoryId: String(item.category ?? item.category_details?.id ?? item.parent_category ?? ""),
});

export const mapApiSubSubCategory = (item: any): SubSubCategory => ({
  id: String(item.id ?? ""),
  categoryId: String(
    item.category ??
      item.category_id ??
      item.category_details?.id ??
      item.subcategory_details?.category ??
      item.subcategory_details?.category_id ??
      item.subcategory_details?.category_details?.id ??
      "",
  ),
  categoryName: pickString(
    item.category_details?.name,
    item.category_name,
    item.subcategory_details?.category_details?.name,
    item.subcategory_details?.category_name,
    item.sub_category_details?.category_name,
  ),
  subCategoryId: String(
    item.subcategory ??
      item.subcategory_id ??
      item.subcategory_details?.id ??
      item.sub_category ??
      item.sub_category_id ??
      "",
  ),
  subCategoryName: pickString(
    item.subcategory_details?.name,
    item.subcategory_name,
    item.sub_category_name,
    item.sub_category_details?.name,
  ),
  name: pickString(item.name),
  icon: pickString(item.icon_url, item.icon),
  status: item.status === true || item.status === "active" ? "active" : "inactive",
  isActive: Boolean(item.status === true || item.status === "active"),
});

export const buildSubSubCategoryFormData = (values: SubSubCategoryFormValues) => {
  const formData = new FormData();
  formData.append("category", values.categoryId);
  formData.append("subcategory", values.subCategoryId);
  formData.append("name", values.name.trim());
  formData.append("status", values.status ? "true" : "false");

  const iconFile = values.icon?.[0];
  if (iconFile) {
    formData.append("icon", iconFile);
  }

  return formData;
};
