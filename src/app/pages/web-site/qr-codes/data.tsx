export interface QRCard {
  id: string;
  name: string;
  slug: string;
  logo: string;
  qrImage: string;
  mapLink: string;
  whatsappLink: string;
  googleReviewLink: string;
  instagramLink: string;
  facebookLink: string;
  youtubeLink: string;
  websiteLink: string;
}

export interface QRCardFormValues {
  name: string;
  mapLink: string;
  whatsappLink: string;
  googleReviewLink: string;
  instagramLink: string;
  facebookLink: string;
  youtubeLink: string;
  websiteLink: string;
  logo?: File | null;
}

export const emptyQRCard = (): QRCard => ({
  id: "",
  name: "",
  slug: "",
  logo: "",
  qrImage: "",
  mapLink: "",
  whatsappLink: "",
  googleReviewLink: "",
  instagramLink: "",
  facebookLink: "",
  youtubeLink: "",
  websiteLink: "",
});

type LinkKey =
  | "mapLink"
  | "whatsappLink"
  | "googleReviewLink"
  | "instagramLink"
  | "facebookLink"
  | "youtubeLink"
  | "websiteLink";

// form key -> api key
export const LINK_FIELDS: { key: LinkKey; api: string; label: string; placeholder: string }[] = [
  { key: "mapLink", api: "map_link", label: "Map Link", placeholder: "https://maps.google.com/..." },
  { key: "whatsappLink", api: "whatsapp_link", label: "WhatsApp Link", placeholder: "https://wa.me/91XXXXXXXXXX" },
  { key: "googleReviewLink", api: "google_review_link", label: "Google Review Link", placeholder: "https://g.page/r/..." },
  { key: "instagramLink", api: "instagram_link", label: "Instagram Link", placeholder: "https://instagram.com/..." },
  { key: "facebookLink", api: "facebook_link", label: "Facebook Link", placeholder: "https://facebook.com/..." },
  { key: "youtubeLink", api: "youtube_link", label: "YouTube Link", placeholder: "https://youtube.com/..." },
  { key: "websiteLink", api: "website_link", label: "Website Link", placeholder: "https://..." },
];

const str = (v: any) => (typeof v === "string" ? v : v == null ? "" : String(v));

export const mapApiQRCard = (item: any): QRCard => ({
  id: str(item.id),
  name: str(item.name),
  slug: str(item.slug),
  logo: str(item.logo),
  qrImage: str(item.qr_image),
  mapLink: str(item.map_link),
  whatsappLink: str(item.whatsapp_link),
  googleReviewLink: str(item.google_review_link),
  instagramLink: str(item.instagram_link),
  facebookLink: str(item.facebook_link),
  youtubeLink: str(item.youtube_link),
  websiteLink: str(item.website_link),
});

export const buildQRCardFormData = (values: QRCardFormValues) => {
  const formData = new FormData();
  formData.append("name", values.name.trim());

  // same as old page: only filled links are sent
  LINK_FIELDS.forEach(({ key, api }) => {
    const value = (values[key] || "").trim();
    if (value) formData.append(api, value);
  });

  if (values.logo) formData.append("logo", values.logo);
  return formData;
};