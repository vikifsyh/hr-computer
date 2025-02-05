declare module "midtrans-client" {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(payload: any): Promise<any>;
  }

  // You can extend this declaration with more classes or methods based on the SDK usage.
}
