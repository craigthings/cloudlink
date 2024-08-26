interface MinimalAuth {
  currentUser: {
    getIdToken(): Promise<string>;
  } | null;
}

type AsyncMethods<T extends object> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : never;
};

type OnRequestFunction = (
  handler: (req: any, res: any) => Promise<void>
) => void;

type CorsFunction = (req: any, res: any, next: () => void) => void;

interface ServerAuth {
  verifyIdToken: (token: string) => Promise<object | null>;
}

// Helper function to perform deep comparison of two objects
function deepCompare(a: any, b: any, path: string[] = [], methodName: string = ""): string[][] {
  let errors: string[][] = [];
  for (const key in a) {
    const newPath = path.concat(key);
    if (typeof a[key] === "object" && a[key] !== null) {
      errors = errors.concat(deepCompare(a[key], b[key], newPath, methodName));
    } else if (a[key] !== b[key]) {
      const errorPath = methodName ? `method: ${methodName}, argument: ${Number(key) + 1}, type: ${typeof a[key]}` : '';
      errors.push([errorPath]);
    }
  }
  return errors;
}

export default class CloudLink {
  static wrap<T extends object>(endpoint: string, auth?: MinimalAuth): AsyncMethods<T> {
    const handler: ProxyHandler<AsyncMethods<T>> = {
      get: function (
        _target,
        prop: string | symbol
      ): (...args: any[]) => Promise<any> {
        if (typeof prop === "symbol") {
          throw new Error("CloudLink: Property cannot be a symbol.");
        }
        return async (...args: any[]) => {
          let token = null;
          if (auth && auth.currentUser) {
            token = await auth.currentUser.getIdToken();
          }
          const payload = { token, method: prop, args: args };
          const serializedPayload = JSON.stringify(payload);
          const deserializedPayload = JSON.parse(serializedPayload);
          const errors = deepCompare(payload, deserializedPayload, [], prop as string);

          if (errors.length > 0) {
            throw new Error(
              `CloudLink: JSON incompatible values found:\n${errors
                .map((path) => path.join("."))
                .join("\n")}`
            );
          }

          const response = await fetch(endpoint, {
            method: "POST",
            body: serializedPayload,
            headers: { "Content-Type": "application/json" },
          });

          const data = await response.json();

          if (!response.ok) {
            console.error(`CloudLink Error: ${data.error} - ${data.message}`);
            throw new Error(`CloudLink: ${data.error} - ${data.message}`);
          }

          // Return null or undefined if that's what the server sent
          if (data.result === null || data.result === undefined) {
            return data.result;
          }

          return data.result;
        };
      },
    };
    return new Proxy<AsyncMethods<T>>({} as AsyncMethods<T>, handler);
  }

  static expose<T extends object>(
    api: new (...args: any[]) => T,
    onRequest: OnRequestFunction,
    cors?: CorsFunction,
    auth?: ServerAuth
  ): any {
    let instance = new api();
    return onRequest(async (req, res) => {
      const handleRequest = async () => {
        const { token, method, args } = req.body;

        let validToken = true;
        if (auth) {
          if (!token) {
            res.status(401).json({
              error: "Unauthorized",
              message: "No token provided",
              method,
              args
            });
            return;
          }
          const decodedToken = await auth.verifyIdToken(token);
          validToken = decodedToken != null;
        }

        if (!validToken) {
          res.status(401).json({
            error: "Unauthorized",
            message: "Invalid token",
            method,
            args
          });
          return;
        }

        if (!method || !Array.isArray(args)) {
          res.status(400).json({
            error: "Bad Request",
            message: "Invalid request body. 'method' and 'args' are required fields.",
            method,
            args
          });
          return;
        }

        if (method in instance && typeof instance[method as keyof T] === "function") {
          try {
            const func = instance[method as keyof T] as any;
            const result = await func(...args);

            // Allow null or undefined to be returned
            if (result === undefined || result === null) {
              res.json({ result });
              return;
            }

            const combinedData = { method, args, result };
            const serializedData = JSON.stringify(combinedData);
            const deserializedData = JSON.parse(serializedData);
            const errors = deepCompare(combinedData, deserializedData);

            if (errors.length > 0) {
              throw new Error(
                `CloudLink: JSON incompatible values found:\n${errors
                  .map((path) => path.join("."))
                  .join("\n")}`
              );
            }

            res.json({ result });
          } catch (error) {
            console.error(`CloudLink: Error executing method '${method}':`, error);
            if (error instanceof Error) {
              res.status(500).json({
                error: "Internal Server Error",
                message: `Error executing method '${method}': ${error.message}`,
                method,
                args
              });
            } else {
              res.status(500).json({
                error: "Internal Server Error",
                message: `Unknown error occurred while executing method '${method}'`,
                method,
                args
              });
            }
          }
        } else {
          console.error(`CloudLink: Invalid method name '${method}'. This method does not exist on the provided API.`);
          res.status(400).json({
            error: "Bad Request",
            message: `Invalid method name '${method}'. This method does not exist on the provided API.`,
            method,
            args
          });
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