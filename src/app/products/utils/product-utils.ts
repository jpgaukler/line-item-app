import { ProductInputOption } from '../interfaces/product-input-option.interface';
import { ProductInput } from '../interfaces/product-input.interface';
import { Product } from '../interfaces/product.interface';

// export function generateProductVariations(product: Product): ProductVariation[] {
//   const inputs: ProductInput[] = product.inputs;
//   const variations: ProductVariation[] = [];
//   const currentInputs: Record<ProductInput['name'], ProductInputOption['value']> = {};

//   function buildVariation(index: number) {
//     // base case: full permutation built, add to results array
//     if (index === inputs.length) {
//       variations.push({
//         productCode: calculateProductCode(product.productCodeFormula, currentInputs),
//         inputs: { ...currentInputs },
//         price: 0,
//       });

//       return;
//     }

//     const input: ProductInput = inputs[index];

//     for (const option of input.options) {
//       currentInputs[input.name] = option.value;
//       buildVariation(index + 1);
//     }
//   }

//   buildVariation(0);

//   return variations;
// }

export function generateProductCodes(product: Product): string[] {
  const inputs: ProductInput[] = product.inputs;
  const productCodes: string[] = [];
  const currentInputs: Record<ProductInput['name'], ProductInputOption['value']> = {};

  function buildVariation(index: number) {
    // base case: full permutation built, add to results array
    if (index === inputs.length) {
      productCodes.push(calculateProductCode(product.productCodeFormula, currentInputs));
      return;
    }

    const input: ProductInput = inputs[index];

    for (const option of input.options) {
      currentInputs[input.name] = option.value;
      buildVariation(index + 1);
    }
  }

  buildVariation(0);

  return productCodes;
}

export function calculateProductCode(
  productCodeFormula: string,
  inputs: Record<string, string>,
): string {
  if (productCodeFormula[0] !== '=') {
    return productCodeFormula;
  }

  const inputNames: RegExp = /\[\s*(\w+)\s*\]/g;
  const whitespace: RegExp = /\s/g;

  // remove whitespace to normalize input names
  const values: Record<string, string> = Object.fromEntries(
    Object.entries(inputs).map(([name, value]) => [name.replace(whitespace, ''), value]),
  );

  // replace placeholders in the product code formula with selected values
  return productCodeFormula
    .substring(1) // remove "=" character
    .replace(whitespace, '') // remove any whitespace
    .replace(inputNames, (match, inputName) => values[inputName] ?? '?'); // replace input names with values
}

/**
 * Can be used to detect if permuations have changed since last generating them.
 * @param inputs
 * @returns
 */
export async function buildProductsInputsHash(inputs: ProductInput[]): Promise<string> {
  // generate the string fingerprint
  const fingerprint = inputs
    .map(
      (i) =>
        `${i.name}:${i.options
          .map((o) => o.value)
          .sort()
          .join(',')}`,
    )
    .sort()
    .join('|');

  // convert string to ArrayBuffer
  const msgBuffer = new TextEncoder().encode(fingerprint);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
