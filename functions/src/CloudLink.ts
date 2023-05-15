type AsyncMethods<T extends object> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R
      ? (...args: A) => Promise<R>
      : never;
  };
  
  type OnRequestFunction = (
    handler: (req: any, res: any) => Promise<void>
  ) => void;
  
  type CorsFunction = (req: any, res: any, next: () => void) => void;
  
  export default class CloudLink {
    static wrap<T extends object>(endpoint: string): AsyncMethods<T> {
      const handler: ProxyHandler<AsyncMethods<T>> = {
        get: function (
          _target,
          prop: string | symbol
        ): (...args: any[]) => Promise<any> {
          if (typeof prop === "symbol") {
            throw new Error("Property cannot be a symbol.");
          }
          return async (...args: any[]) => {
            const response = await fetch(endpoint, {
              method: "POST",
              body: JSON.stringify({ method: prop, args: args }),
              headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          };
        }
      };
      return new Proxy<AsyncMethods<T>>({} as AsyncMethods<T>, handler);
    }
  
    static expose<T extends object>(
      api: new (...args: any[]) => T,
      onRequest: OnRequestFunction,
      cors?: CorsFunction
    ): void {
      let instance = new api();
      onRequest(async (req, res) => {
        const handleRequest = async () => {
          const { method, args } = req.body;
          if (!method || !Array.isArray(args)) {
            res.status(400).send("Invalid request body. 'method' and 'args' are required fields.");
            return;
          }
          if (method in instance && typeof instance[method as keyof T] === 'function') {
            try {
              const func = instance[method as keyof T] as (...args: any[]) => Promise<any>;
              const result = await func(...args);
              res.json(result);
            } catch (error) {
              if (error instanceof Error) {
                res.status(500).send(`Error executing method '${method}': ${error.message}`);
              } else {
                res.status(500).send(`Unknown error occurred while executing method '${method}'`);
              }
            }
          } else {
            res.status(400).send(`Invalid method name '${method}'. This method does not exist on the provided API.`);
          }
        };
  
        if (cors) {
          cors(req, res, handleRequest);
        } else {
          await handleRequest();
        }
      });
    }
  }
  