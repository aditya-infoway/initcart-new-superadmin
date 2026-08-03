export interface VendorParticipationApproval {
  id: string;
  requestId: string;
  vendorName: string;
  businessName: string;
  campaignName: string;
  email: string;
  phone: string;
  vendorType: string;
  subType: string;
  requestDate: string;
  status: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  license: string;
  gstCertificate: string;
  idProof: string;
  storeLogo: string;
}

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const normalizeVendorType = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("product")) return "Product Vendor";
  if (normalized.includes("service")) return "Service Vendor";
  return value || "N/A";
};

export const mapApiToParticipationApproval = (
  item: any,
): VendorParticipationApproval => {
  const vendor = item.vendor_details || item.vendorDetails || item.vendor || {};
  const campaign =
    item.campaign_details ||
    item.campaignDetails ||
    item.campaign ||
    {};

  return {
    id: String(
      item.request_id ??
        item.requestId ??
        item.id ??
        item.approval_id ??
        item.approvalId ??
        item.participation_id ??
        "",
    ),
    requestId: String(
      item.request_id ??
        item.requestId ??
        item.id ??
        item.approval_id ??
        item.participation_id ??
        "",
    ),
    vendorName: pickString(
      vendor.owner_name,
      vendor.ownerName,
      item.vendor_name,
      item.vendorName,
      vendor.contact_person,
    ),
    businessName: pickString(
      vendor.business_name,
      vendor.businessName,
      item.business_name,
      item.businessName,
      vendor.name,
    ),
    campaignName: pickString(
      campaign.campaign_name,
      campaign.name,
      campaign.title,
      item.campaign_name,
      item.campaignName,
    ),
    email: pickString(
      vendor.email,
      vendor.email_id,
      vendor.emailId,
      item.email,
    ),
    phone: pickString(
      vendor.phone,
      vendor.phone_no,
      vendor.phoneNo,
      vendor.mobile,
      item.phone,
    ),
    vendorType: normalizeVendorType(
      pickString(
        vendor.vendor_type,
        vendor.vendorType,
        vendor.business_type,
        vendor.businessType,
        item.vendor_type,
        item.vendorType,
      ),
    ),
    subType: pickString(
      vendor.vendor_subtype,
      vendor.vendorSubtype,
      item.sub_type,
      item.subType,
      vendor.service_category,
      vendor.product_vendor_type,
    ),
    requestDate:
      item.date ??
      item.request_date ??
      item.requestDate ??
      item.approved_at ??
      item.participation_date ??
      vendor.created_at ??
      vendor.createdAt ??
      item.created_at ??
      "",
    status:
      pickString(
        item.status,
        vendor.status,
        vendor.verification_label,
      ).toLowerCase() || "pending",
    address: pickString(vendor.address, vendor.address_line_1, vendor.addressLine1),
    city: pickString(vendor.city),
    state: pickString(vendor.state),
    pincode: pickString(vendor.pincode, vendor.pin_code, vendor.pinCode),
    license: pickString(vendor.licence_file, vendor.license, vendor.license_file, vendor.licenseFile),
    gstCertificate: pickString(vendor.gst_certificate, vendor.gstCertificate, vendor.gst_certificate_file),
    idProof: pickString(vendor.id_proof, vendor.idProof, vendor.id_proof_file),
    storeLogo: pickString(vendor.store_logo_url, vendor.store_logo, vendor.storeLogo, vendor.logo, vendor.logo_url, vendor.logoUrl),
  };
};
