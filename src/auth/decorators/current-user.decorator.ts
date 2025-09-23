import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "../interfaces/request-with-user.interface";

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);