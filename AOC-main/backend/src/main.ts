import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  const prefix = config.get<string>('API_PREFIX', 'api/v1');

  // Global prefix
  app.setGlobalPrefix(prefix);

  // Cookie parser (HTTP-only auth cookies)
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Attack on Code API')
    .setDescription('Backend engine for the hackathon collaboration ecosystem')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'Builder identity & profiles')
    .addTag('teams', 'Team formation & management')
    .addTag('hackathons', 'Hackathon coordination')
    .addTag('projects', 'Project workspaces')
    .addTag('activity', 'Activity feed & history')
    .addTag('notifications', 'Notification system')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`\n⚔️  Attack on Code API running on http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/docs\n`);
}

bootstrap();
