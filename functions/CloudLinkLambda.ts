// AWSLambdaCloudLink.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import CloudLink, { Auth, CorsFunction } from 'cloudlink';
import 'source-map-support/register';

type Constructor<T = {}> = new (...args: any[]) => T;

export default class AWSLambdaCloudLink {
  static expose<T extends object>(
    api: Constructor<T>,
    cors?: CorsFunction,
    auth?: Auth
  ): APIGatewayProxyHandler {
    const handler = CloudLink.expose(api, AWSLambdaCloudLink.requestHandler, cors, auth);

    return async (event, context) => {
      const req = { 
        body: JSON.parse(event.body || ''), 
        headers: event.headers 
      };

      const res = {
        statusCode: 200,
        body: '',
        headers: {
          'Content-Type': 'application/json'
        },
        status: function(code: number) { this.statusCode = code; return this; },
        send: function(body: any) { this.body = JSON.stringify(body); return this; },
        json: function(body: any) { this.body = JSON.stringify(body); return this; }
      };

      await handler(req, res);

      return {
        statusCode: res.statusCode,
        body: res.body,
        headers: res.headers
      };
    };
  }

  private static async requestHandler(req: any, res: any): Promise<void> {
    // Your custom AWS Lambda request handling code here.
  }
}
