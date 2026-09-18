import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    logger,
  });
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  configureApp(app);
  const config = new DocumentBuilder()
    .setTitle('SkillTrack API')
    .setDescription('API documentation for SkillTrack')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });
  await app.listen(3000);
  logger.log('Server running', { url: 'http://localhost:3000' });
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start server', error);
  process.exit(1);
});
