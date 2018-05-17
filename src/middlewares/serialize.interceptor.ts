import { Injectable, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { classToPlain } from "class-transformer";

@Injectable()
class SerializeInterceptor implements NestInterceptor {
  public intercept(_: ExecutionContext, call$: Observable<any>): Observable<any> {
    return call$.pipe(map(value => classToPlain(value)));
  }
}

export default SerializeInterceptor;
