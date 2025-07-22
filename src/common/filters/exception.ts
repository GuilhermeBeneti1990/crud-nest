import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    response.status(status).json({
      status,
      message:
        errorResponse !== '' ? errorResponse : 'Erro ao realizar essa operação',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
