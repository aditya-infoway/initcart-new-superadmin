export type AgentStatus = "pending" | "approved" | "rejected";
export type AgentType = "normal" | "pos" | "society";

export interface AgentTypeOption {
  label: string;
  value: AgentType;
  documentsRequired: number;
}

export const AGENT_TYPE_OPTIONS: AgentTypeOption[] = [
  {
    label: "Normal Agent (2 Documents Required)",
    value: "normal",
    documentsRequired: 2,
  },
  {
    label: "POS Agent (4 Documents Required)",
    value: "pos",
    documentsRequired: 4,
  },
  {
    label: "Society Agent (4 Documents Required)",
    value: "society",
    documentsRequired: 4,
  },
];

export function getAgentTypeDocsRequired(
  type: AgentType | string | undefined
): number {
  return (
    AGENT_TYPE_OPTIONS.find((opt) => opt.value === type)?.documentsRequired ?? 0
  );
}

export const AGENT_STATUS_OPTIONS: {
  label: string;
  value: AgentStatus;
}[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export interface Agent {
  id: number;
  userId?: number | null;
  agentType: AgentType;
  fullName: string;
  contactNumber: string;
  email?: string | null;
  password?: string | null;
  address: string;
  city: string;
  state: string;
  societyOrBusinessName?: string | null;
  status: AgentStatus;
  passportPhoto?: string | null;
  idProof?: string | null;
  gstCertificate?: string | null;
  businessLicense?: string | null;
  createdBy?: { id: number; username: string } | null;
  createdAt: string;
  totalSales?: string | null;
  isActiveAgent?: boolean;
  isPosBranchAgent?: boolean;
  minimumAchievedAt?: string | null;
  referralCode?: string | null;
}

export const emptyAgent: Agent = {
  id: 0,
  userId: null,
  agentType: "normal",
  fullName: "",
  contactNumber: "",
  email: "",
  password: "",
  address: "",
  city: "",
  state: "",
  societyOrBusinessName: null,
  status: "pending",
  passportPhoto: null,
  idProof: null,
  gstCertificate: null,
  businessLicense: null,
  createdBy: null,
  createdAt: "",
  totalSales: "0.00",
  isActiveAgent: false,
  isPosBranchAgent: false,
  minimumAchievedAt: null,
  referralCode: null,
};

type ApiAgentCreatedBy =
  | null
  | undefined
  | { id?: number | null; username?: string | null }
  | number
  | string;

export interface ApiAgent {
  id?: number;
  user?: number | null;
  agent_type?: string;
  full_name?: string;
  contact_number?: string;
  email?: string | null;
  address?: string;
  city?: string;
  state?: string;
  society_or_business_name?: string | null;
  status?: string;
  passport_photo?: string | null;
  id_proof?: string | null;
  gst_certificate?: string | null;
  business_license?: string | null;
  created_by?: ApiAgentCreatedBy;
  created_at?: string;
  total_sales?: string | number | null;
  is_active_agent?: boolean;
  is_pos_branch_agent?: boolean;
  minimum_achieved_at?: string | null;
  referral_code?: string | null;
}

function normalizeCreatedBy(
  raw: ApiAgentCreatedBy
): { id: number; username: string } | null {
  if (!raw) return null;
  if (typeof raw === "number" || typeof raw === "string") {
    return { id: Number(raw), username: String(raw) };
  }
  const id = (raw.id ?? null) as number | null;
  const username = (raw.username ?? null) as string | null;
  if (id == null && !username) return null;
  return {
    id: id ?? 0,
    username: username || "Unknown",
  };
}

export function mapApiToAgent(raw: Record<string, any>): Agent {
  const agentTypeRaw =
    raw.agent_type ||
    raw.agentType ||
    raw.agent_type_name ||
    raw.agentTypeName ||
    "normal";
  const agentType: AgentType = ["pos", "society", "normal"].includes(
    String(agentTypeRaw).toLowerCase()
  )
    ? (String(agentTypeRaw).toLowerCase() as AgentType)
    : "normal";

  const statusRaw = String(
    raw.status || raw.status_label || "pending"
  ).toLowerCase() as AgentStatus;
  const status: AgentStatus = ["pending", "approved", "rejected"].includes(
    statusRaw
  )
    ? statusRaw
    : "pending";

  const sales =
    typeof raw.total_sales === "number"
      ? raw.total_sales.toFixed(2)
      : String(raw.total_sales ?? raw.totalSales ?? "0.00");

  return {
    id: Number(raw.id ?? 0),
    userId: raw.user ? Number(raw.user) : null,
    agentType,
    fullName:
      String(
        raw.full_name ||
          raw.fullName ||
          raw.name ||
          raw.customer_name ||
          raw.user_name ||
          ""
      ).trim() || "—",
    contactNumber: String(
      raw.contact_number ||
        raw.contactNumber ||
        raw.phone ||
        raw.phone_number ||
        raw.number ||
        raw.mobile ||
        ""
    ),
    email: raw.email ?? raw.emailId ?? raw.email_id ?? null,
    password: raw.password ?? null,
    address: String(raw.address ?? raw.full_address ?? raw.fullAddress ?? ""),
    city: String(raw.city ?? raw.city_name ?? raw.cityName ?? ""),
    state: String(raw.state ?? raw.state_name ?? raw.stateName ?? ""),
    societyOrBusinessName:
      raw.society_or_business_name ??
      raw.societyName ??
      raw.businessName ??
      raw.society_or_branch_name ??
      null,
    status,
    passportPhoto:
      raw.passport_photo ??
      raw.passportPhoto ??
      raw.profile_picture ??
      raw.profilePicture ??
      null,
    idProof:
      raw.id_proof ?? raw.idProof ?? raw.id_document ?? raw.idDocument ?? null,
    gstCertificate:
      raw.gst_certificate ??
      raw.gstCertificate ??
      raw.gst_doc ??
      raw.gstDoc ??
      null,
    businessLicense:
      raw.business_license ??
      raw.businessLicense ??
      raw.license_document ??
      raw.licenseDocument ??
      null,
    createdBy: normalizeCreatedBy(raw.created_by ?? raw.createdBy ?? null),
    createdAt:
      raw.created_at ?? raw.createdAt ?? raw.joined_at ?? raw.joinedAt ?? "",
    totalSales: sales,
    isActiveAgent: Boolean(
      raw.is_active_agent ?? raw.isActiveAgent ?? raw.is_active ?? false
    ),
    isPosBranchAgent: Boolean(
      raw.is_pos_branch_agent ?? raw.isPosBranchAgent ?? false
    ),
    minimumAchievedAt:
      raw.minimum_achieved_at ?? raw.minimumAchievedAt ?? null,
    referralCode:
      raw.referral_code ?? raw.referralCode ?? raw.referer_code ?? null,
  };
}

export type AgentFormValues = Omit<
  Agent,
  | "id"
  | "userId"
  | "createdAt"
  | "createdBy"
  | "totalSales"
  | "isActiveAgent"
  | "isPosBranchAgent"
  | "minimumAchievedAt"
  | "status"
> & {
  status: AgentStatus;
  passportPhotoFile?: File | null;
  idProofFile?: File | null;
  gstCertificateFile?: File | null;
  businessLicenseFile?: File | null;
};

export function buildAgentFormValues(agent: Agent | null): AgentFormValues {
  const base = agent ?? emptyAgent;
  return {
    agentType: base.agentType,
    fullName: base.fullName === "—" ? "" : base.fullName,
    contactNumber: base.contactNumber,
    email: base.email ?? "",
    password: base.password ?? "",
    address: base.address,
    city: base.city,
    state: base.state,
    societyOrBusinessName: base.societyOrBusinessName ?? "",
    status: base.status,
    passportPhoto: base.passportPhoto,
    idProof: base.idProof,
    gstCertificate: base.gstCertificate,
    businessLicense: base.businessLicense,
    referralCode: base.referralCode ?? "",
    passportPhotoFile: null,
    idProofFile: null,
    gstCertificateFile: null,
    businessLicenseFile: null,
  };
}

export function buildAgentSubmitPayload(values: AgentFormValues, isEdit: boolean): {
  hasFiles: boolean;
  data: Record<string, any>;
  formData: FormData | null;
} {
  const json: Record<string, any> = {
    agent_type: values.agentType,
    full_name: values.fullName,
    contact_number: values.contactNumber,
    email: values.email || "",
    address: values.address || "",
    city: values.city || "",
    state: values.state || "",
    society_or_business_name: values.societyOrBusinessName || null,
    status: values.status || "pending",
    referral_code: values.referralCode || null,
  };
  if (!isEdit) {
    if (values.password) json.password = values.password;
  }

  const fileFields: Array<[keyof AgentFormValues, string]> = [
    ["passportPhotoFile", "passport_photo"],
    ["idProofFile", "id_proof"],
    ["gstCertificateFile", "gst_certificate"],
    ["businessLicenseFile", "business_license"],
  ];
  const hasFiles = fileFields.some(([k]) => Boolean(values[k]));
  if (!hasFiles) return { hasFiles, data: json, formData: null };

  const form = new FormData();
  Object.entries(json).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    form.append(k, typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v));
  });
  fileFields.forEach(([k, formKey]) => {
    const f = values[k];
    if (f instanceof File) form.append(formKey, f);
  });
  return { hasFiles, data: json, formData: form };
}
