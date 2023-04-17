type Proxify<T> = T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : never;

type ProxiedFunctions<T> = {
  [K in keyof T]: Proxify<T[K]>;
};

export default class CloudFunctionsInteropFrontend {
  private static baseUrl: string;

  static setFunctionsUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  static createProxyFunction<T, K extends keyof T & string>(key: K): Proxify<T[K]> {
    return (async (...args: any[]) => {
      const response = await fetch(`${this.baseUrl}/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ args }),
      });

      if (!response.ok) {
        console.log('response', response);
        throw new Error(`Failed to call cloud function "${key}"`);
      }

      const data = await response.json();
      return data.result;
    }) as Proxify<T[K]>;
  }

  static proxy<T extends object>(functionsInstance: T): ProxiedFunctions<T> {
    const proxyFunctions = {} as ProxiedFunctions<T>;

    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(functionsInstance))
    .filter((key) => key !== 'constructor')
    .filter((key) => {
      const typedKey = key as keyof T;
      return typeof functionsInstance[typedKey] === 'function';
    });

    for (const key of methods) {
      const typedKey = key as keyof T & string;
      proxyFunctions[typedKey] = this.createProxyFunction<T, keyof T & string>(typedKey);
    }

    return proxyFunctions;
  }
}