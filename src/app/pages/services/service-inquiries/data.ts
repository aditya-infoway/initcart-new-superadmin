export interface ServiceInquiry {
  id: string;
  serialNo: number;
  businessName: string;
  vendorName: string;
  serviceName: string;
  serviceCategory: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  createdAt: string;
  date: string;
  time: string;
}

export const emptyServiceInquiry = (): ServiceInquiry => ({
  id: "",
  serialNo: 0,
  businessName: "",
  vendorName: "",
  serviceName: "",
  serviceCategory: "",
  customerName: "",
  phone: "",
  email: "",
  city: "",
  message: "",
  createdAt: "",
  date: "",
  time: "",
});

export const serviceOptions = [
  { id: "hotel", label: "Hotel" },
  { id: "restaurant", label: "Restaurant" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "finance", label: "Finance" },
  { id: "professional", label: "Professional" },
  { id: "gym", label: "Gym" },
  { id: "salon", label: "Salon" },
  { id: "travel", label: "Travel" },
  { id: "tech-industry", label: "Tech Industry" },
  { id: "real-estate", label: "Real Estate" },
];
