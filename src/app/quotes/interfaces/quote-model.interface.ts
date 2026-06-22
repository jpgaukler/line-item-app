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
      basePrice: number;
      unitPrice: number;
      quantity: number;
      inputs: {
        name: string;
        value: string;
        displayText: string;
      }[];
      adders: {
        name: string;
        displayText: string;
        price: number;
      }[];
    }[];
  }[];
  price: number;
}
