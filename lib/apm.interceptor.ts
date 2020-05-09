import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApmService } from './apm.service';

@Injectable()
export class ApmInterceptor implements NestInterceptor {
  constructor(private readonly apmService: ApmService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      catchError(error => {
        if (error.message && error.message.message) {
          error.message = error.message.message;
        }
        this.apmService.captureError(error, {
          request: req,
          response: res
        });

        throw error;
      })
    );
  }
}
