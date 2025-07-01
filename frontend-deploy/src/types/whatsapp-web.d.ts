declare module 'whatsapp-web.js' {
  export class Client {
    constructor(options: any);
    initialize(): Promise<void>;
    getState(): string;
    sendMessage(to: string, message: string): Promise<any>;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  
  export class LocalAuth {
    constructor(options?: any);
  }
  
  export interface Message {
    id: string;
    body: string;
    from: string;
    to: string;
    timestamp: number;
  }

  export enum WAState {
    CONFLICT = 'CONFLICT',
    CONNECTED = 'CONNECTED',
    DEPRECATED_VERSION = 'DEPRECATED_VERSION',
    OPENING = 'OPENING',
    PAIRING = 'PAIRING',
    PROXYBLOCK = 'PROXYBLOCK',
    SMB_TOS_BLOCK = 'SMB_TOS_BLOCK',
    TIMEOUT = 'TIMEOUT',
    TOS_BLOCK = 'TOS_BLOCK',
    UNLAUNCHED = 'UNLAUNCHED',
    UNPAIRED = 'UNPAIRED',
    UNPAIRED_IDLE = 'UNPAIRED_IDLE'
  }
} 