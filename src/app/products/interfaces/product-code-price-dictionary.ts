export type ProductCode = string;

export interface ProductCodePriceDictionary {
  productId: string;
  productCodeHash: string;
  prices: Record<ProductCode, number>;
}
