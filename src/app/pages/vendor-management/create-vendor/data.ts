export type VendorBusinessType = "service_vendor" | "product_vendor";
export type ProductVendorType = "retailer" | "wholeseller";

export interface Vendor {
  id: string;
  logo: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: VendorBusinessType | "";
  productVendorType: ProductVendorType | "";
  serviceCategory: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  status: string;
  licenseFileName: string;
  gstCertificateFileName: string;
  idProofFileName: string;
  createdAt?: string;
}

export interface VendorFormValues {
  businessType: VendorBusinessType | "";
  productVendorType: ProductVendorType | "";
  serviceCategory: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  status: string;
  logo?: FileList;
  license?: FileList;
  gstCertificate?: FileList;
  idProof?: FileList;
}

export const vendorBusinessTypeOptions = [
  { id: "service_vendor", label: "Service Vendor" },
  { id: "product_vendor", label: "Product Vendor" },
];

export const productVendorTypeOptions = [
  { id: "retailer", label: "Retailer" },
  { id: "wholeseller", label: "Wholeseller" },
];

export const serviceCategoryOptions = [
  { id: "Real Estate", label: "Real Estate" },
  { id: "Gym", label: "Gym" },
  { id: "Saloon", label: "Saloon" },
  { id: "Travel Agency", label: "Travel Agency" },
  { id: "Finance", label: "Finance" },
  { id: "Tech Industry", label: "Tech Industry" },
  { id: "Hotel & Restaurant", label: "Hotel & Restaurant" },
  { id: "Healthcare", label: "Healthcare" },
  { id: "Education", label: "Education" },
  { id: "Professional", label: "Professional" },
  { id: "Work Place", label: "Work Place" },
];

export const emptyVendor = (): Vendor => ({
  id: "",
  logo: "",
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  businessType: "",
  productVendorType: "",
  serviceCategory: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  status: "active",
  licenseFileName: "",
  gstCertificateFileName: "",
  idProofFileName: "",
});

const pickString = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const normalizeBusinessType = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("product")) return "product_vendor" as const;
  if (normalized.includes("service")) return "service_vendor" as const;
  return "";
};

const normalizeProductVendorType = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("retailer")) return "retailer" as const;
  if (normalized.includes("whole")) return "wholeseller" as const;
  return "";
};

export const mapApiVendorToVendor = (item: any): Vendor => {
  const businessType = normalizeBusinessType(
    pickString(item.business_type, item.businessType, item.vendor_type, item.type),
  );

  return {
    id: String(item.id ?? item.vendor_id ?? item.vendorId ?? ""),
    logo: pickString(item.logo, item.logo_url, item.logoUrl, item.store_logo, item.storeLogo),
    businessName: pickString(item.business_name, item.businessName, item.name, item.company_name),
    ownerName: pickString(item.owner_name, item.ownerName, item.contact_person, item.owner),
    email: pickString(item.email, item.email_id, item.emailId),
    phone: pickString(item.phone, item.phone_no, item.phoneNo, item.mobile),
    businessType,
    productVendorType: normalizeProductVendorType(
      pickString(item.product_vendor_type, item.productVendorType),
    ),
    serviceCategory: pickString(item.service_category, item.serviceCategory),
    address: pickString(item.address, item.address_line_1, item.addressLine1),
    city: pickString(item.city),
    state: pickString(item.state),
    pincode: pickString(item.pincode, item.pin_code, item.pinCode),
    bankName: pickString(item.bank_name, item.bankName),
    accountNumber: pickString(item.account_number, item.accountNumber),
    ifscCode: pickString(item.ifsc_code, item.ifscCode),
    upiId: pickString(item.upi_id, item.upiId),
    status: pickString(item.status).toLowerCase() || "active",
    licenseFileName: pickString(item.license, item.license_file, item.licenseFile),
    gstCertificateFileName: pickString(item.gst_certificate, item.gstCertificate, item.gst_certificate_file),
    idProofFileName: pickString(item.id_proof, item.idProof, item.id_proof_file),
    createdAt: item.created_at ?? item.createdAt ?? item.created,
  };
};

export const buildVendorFormData = (
  values: VendorFormValues,
  vendorId?: string,
) => {
  const formData = new FormData();

  if (vendorId) formData.append("id", vendorId);

  formData.append("business_type", values.businessType);
  formData.append("business_name", values.businessName.trim());
  formData.append("owner_name", values.ownerName.trim());
  formData.append("email", values.email.trim());
  formData.append("phone", values.phone.trim());
  formData.append("address", values.address.trim());
  formData.append("city", values.city.trim());
  formData.append("state", values.state.trim());
  formData.append("pincode", values.pincode.trim());
  formData.append("bank_name", values.bankName.trim());
  formData.append("account_number", values.accountNumber.trim());
  formData.append("ifsc_code", values.ifscCode.trim());
  formData.append("upi_id", values.upiId.trim());
  formData.append("status", values.status);

  if (values.password.trim()) {
    formData.append("password", values.password.trim());
  }

  if (values.businessType === "product_vendor" && values.productVendorType) {
    formData.append("product_vendor_type", values.productVendorType);
  }

  if (values.businessType === "service_vendor" && values.serviceCategory) {
    formData.append("service_category", values.serviceCategory);
  }

  const logoFile = values.logo?.[0];
  const licenseFile = values.license?.[0];
  const gstCertificateFile = values.gstCertificate?.[0];
  const idProofFile = values.idProof?.[0];

  if (logoFile) formData.append("logo", logoFile);
  if (licenseFile) formData.append("license", licenseFile);
  if (gstCertificateFile) formData.append("gst_certificate", gstCertificateFile);
  if (idProofFile) formData.append("id_proof", idProofFile);

  return formData;
};
