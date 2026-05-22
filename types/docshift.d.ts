declare module 'docshift' {
  export function toHtml(buffer: Buffer | Blob | Uint8Array): Promise<string>;
}
