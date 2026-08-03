export interface ServiceSubcategory {
  id: string;
  parentServiceId: string;
  parentServiceName: string;
  subcategoryName: string;
  description: string;
  image: string;
  imageFile?: File | null;
  status: string;
  createdOn: string;
}

export const emptyServiceSubcategory = (): ServiceSubcategory => ({
  id: "",
  parentServiceId: "",
  parentServiceName: "",
  subcategoryName: "",
  description: "",
  image: "",
  imageFile: null,
  status: "active",
  createdOn: "",
});

export const parentServiceOptions = [
  { id: "gym", label: "Gym" },
  { id: "salon", label: "Salon" },
  { id: "travel", label: "Travel" },
  { id: "real-estate", label: "Real Estate" },
  { id: "tech-industry", label: "Tech Industry" },
  { id: "professional", label: "Professional" },
  { id: "finance", label: "Finance" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Hotel" },
];
