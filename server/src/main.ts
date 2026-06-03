import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/responce/responce.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception/prisma-exception.filter';
import { CustomValidationPipe } from './common/pipes/custom-validation/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalPipes(new CustomValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('SkillTrack API')
    .setDescription('API documentation for SkillTrack')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`docs`, app, document);
  await app.listen(3000);
  console.log(`Server running at http://localhost:3000`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
