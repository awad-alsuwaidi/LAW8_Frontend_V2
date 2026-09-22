export interface Product {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  description: string;
  isProvisionable: boolean;
  isActive: boolean;
}

export interface Feature {
  id: number;
  productId: number;
  nameEn: string;
  nameAr: string;
  description: string;
  priceAddOn: number;
  isActive: boolean;
}
