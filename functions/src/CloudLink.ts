import * as jsan from 'jsan';

type AsyncMethods<T extends object> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : never;
};

type OnRequestFunction = (
  handler: (req: any, res: any) => Promise<void>
) => void;

type CorsFunction = (req: any, res: any, next: () => void) => void;

let jsanOptions = {
  'date': false,
  'function': false,
  'regex': true,
  'undefined': true,
  'error': false,
  'symbol': true,
  'map': true,
  'set': true,
  'nan': true,
  'refs': false,
  'infinity': true,
};

function deepEqual(x: any, y: any): boolean {
  if (x === y) {
    return true;
  } else if (
    typeof x === 'object' && x != null &&
    typeof y === 'object' && y != null
  ) {
    if (Object.keys(x).length !== Object.keys(y).length) {
      return false;
    }

    for (let prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

function checkSerialization(obj: any, path: string = ''): void {
  if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      checkSerialization(obj[key], `${path}${path ? '.' : ''}${key}`);
    }
  } else {
    try {
      const serialized = jsan.stringify(obj, undefined, undefined, jsanOptions)
      const deserialized = jsan.parse(serialized);
      if (!deepEqual(obj, deserialized)) {
        throw new Error();
      }
    } catch (error) {
      throw new Error(`The property '${path}' of type '${Object.prototype.toString.call(obj)}' is not supported by JSAN.`);
    }
  }
}

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
          for (const arg of args) {
            try {
              checkSerialization(arg);
            } catch (error) {
              if (error instanceof Error) {
                throw new Error(`Error serializing argument: ${error.message}`);
              } else {
                throw new Error("Unknown serialization error occurred.");
              }
            }
          }
          const response = await fetch(endpoint, {
            method: "POST",
            body: jsan.stringify({ method: prop, args: args }, undefined, undefined, jsanOptions),
            headers: { "Content-Type": "application/json" }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return jsan.parse(await response.text());
        };
      }
    };
    return new Proxy<AsyncMethods<T>>({} as AsyncMethods<T>, handler);
  } 

  static expose<T extends object>(
    api: new (...args: any[]) => T,
    onRequest: OnRequestFunction,
    cors?: CorsFunction
  ): any {
    let instance = new api();
    return onRequest(async (req, res) => {
      const handleRequest = async () => {
        const { method, args } = jsan.parse(req.body) as any;
        if (!method || !Array.isArray(args)) {
          res.status(400).send("Invalid request body. 'method' and 'args' are required fields.");
          return;
        }
        if (method in instance && typeof instance[method as keyof T] === 'function') {
          try {
            const func = instance[method as keyof T] as (...args: any[]) => Promise<any>;
            const result = await func(...args);
            try {
              checkSerialization(result);
            } catch (error) {
              if (error instanceof Error) {
                res.status(500).send(error.message);
              } else {
                res.status(500).send(`Unknown error occurred while executing method '${method}'`);
              }
            }
            res.json(jsan.stringify(result, undefined, undefined, jsanOptions));
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