export interface ProductStock {
  id: number;
  mrp: string;
  sellingPrice: string;
  productionCost: string;
  tax: string;
  stockQuantity: number;
  barcode: string;
  unit: string;
  maximumOrderQuantity: number;
  finalPrice: string;
  platformChargePercent: string;
  vendorReceivable: string;
}

export interface ProductVerification {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorBusinessName: string;
  vendorEmail: string;
  vendorPhone: string;
  productName: string;
  sku: string;
  brand: string;
  category: string;
  subCategory: string;
  subSubCategory: string;
  productType: string;
  shortDescription: string;
  fullDescription: string;
  productCondition: string;
  freeShipping: boolean;
  status: string;
  submittedAt: string;
  estimatedDeliveryTime: string;
  returnPolicy: string;
  keywords: string;
  mainImage: string;
  thumbnailImage: string;
  stocks: ProductStock[];
}

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
};

export const mapApiProductVerification = (item: any): ProductVerification => ({
  id: String(item.id ?? ""),
  vendorId: String(item.vendor ?? item.vendor_details?.id ?? ""),
  vendorName: pickString(item.vendor_details?.owner_name),
  vendorBusinessName: pickString(item.vendor_details?.business_name),
  vendorEmail: pickString(item.vendor_details?.email),
  vendorPhone: pickString(item.vendor_details?.phone),
  productName: pickString(item.product_name),
  sku: pickString(item.sku),
  brand: pickString(item.brand_details?.brand_name),
  category: pickString(item.category_details?.name),
  subCategory: pickString(item.subcategory_details?.name),
  subSubCategory: pickString(item.subsubcategory_details?.name),
  productType: pickString(item.product_type),
  shortDescription: pickString(item.short_description),
  fullDescription: pickString(item.full_description),
  productCondition: pickString(item.product_condition),
  freeShipping: Boolean(item.free_shipping),
  status: pickString(item.status).toLowerCase() || "pending",
  submittedAt: item.created_at ?? "",
  estimatedDeliveryTime: pickString(item.estimated_delivery_time),
  returnPolicy: pickString(item.return_policy),
  keywords: pickString(item.keywords),
  mainImage: pickString(item.main_image),
  thumbnailImage: pickString(item.thumbnail_image),
  stocks: Array.isArray(item.stocks)
    ? item.stocks.map((stock: any) => ({
        id: Number(stock.id ?? 0),
        mrp: pickString(stock.mrp),
        sellingPrice: pickString(stock.selling_price),
        productionCost: pickString(stock.production_cost),
        tax: pickString(stock.tax),
        stockQuantity: Number(stock.stock_quantity ?? 0),
        barcode: pickString(stock.barcode),
        unit: pickString(stock.unit),
        maximumOrderQuantity: Number(stock.maximum_order_quantity ?? 0),
        finalPrice: pickString(stock.final_price),
        platformChargePercent: pickString(stock.platform_charge_percent),
        vendorReceivable: pickString(stock.vendor_receivable),
      }))
    : [],
});
