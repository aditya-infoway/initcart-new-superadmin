
//reports/sales-report/data.ts
export interface SalesReportVendorRow {
  id: string;
  vendorId: string;
  vendorName: string;
  contact: string;
  category: string;
  totalOrders: number;
  orders: SalesOrderDetail[];
}

export interface SalesOrderDetail {
  id: string;
  date: string;
  orderId: string;
  product: string;
  qty: number;
  payment: string;
  sales: string;
  tax: string;
  total: string;
  status: string;
}

export const salesReportRows: SalesReportVendorRow[] = [
  {
    id: "v1001",
    vendorId: "V1001",
    vendorName: "Elite Electronics",
    contact: "+91 98765 43210",
    category: "Electronics",
    totalOrders: 3,
    orders: [
      {
        id: "1",
        date: "2025-10-15",
        orderId: "#1001",
        product: "Smartphone X",
        qty: 2,
        payment: "UPI",
        sales: "₹50,000",
        tax: "18%",
        total: "₹59000.00",
        status: "Completed",
      },
      {
        id: "2",
        date: "2025-10-14",
        orderId: "#1002",
        product: "Charger Pro",
        qty: 5,
        payment: "COD",
        sales: "₹2,500",
        tax: "12%",
        total: "₹2800.00",
        status: "Completed",
      },
      {
        id: "3",
        date: "2025-10-13",
        orderId: "#1003",
        product: "Wireless Earbuds",
        qty: 1,
        payment: "Card",
        sales: "₹4,500",
        tax: "18%",
        total: "₹5310.00",
        status: "Completed",
      },
    ],
  },
  {
    id: "v1002",
    vendorId: "V1002",
    vendorName: "Fashion Hub",
    contact: "+91 91234 56780",
    category: "Fashion",
    totalOrders: 2,
    orders: [
      {
        id: "4",
        date: "2025-10-12",
        orderId: "#1101",
        product: "Denim Jacket",
        qty: 3,
        payment: "COD",
        sales: "₹6,000",
        tax: "5%",
        total: "₹6300.00",
        status: "Completed",
      },
      {
        id: "5",
        date: "2025-10-11",
        orderId: "#1102",
        product: "Sneakers",
        qty: 2,
        payment: "UPI",
        sales: "₹4,000",
        tax: "5%",
        total: "₹4200.00",
        status: "Completed",
      },
    ],
  },
  {
    id: "v1003",
    vendorId: "V1003",
    vendorName: "Grocery Point",
    contact: "+91 99887 76655",
    category: "Grocery",
    totalOrders: 4,
    orders: [
      {
        id: "6",
        date: "2025-10-10",
        orderId: "#1201",
        product: "Olive Oil",
        qty: 6,
        payment: "COD",
        sales: "₹3,600",
        tax: "5%",
        total: "₹3780.00",
        status: "Completed",
      },
      {
        id: "7",
        date: "2025-10-09",
        orderId: "#1202",
        product: "Basmati Rice",
        qty: 4,
        payment: "UPI",
        sales: "₹2,800",
        tax: "5%",
        total: "₹2940.00",
        status: "Completed",
      },
      {
        id: "8",
        date: "2025-10-08",
        orderId: "#1203",
        product: "Dry Fruits Combo",
        qty: 2,
        payment: "Card",
        sales: "₹1,800",
        tax: "12%",
        total: "₹2016.00",
        status: "Completed",
      },
      {
        id: "9",
        date: "2025-10-07",
        orderId: "#1204",
        product: "Organic Honey",
        qty: 3,
        payment: "UPI",
        sales: "₹1,500",
        tax: "12%",
        total: "₹1680.00",
        status: "Completed",
      },
    ],
  },
];
