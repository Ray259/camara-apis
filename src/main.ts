import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';
import { callForwardingSwaggerConfig } from './camara-call-forwarding-signal/call-forwarding-signal.swagger';
import { customerInsightsSwaggerConfig } from './camara-customer-insights/customer-insights.swagger';

const swaggerConfigs = [
  callForwardingSwaggerConfig,
  customerInsightsSwaggerConfig,
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Setup Swagger for each API
  for (const { path, config } of swaggerConfigs) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(path, app, document);
  }

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`CAMARA API server running on port ${PORT}`);
  console.log(`Call Forwarding Signal: http://localhost:${PORT}/call-forwarding-signal/vwip`);
  console.log(`Customer Insights: http://localhost:${PORT}/customer-insights/vwip`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}
bootstrap();



