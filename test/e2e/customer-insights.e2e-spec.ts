import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '@/app.module';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

const JWT_SECRET = 'test-secret-key';
const BASE_URL = '/customer-insights/vwip';

const generateToken = (payload: object, expiresInSeconds = 3600) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
};

const twoLeggedToken = generateToken({ iss: 'test-issuer' });
const threeLeggedToken = generateToken({ sub: 'tel:+123456789' });
const unknownPhoneToken = generateToken({
  sub: 'tel:+999999999',
  iss: 'test-issuer',
});
const serviceNotApplicableToken = generateToken({ sub: 'tel:+111111111' });

// Expired token
const expiredToken = jwt.sign(
  { sub: 'tel:+123456789', exp: Math.floor(Date.now() / 1000) - 3600 },
  JWT_SECRET,
);

describe('Customer Insights API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /scoring/retrieve', () => {
    const endpoint = `${BASE_URL}/scoring/retrieve`;

    describe('Success Cases', () => {
      it('200 - returns gaugeMetric scoring (two-legged)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', scoringType: 'gaugeMetric' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          scoringType: 'gaugeMetric',
          scoringValue: 750,
        });
      });

      it('200 - returns veritasIndex scoring (two-legged)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', scoringType: 'veritasIndex' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          scoringType: 'veritasIndex',
          scoringValue: 4,
        });
      });

      it('200 - extracts phone from three-legged token (tel:)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({ scoringType: 'gaugeMetric' });

        expect(res.status).toBe(200);
        expect(res.body.scoringType).toBe('gaugeMetric');
        expect(res.body.scoringValue).toBe(750);
      });

      it('200 - uses default scoringType (gaugeMetric) when not provided', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(200);
        expect(res.body.scoringType).toBe('gaugeMetric');
      });

      it('200 - returns x-correlator header when provided', async () => {
        const correlator = 'test-correlator-123';
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .set('x-correlator', correlator)
          .send({ phoneNumber: '+123456789', scoringType: 'gaugeMetric' });

        expect(res.status).toBe(200);
        expect(res.headers['x-correlator']).toBe(correlator);
      });

      it('200 - scoring with valid idDocument', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({
            phoneNumber: '+123456789',
            idDocument: '987654321',
            scoringType: 'gaugeMetric',
          });

        expect(res.status).toBe(200);
        expect(res.body.scoringType).toBe('gaugeMetric');
      });
    });

    describe('Error Cases', () => {
      it('400 INVALID_ARGUMENT - invalid phone number format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: 'invalid-phone', scoringType: 'gaugeMetric' });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
      });

      it('400 INVALID_ARGUMENT - invalid x-correlator format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .set('x-correlator', 'invalid correlator with spaces!')
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
      });

      it('401 UNAUTHENTICATED - missing authorization header', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .send({ phoneNumber: '+123456789', scoringType: 'gaugeMetric' });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('401 UNAUTHENTICATED - invalid token format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', 'Bearer invalid-token')
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('401 UNAUTHENTICATED - expired token', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('404 IDENTIFIER_NOT_FOUND - phone number not in database', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${unknownPhoneToken}`)
          .send({});

        expect(res.status).toBe(404);
        expect(res.body.code).toBe('IDENTIFIER_NOT_FOUND');
        expect(res.body.message).toBe('phoneNumber not found.');
      });

      it('422 MISSING_IDENTIFIER - two-legged without phoneNumber', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ scoringType: 'gaugeMetric' });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('MISSING_IDENTIFIER');
        expect(res.body.message).toBe('The phone number cannot be identified.');
      });

      it('422 UNNECESSARY_IDENTIFIER - three-legged with phoneNumber in body', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({ phoneNumber: '+123456789', scoringType: 'gaugeMetric' });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('UNNECESSARY_IDENTIFIER');
        expect(res.body.message).toBe(
          'The phone number is already identified by the access token.',
        );
      });

      it('422 SERVICE_NOT_APPLICABLE - service not available for identifier', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${serviceNotApplicableToken}`)
          .send({});

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('SERVICE_NOT_APPLICABLE');
        expect(res.body.message).toBe(
          'The service is not available for the provided identifier.',
        );
      });

      it('422 CUSTOMER_INSIGHTS.INVALID_IDENTIFIERS - idDocument mismatch', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({
            phoneNumber: '+123456789',
            idDocument: 'wrong-id-document',
            scoringType: 'gaugeMetric',
          });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('CUSTOMER_INSIGHTS.INVALID_IDENTIFIERS');
        expect(res.body.message).toBe('The request contains invalid data.');
      });
    });
  });
});
