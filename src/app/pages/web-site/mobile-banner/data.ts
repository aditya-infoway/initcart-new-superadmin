export interface MobileBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  order: number;
  is_active: boolean;
}

export const emptyBanner = (): Partial<MobileBanner> => ({
  title: "",
  subtitle: "",
  button_text: "",
  button_url: "",
  order: 0,
  is_active: true,
});
