// Types & helpers for Agent Approval page

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalAgentType = "normal" | "pos" | "society" | string;

export interface ApprovalAgent {
  id: number;
  fullName: string;
  contactNumber: string;
  email: string | null;
  agentType: ApprovalAgentType;
  societyOrBusinessName: string | null;
  status: ApprovalStatus;
  createdAt: string;
  passportPhoto: string | null;
  idProof: string | null;
  gstCertificate: string | null;
  businessLicense: string | null;
  address: string;
  city: string;
  state: string;
}

export function mapApiToApprovalAgent(raw: Record<string, any>): ApprovalAgent {
  const status = String(raw.status || "pending").toLowerCase() as ApprovalStatus;
  return {
    id: Number(raw.id ?? 0),
    fullName: String(
      raw.full_name || raw.fullName || raw.name || ""
    ).trim() || "—",
    contactNumber: String(
      raw.contact_number || raw.contactNumber || raw.phone || ""
    ),
    email: raw.email ?? null,
    agentType: String(
      raw.agent_type || raw.agentType || "normal"
    ).toLowerCase(),
    societyOrBusinessName:
      raw.society_or_business_name ??
      raw.societyOrBusinessName ??
      null,
    status: ["pending", "approved", "rejected"].includes(status)
      ? status
      : "pending",
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    passportPhoto: raw.passport_photo ?? raw.passportPhoto ?? null,
    idProof: raw.id_proof ?? raw.idProof ?? null,
    gstCertificate: raw.gst_certificate ?? raw.gstCertificate ?? null,
    businessLicense: raw.business_license ?? raw.businessLicense ?? null,
    address: String(raw.address ?? ""),
    city: String(raw.city ?? ""),
    state: String(raw.state ?? ""),
  };
}

export const AGENT_TYPE_LABEL: Record<string, string> = {
  normal: "Normal Agent",
  pos: "POS Agent",
  society: "Society Agent",
};
