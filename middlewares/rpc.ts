import { Interceptor, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import { RpcInternalServerError } from "../lib/errors";

// tslint:disable:max-classes-per-file
@Interceptor()
class RpcInterceptor implements NestInterceptor {
  // tslint:disable-next-line:variable-name
  public intercept(_dataOrRequest: any, _context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.map((data) => ({ result: data }));
  }
}

@Interceptor()
export class RpcErrorInterceptor implements NestInterceptor {
  // tslint:disable-next-line:variable-name
  public intercept(_dataOrRequest: any, _context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.catch((err) => Observable.throw(
      new RpcInternalServerError(err),
    ));
  }
}
export default RpcInterceptor;
