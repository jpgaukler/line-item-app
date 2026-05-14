/**
 * Log the size of any object encoded as a JSON string.
 * @param data Any json object
 */
export function logJsonSize<T>(data: T) {
  const serialized: string = JSON.stringify(data);
  const sizeInBytes: number = new TextEncoder().encode(serialized).length;
  console.log('Size in bytes', sizeInBytes);
  console.log('Size in kilobytes', sizeInBytes / 1000);
}
