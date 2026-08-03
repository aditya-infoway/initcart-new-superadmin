import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const products: NavigationTree = {
  ...baseNavigationObj["products"],
  childs: [
    {
      id: "products.verification",
      type: "item",
      path: "/products/product-verification",
      title: "Product Verification",
      icon: "products.verification",
    },
    {
      id: "products.categoryMaster",
      type: "collapse",
      path: "/products/category-master",
      title: "Category Master",
      icon: "products.categoryMaster",
      childs: [
        {
          id: "products.categoryMaster.category",
          type: "item",
          path: "/products/category-master/category",
          title: "Category",
          icon: "products.categoryMaster.category",
        },
        {
          id: "products.categoryMaster.subCategory",
          type: "item",
          path: "/products/category-master/sub-category",
          title: "Sub Category",
          icon: "products.categoryMaster.subCategory",
        },
        {
          id: "products.categoryMaster.subSubCategory",
          type: "item",
          path: "/products/category-master/sub-sub-category",
          title: "Sub Sub Category",
          icon: "products.categoryMaster.subSubCategory",
        },
      ],
    },
  ],
};
