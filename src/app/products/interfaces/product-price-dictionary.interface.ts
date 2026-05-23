export type ProductCode = string;

export interface ProductPriceDictionary {
  productId: string;
  productCodeHash: string;
  prices: Record<ProductCode, number>;
}
