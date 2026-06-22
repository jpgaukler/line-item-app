export type ProductCode = string;

export interface ProductPriceDictionary {
  productCodeHash: string;
  prices: Record<ProductCode, number>;
}
