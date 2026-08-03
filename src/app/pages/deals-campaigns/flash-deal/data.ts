export interface FlashDealCampaign {
  id: string;
  campaignId: string;
  campaignName: string;
  type: string;
  duration: string;
  vendors: string;
  vendorsSubtext: string;
  approved: string;
  approvedSubtext: string;
  requirements: string;
  requirementsSubtext: string;
  status: string;
}

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
};

export const mapApiFlashDealCampaign = (item: any): FlashDealCampaign => ({
  id: String(item.id ?? ""),
  campaignId: pickString(item.campaign_id, item.id),
  campaignName: pickString(item.campaign_name, item.name),
  type: pickString(item.campaign_type, item.type),
  duration: pickString(item.duration) || `${pickString(item.start_datetime)} to ${pickString(item.end_datetime)}`,
  vendors: pickString(item.vendor_count, item.selected_vendors_details?.length, item.selected_vendors?.length, 0),
  vendorsSubtext: `${pickString(item.selected_vendors_details?.length, item.selected_vendors?.length, 0)} selected`,
  approved: pickString(item.approved_products_count, 0),
  approvedSubtext: `${pickString(item.upcoming_deals_count, 0)} upcoming`,
  requirements: `Min ${pickString(item.minimum_discount, 0)}% • ${pickString(item.minimum_product_limit, 0)} products • Max ${pickString(item.max_products_per_vendor, 0)}`,
  requirementsSubtext: pickString(item.description),
  status: String(item.status).toLowerCase() === "active" || item.status === true ? "active" : "inactive",
});

export const statusOptions = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];
