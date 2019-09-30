import { Injectable, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RpcInternalServerError, RpcError } from "../lib/errors";

// tslint:disable:max-classes-per-file
@Injectable()
class RpcInterceptor implements NestInterceptor {
  public intercept(
    // tslint:disable-next-line:variable-name
    _context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(map(data => ({ result: data })));
  }
}

@Injectable()
export class RpcErrorInterceptor implements NestInterceptor {
  public intercept(
    _: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(
      catchError(err => {
        if (err instanceof RpcError) {
          throw err;
        } else {
          throw new RpcInternalServerError(err);
        }
      }),
    );
  }
}
export default RpcInterceptor;
