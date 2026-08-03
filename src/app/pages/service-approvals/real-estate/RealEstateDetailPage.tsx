// Import Dependencies
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  HomeModernIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
// Local Imports
import { Get, formatDateDDMMYYYY, toasterrormsg } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Badge, Button, Card } from "@/components/ui";
import {
  CONSTRUCTION_LABEL,
  FURNISHING_LABEL,
  PropertyEnquiry,
  RealEstateProperty,
  capitalize,
  formatIndianPrice,
  mapApiToProperty,
} from "./data";

// ── Sub-components ────────────────────────────────────────────────────────

type TabId = "overview" | "specs" | "vendor" | "enquiries" | "admin";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: HomeModernIcon },
  { id: "specs", label: "Specifications", icon: BuildingOffice2Icon },
  { id: "vendor", label: "Vendor", icon: UserIcon },
  { id: "enquiries", label: "Enquiries", icon: EnvelopeIcon },
  { id: "admin", label: "Admin", icon: CheckBadgeIcon },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0 dark:border-dark-600">
      <span className="shrink-0 text-sm text-gray-500 dark:text-dark-300">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{value || "—"}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-dark-300">
        {title}
      </h3>
      {children}
    </Card>
  );
}

function MiniStatCard({ label, value, sub, color = "primary" }: { label: string; value: React.ReactNode; sub?: string; color?: "primary" | "success" | "warning" | "error" | "info" }) {
  const borderCls = { primary: "border-t-primary", success: "border-t-success", warning: "border-t-warning", error: "border-t-error", info: "border-t-info" }[color];
  return (
    <Card className={`border-t-4 ${borderCls} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-400">{label}</p>
      <div className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white">{value}</div>
      {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-400">{sub}</p>}
    </Card>
  );
}

// ── Tab: Overview ────────────────────────────────────────────────────────

function TabOverview({
  property,
  onLightbox,
}: {
  property: RealEstateProperty;
  onLightbox: (src: string) => void;
}) {
  const mainImg = property.images.find((i) => i.image_type === "main");
  const gallery = property.images.filter((i) => i.image_type !== "main");

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* LEFT — images + description + address */}
      <div className="space-y-5 lg:col-span-2">
        {/* Main image */}
        {mainImg && (
          <Card className="overflow-hidden p-0">
            <div className="relative">
              <img
                src={mainImg.image_url}
                alt="Main"
                className="h-72 w-full cursor-zoom-in object-cover"
                onClick={() => onLightbox(mainImg.image_url)}
              />
              <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                Main Image
              </span>
            </div>
          </Card>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-dark-100">Gallery</p>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 dark:border-dark-500"
                  onClick={() => onLightbox(img.image_url)}
                >
                  <img src={img.image_url} alt="" className="size-full object-cover transition hover:scale-105" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <SectionCard title="Description">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-dark-200">
            {property.description || "No description provided."}
          </p>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address">
          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-dark-200">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">{property.address}</p>
              <p className="text-gray-500 dark:text-dark-400">
                {[property.city, property.state, property.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
          {property.google_map_url && (
            <a
              href={property.google_map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <MapPinIcon className="size-4" /> View on Map
            </a>
          )}
        </SectionCard>
      </div>

      {/* RIGHT — quick info + contact + amenities */}
      <div className="space-y-4">
        <SectionCard title="Quick Info">
          <InfoRow label="Property ID" value={<span className="font-mono text-xs">{property.property_id}</span>} />
          <InfoRow label="Listed On" value={formatDateDDMMYYYY(property.created_at)} />
          <InfoRow label="Last Updated" value={formatDateDDMMYYYY(property.updated_at)} />
          <InfoRow label="Published On" value={formatDateDDMMYYYY(property.published_at ?? "")} />
          <InfoRow label="Vendor" value={property.vendor_details?.business_name} />
        </SectionCard>

        <SectionCard title="Contact Information">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="size-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Contact Person</p>
                <p className="font-semibold text-gray-900 dark:text-white">{property.contact_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="size-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <a href={`tel:${property.contact_mobile}`} className="font-semibold text-primary">
                  {property.contact_mobile || "—"}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <EnvelopeIcon className="size-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <a href={`mailto:${property.contact_email}`} className="break-all font-semibold text-primary">
                  {property.contact_email || "—"}
                </a>
              </div>
            </div>
          </div>
        </SectionCard>

        {property.amenities.length > 0 && (
          <SectionCard title="Top Amenities">
            <ul className="space-y-1.5">
              {property.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200">
                  <CheckCircleIcon className="size-4 shrink-0 text-success" />
                  {a}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ── Tab: Specifications ──────────────────────────────────────────────────

function TabSpecs({ property }: { property: RealEstateProperty }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard title="Property Details">
        <InfoRow label="Bedrooms" value={`${property.bedrooms} BHK`} />
        <InfoRow label="Bathrooms" value={property.bathrooms} />
        <InfoRow label="Balconies" value={String(property.balconies)} />
        <InfoRow label="Floor" value={`${property.floor_number} / ${property.total_floors}`} />
        <InfoRow label="Facing" value={capitalize(property.facing_direction)} />
        <InfoRow label="Property Age" value={`${property.property_age} years`} />
        <InfoRow label="Furnishing" value={FURNISHING_LABEL[property.furnishing_status] ?? capitalize(property.furnishing_status)} />
        <InfoRow label="Construction" value={CONSTRUCTION_LABEL[property.construction_status] ?? capitalize(property.construction_status)} />
      </SectionCard>

      <SectionCard title="Area Details">
        <InfoRow label="Total Area" value={`${property.total_area_size} sqft`} />
        <InfoRow label="Carpet Area" value={`${property.carpet_area} sqft`} />
        <InfoRow label="Built-up Area" value={`${property.built_up_area} sqft`} />
        <InfoRow label="Price/sqft" value={formatIndianPrice(property.price_per_sqft)} />
      </SectionCard>

      <SectionCard title="Financial Details">
        <InfoRow label="Price" value={<span className="font-bold text-primary">{formatIndianPrice(property.price)}</span>} />
        <InfoRow label="Maintenance" value={formatIndianPrice(property.maintenance_charges)} />
        <InfoRow label="Booking Amount" value={formatIndianPrice(property.booking_amount)} />
        <InfoRow label="Security Deposit" value={formatIndianPrice(property.security_deposit)} />
        <InfoRow label="Negotiable" value={property.negotiable ? "Yes" : "No"} />
        <InfoRow label="Loan Available" value={property.loan_availability ? "Yes" : "No"} />
      </SectionCard>

      <SectionCard title="Legal & Ownership">
        <InfoRow label="Ownership Type" value={capitalize(property.ownership_type)} />
        <InfoRow label="RERA Registered" value={property.rera_registered ? "Yes" : "No"} />
        <InfoRow label="RERA Number" value={property.rera_number || "—"} />
        <InfoRow label="REA Number" value={property.rea_number} />
        <InfoRow label="Encumbrance Certificate" value={property.encumbrance_certificate} />
        <InfoRow label="Documents Available" value={capitalize(property.documents_available)} />
      </SectionCard>

      {Object.keys(property.nearby_facilities).length > 0 && (
        <SectionCard title="Nearby Facilities">
          {Object.entries(property.nearby_facilities).map(([facility, dist]) => (
            <InfoRow key={facility} label={facility} value={`${dist} km`} />
          ))}
        </SectionCard>
      )}
    </div>
  );
}

// ── Tab: Vendor ──────────────────────────────────────────────────────────

function TabVendor({ property }: { property: RealEstateProperty }) {
  const v = property.vendor_details;
  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          {v.store_logo ? (
            <img src={v.store_logo} alt={v.business_name} className="size-16 rounded-2xl object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              {(v.business_name?.[0] ?? "V").toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{v.business_name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge color={v.status === "active" ? "success" : "neutral"} variant="soft" className="capitalize">{v.status}</Badge>
              <Badge color="info" variant="soft" className="capitalize">{v.verification_label}</Badge>
            </div>
          </div>
        </div>
      </Card>
      <SectionCard title="Vendor Information">
        <InfoRow label="Owner Name" value={v.owner_name} />
        <InfoRow label="Business Name" value={v.business_name} />
        <InfoRow label="Email" value={<a href={`mailto:${v.email}`} className="text-primary">{v.email}</a>} />
        <InfoRow label="Phone" value={<a href={`tel:${v.phone}`} className="text-primary">{v.phone}</a>} />
        <InfoRow label="Vendor Type" value={capitalize(v.vendor_type)} />
        <InfoRow label="Sub Type" value={capitalize(v.vendor_subtype)} />
        <InfoRow label="Member Since" value={formatDateDDMMYYYY(v.created_at)} />
        <InfoRow label="Vendor ID" value={`#${v.id}`} />
      </SectionCard>
      <SectionCard title="Contact Preference">
        <InfoRow label="Contact Type" value={capitalize(property.contact_type)} />
        <InfoRow label="Contact Name" value={property.contact_name} />
        <InfoRow label="Mobile" value={property.contact_mobile} />
        <InfoRow label="WhatsApp" value={property.contact_whatsapp} />
        <InfoRow label="Email" value={property.contact_email} />
        <InfoRow label="Preferred Time" value={property.contact_preferred_time ?? "Any time"} />
        <InfoRow label="Use Vendor Info" value={property.use_vendor_info ? "Yes" : "No"} />
      </SectionCard>
    </div>
  );
}

// ── Tab: Enquiries ───────────────────────────────────────────────────────

function TabEnquiries({ propertyId }: { propertyId: number }) {
  const [enquiries, setEnquiries] = useState<PropertyEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Get(`services/real-estate/admin/properties/${propertyId}/enquiries_list/`, {}, false)
      .then((res: any) => {
        const body = res?.data ?? res;
        const rows: any[] = Array.isArray(body)
          ? body
          : Array.isArray(body?.results)
            ? body.results
            : [];
        setEnquiries(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading enquiries...</div>
  );
  if (enquiries.length === 0) return (
    <Card className="flex flex-col items-center justify-center gap-3 py-16">
      <EnvelopeIcon className="size-12 text-gray-300 dark:text-dark-500" />
      <p className="text-sm text-gray-500 dark:text-dark-300">No enquiries yet for this property.</p>
    </Card>
  );

  return (
    <div className="space-y-3">
      {enquiries.map((enq) => (
        <Card key={enq.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{enq.name || "—"}</p>
              <p className="text-sm text-gray-500 dark:text-dark-300">{enq.phone} • {enq.email}</p>
              {enq.message && <p className="mt-2 text-sm text-gray-700 dark:text-dark-200">{enq.message}</p>}
            </div>
            <div className="shrink-0 text-right">
              <Badge color={enq.status === "responded" ? "success" : "warning"} variant="soft" className="capitalize">{enq.status || "new"}</Badge>
              <p className="mt-1 text-xs text-gray-400">{formatDateDDMMYYYY(enq.created_at)}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Tab: Admin ───────────────────────────────────────────────────────────

function TabAdmin({ property }: { property: RealEstateProperty }) {
  return (
    <div className="max-w-2xl space-y-5">
      <SectionCard title="Listing Status">
        <InfoRow label="Status" value={
          <Badge color={property.status === "approved" ? "success" : property.status === "rejected" ? "error" : "warning"} variant="soft" className="capitalize">{property.status}</Badge>
        } />
        <InfoRow label="Featured" value={property.is_featured ? "Yes" : "No"} />
        <InfoRow label="Verified" value={property.is_verified ? "Yes" : "No"} />
        <InfoRow label="Premium" value={property.is_premium ? "Yes" : "No"} />
        <InfoRow label="Approved By" value={property.approved_by ? `Admin #${property.approved_by}` : "—"} />
        <InfoRow label="Approved At" value={formatDateDDMMYYYY(property.approved_at ?? "")} />
        <InfoRow label="Published At" value={formatDateDDMMYYYY(property.published_at ?? "")} />
      </SectionCard>
      <SectionCard title="Engagement">
        <InfoRow label="Views" value={String(property.views_count)} />
        <InfoRow label="Enquiries" value={String(property.enquiry_count)} />
      </SectionCard>
      <SectionCard title="SEO">
        <InfoRow label="Slug" value={property.slug} />
        <InfoRow label="SEO Title" value={property.seo_title ?? "—"} />
        <InfoRow label="SEO Description" value={property.seo_description ?? "—"} />
        <InfoRow label="SEO Keywords" value={property.seo_keywords ?? "—"} />
      </SectionCard>
      {property.virtual_tour_url && (
        <SectionCard title="Virtual Tour">
          <a href={property.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
            Open Virtual Tour
          </a>
        </SectionCard>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function RealEstateDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<RealEstateProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Get(`services/real-estate/admin/properties/${id}/`, {}, false)
      .then((res: any) => {
        const body = res?.data ?? res;
        setProperty(mapApiToProperty(body));
      })
      .catch(() => toasterrormsg("Failed to load property."))
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = () => navigate("/service-approvals/real-estate/detail/real-estate");

  if (loading) return (
    <Page title="Property Detail">
      <div className="animate-pulse space-y-6 px-(--margin-x) py-8">
        <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-dark-600" />
        <div className="grid gap-4 sm:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-200 dark:bg-dark-600" />)}
        </div>
        <div className="h-96 rounded-2xl bg-gray-200 dark:bg-dark-600" />
      </div>
    </Page>
  );

  if (!property) return (
    <Page title="Property Not Found">
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <HomeModernIcon className="size-16 text-gray-300" />
        <p className="text-gray-500">Property not found.</p>
        <Button variant="outlined" onClick={goBack}><ArrowLeftIcon className="size-4 mr-2" />Go Back</Button>
      </div>
    </Page>
  );

  const statusColor = property.status === "approved" ? "success" : property.status === "rejected" ? "error" : "warning";

  return (
    <Page title={property.title}>
      <div className="transition-content w-full pb-10">

        {/* ── Back ── */}
        <div className="px-(--margin-x) pt-6 pb-4">
          <Button variant="outlined" className="gap-2 mb-5" onClick={goBack}>
            <ArrowLeftIcon className="size-4" />
            Back to Properties List
          </Button>

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                <Badge color={statusColor} variant="soft" className="capitalize gap-1">
                  <CheckCircleIcon className="size-3.5" />{property.status}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-dark-300">
                <MapPinIcon className="size-4" />
                <span>{property.city}, {property.state}</span>
                <span>•</span>
                <span>ID: {property.property_id}</span>
                <span>•</span>
                <BuildingOffice2Icon className="size-4" />
                <span>{capitalize(property.construction_status)}</span>
                <span>•</span>
                <span>For {property.transaction_type === "rent" ? "Rent" : "Sale"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {property.is_featured && (
                <Badge color="warning" variant="soft" className="gap-1"><StarIcon className="size-3.5" />Featured</Badge>
              )}
            </div>
          </div>
        </div>

        {/* ── Mini stat cards ── */}
        <div className="px-(--margin-x) pb-5">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <MiniStatCard label="Price" color="primary" value={formatIndianPrice(property.price)} sub={`${formatIndianPrice(property.price_per_sqft)}/sqft`} />
            <MiniStatCard label="Area" color="info" value={`${property.total_area_size} sqft`} sub={`Carpet: ${property.carpet_area} sqft`} />
            <MiniStatCard label="Bed & Bath" color="warning" value={`${property.bedrooms} BHK`} sub={`${property.bathrooms} Bathrooms`} />
            <MiniStatCard label="Engagement" color="success" value={
              <span className="flex items-center gap-3">
                <span>{property.views_count} <span className="text-xs font-normal text-gray-400">Views</span></span>
                <span>{property.enquiry_count} <span className="text-xs font-normal text-gray-400">Enquiries</span></span>
              </span>
            } />
            <MiniStatCard label="Created" color="error" value={formatDateDDMMYYYY(property.created_at)} sub={`By: ${property.vendor_details?.business_name}`} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-(--margin-x) pb-5">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-dark-500 dark:bg-dark-700">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-dark-300 dark:hover:bg-dark-600 dark:hover:text-dark-100"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="px-(--margin-x)">
          {activeTab === "overview" && <TabOverview property={property} onLightbox={setLightbox} />}
          {activeTab === "specs" && <TabSpecs property={property} />}
          {activeTab === "vendor" && <TabVendor property={property} />}
          {activeTab === "enquiries" && <TabEnquiries propertyId={property.id} />}
          {activeTab === "admin" && <TabAdmin property={property} />}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Preview" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Page>
  );
}
