import { ContextType, ExecutionContext } from '@nestjs/common';
import { JwtUser } from './decorators/authenticated-user.decorator';

type GqlContextType = 'graphql' | ContextType;

/**
 * Get request and response instances from context
 * @param context
 * @returns request & response
 */
export const extractRequest = (context: ExecutionContext): [any, any] => {
  let request: any, response: any;

  // Check if request is coming from graphql or http
  if (context.getType() === 'http') {
    // http request
    const httpContext = context.switchToHttp();

    request = httpContext.getRequest();
    response = httpContext.getResponse();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    let gql: any;
    // Check if graphql is installed
    try {
      gql = require('@nestjs/graphql');
    } catch (er) {
      throw new Error('@nestjs/graphql is not installed, cannot proceed');
    }

    // graphql request
    const gqlContext = gql.GqlExecutionContext.create(context).getContext();

    request = gqlContext.req;
    response = gqlContext.res;
  }

  return [request, response];
};

export const parseToken = (token: string) => {
  const parts = token.split('.');
  return JsonUtils.fromJson<JwtUser>(Buffer.from(parts[1], 'base64').toString());
};

// kind of useless ?
export class JsonUtils {
  private constructor() {
    // no-op
  }
  static fromJson<T = any>(json: string): T {
    return JSON.parse(json) as T;
  }
  static toJson(obj: any): string {
    return JSON.stringify(obj);
  }
}
