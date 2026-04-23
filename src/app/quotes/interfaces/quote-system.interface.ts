/** Key format for tracking the state of systems on a quote. This matches the format of cryto.randomUUID() */
export type QuoteSystemKey = `${string}-${string}-${string}-${string}-${string}`;

export interface QuoteSystem {
  price: number;
}
