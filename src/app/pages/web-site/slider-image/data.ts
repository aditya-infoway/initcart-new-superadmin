export interface SliderImage {
  id: string;
  srNo: number;
  imageUrl: string;
}

export const emptySliderImage = (): SliderImage => ({
  id: "",
  srNo: 0,
  imageUrl: "",
});
