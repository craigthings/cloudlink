import * as functions from 'firebase-functions';

type FunctionDefinition<T> = T extends (...args: any[]) => any ? T : never;

type ProxyFunctions<T> = {
  [K in keyof T]: FunctionDefinition<T[K]> extends never ? never : functions.HttpsFunction;
};

function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export default class FunctionsProxy {
  static createProxyFunction<T extends (...args: any[]) => any>(func: T): functions.HttpsFunction {
    return functions.https.onRequest(async (req, res) => {
      if (req.method !== 'POST') {
        res.status(405).send(`Method ${req.method} not allowed. Use POST instead.`);
        return;
      }

      try {
        const args = req.body.args || [];
        const result = await func(...args);
        res.status(200).json({ result });
      } catch (error) {
        console.error(`Error in function:`, error);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  static proxy<T extends object>(functionsInstance: T): ProxyFunctions<T> {
    const proxyFunctions = {} as ProxyFunctions<T>;

    for (const key in functionsInstance) {
      if (Object.prototype.hasOwnProperty.call(functionsInstance, key) && isFunction(functionsInstance[key])) {
        proxyFunctions[key as keyof T] = this.createProxyFunction(functionsInstance[key] as any) as FunctionDefinition<T[keyof T]> extends never ? never : functions.HttpsFunction;
      }
    }

    return proxyFunctions;
  }
}
