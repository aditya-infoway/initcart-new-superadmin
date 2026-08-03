export const APP_NAME = "InitCart SuperAdmin";
export const APP_KEY = "tailux";
export const APP_LOGO = "/images/initcart/fav.png";
export const APP_FAVICON = "/images/initcart/fav.png";

// Redirect Paths
export const REDIRECT_URL_KEY = "redirect";
export const SUPERADMIN_BASE_PATH = "/superadmin";
export const HOME_PATH = "/";
export const GHOST_ENTRY_PATH = "/login";
export const SELECT_COMPANY_PATH = "/select-company";

// Navigation Types
export type NavigationType = "root" | "group" | "collapse" | "item" | "divider";

export const COLORS = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
] as const;

export type ColorType = (typeof COLORS)[number];
