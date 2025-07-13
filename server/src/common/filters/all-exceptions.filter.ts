import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
        
        // Special handling for ForbiddenException with subscription details
        if (status === HttpStatus.FORBIDDEN && responseObj.code === 'SUBSCRIPTION_REQUIRED') {
          // Pass through the structured subscription error
          response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...responseObj,
          });
          return;
        }
      } else {
        message = exceptionResponse.toString();
      }
      
      // Log 4xx errors as warnings, 5xx as errors (from HttpExceptionFilter)
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} Error: ${message}`,
          exception.stack,
          {
            path: request.url,
            method: request.method,
            body: request.body,
            user: (request as any).user?.id,
          }
        );
      } else if (status >= 400) {
        this.logger.warn(
          `HTTP ${status} Warning: ${message}`,
          {
            path: request.url,
            method: request.method,
            user: (request as any).user?.id,
          }
        );
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Log the full error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        {
          path: request.url,
          method: request.method,
          body: request.body,
        }
      );
    } else {
      // Unknown error type
      this.logger.error(
        'Unknown exception type',
        exception,
        {
          path: request.url,
          method: request.method,
          body: request.body,
        }
      );
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'An error occurred while processing your request';
      details = undefined;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
      ...(details && { details }),
    });
  }
}