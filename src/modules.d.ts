declare module 'emoji-aware' {
  export function split(text: string): string[];
}

declare module 'lojban' {
  export function modzi(text: string, isFull?: boolean): string | string[];
}
