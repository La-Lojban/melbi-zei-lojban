declare module 'emoji-aware' {
  export function split(text: string): string[];
}

declare module 'lojban' {
  export function modzi(text: string, isFull?: boolean): string | string[];
  export function romoi_lahi_cmaxes(text: string): {
    tcini: string;
    'te spuda': [string, string][] | string;
  };
}
