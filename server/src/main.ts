import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors();
    
    // Global pipes
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    }));
    
    // Global exception filter - handles all exceptions including HttpException
    app.useGlobalFilters(new AllExceptionsFilter());
    
    // Graceful shutdown
    app.enableShutdownHooks();
    
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  // Give the logger time to write, then exit
  setTimeout(() => process.exit(1), 1000);
});

void bootstrap();
