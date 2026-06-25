// Vercel Serverless Function 類型聲明
// 這些類型在 Vercel 運行時會自動提供

declare module '@vercel/node' {
  export interface VercelRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    body: any;
    query?: Record<string, string | string[]>;
  }

  export interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: any): void;
    send(body: any): void;
    end(body?: any): void;
    setHeader(name: string, value: string | string[]): void;
  }

  export type VercelHandler = (
    req: VercelRequest,
    res: VercelResponse
  ) => void | Promise<void>;
}

declare module 'googleapis' {
  export const google: {
    auth: {
      JWT: new (
        email?: string,
        keyFile?: string,
        key?: string,
        scopes?: string[],
        subject?: string
      ) => {
        authorize: () => Promise<void>;
      };
    };
    androidpublisher: (opts: { version: string; auth: unknown }) => {
      purchases: {
        subscriptions: {
          get: (args: {
            packageName: string;
            subscriptionId: string;
            token: string;
          }) => Promise<{ data: Record<string, unknown> }>;
        };
        products: {
          get: (args: {
            packageName: string;
            productId: string;
            token: string;
          }) => Promise<{ data: Record<string, unknown> }>;
        };
      };
    };
  };
}

