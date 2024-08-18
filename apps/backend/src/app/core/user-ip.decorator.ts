import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { extractRequest } from "@shorten-url/keycloak-connect";

export const UserIP = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const [request] = extractRequest(context);
    let userIP = request.ip;

    // 使用 x-forwarded-for 標頭取得 IP 位址
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      userIP = forwardedFor.split(',')[0];
    }

    if (!userIP) {
      userIP = request.ip || request.connection.remoteAddress;
    }

    if (userIP.substr(0, 7) == "::ffff:") {
      userIP = userIP.substr(7)
    }

    return userIP;
  },
);

export const UserIp = UserIP;
