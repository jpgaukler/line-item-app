export interface QuoteModel {
  name: string;
  customerName: string;
  customerEmail: string;
  systems: {
    price: number;
    name: string;
    items: {
      productId: string;
      // productVersion: number;
      itemNumber: string;
      name: string;
      description: string;
      productCode: string;
      price: number;
      inputs: {
        name: string;
        value: string;
        displayText: string;
        isCustomValue: boolean;
      }[];
    }[];
  }[];
  price: number;
}
