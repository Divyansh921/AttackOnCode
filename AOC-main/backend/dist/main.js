"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT', 4000);
    const prefix = config.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(prefix);
    app.use(cookieParser());
    app.enableCors({
        origin: config.get('CORS_ORIGIN', 'http://localhost:3000'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(port);
    console.log(`\n⚔️  Attack on Code API running on http://localhost:${port}`);
    console.log(`📄 Swagger docs at http://localhost:${port}/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map