declare module 'ioredis' {
  export default class Redis {
    constructor(options?: any);
    connect(): Promise<void>;
    disconnect(): void;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<string>;
  }
} 