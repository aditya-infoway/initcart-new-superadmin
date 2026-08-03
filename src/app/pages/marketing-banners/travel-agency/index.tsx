import {
  MARKETING_BANNER_CONFIGS,
  MarketingBannerPage,
} from "@/app/pages/marketing-banners/_shared/MarketingBannerPage";

export default function TravelAgencyBannersPage() {
  return <MarketingBannerPage config={MARKETING_BANNER_CONFIGS.travelAgency} />;
}
