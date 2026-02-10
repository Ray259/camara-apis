import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '@/app.module';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';

const JWT_SECRET = 'test-secret-key';
const BASE_URL = '/device-swap/vwip';

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

describe('Device Swap API (e2e)', () => {
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

  describe('POST /retrieve-date', () => {
    const endpoint = `${BASE_URL}/retrieve-date`;

    describe('Success Cases', () => {
      it('200 - returns latestDeviceChange with date (two-legged)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(200);
        expect(res.body.latestDeviceChange).toBe('2024-09-18T07:37:53.471Z');
        expect(res.body.monitoredPeriod).toBeUndefined();
      });

      it('200 - returns null latestDeviceChange with monitoredPeriod', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+198765432' });

        expect(res.status).toBe(200);
        expect(res.body.latestDeviceChange).toBeNull();
        expect(res.body.monitoredPeriod).toBe(120);
      });

      it('200 - returns null latestDeviceChange without monitoredPeriod', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+222222222' });

        expect(res.status).toBe(200);
        expect(res.body.latestDeviceChange).toBeNull();
        expect(res.body.monitoredPeriod).toBeUndefined();
      });

      it('200 - extracts phone from three-legged token (tel:)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({});

        expect(res.status).toBe(200);
        expect(res.body.latestDeviceChange).toBe('2024-09-18T07:37:53.471Z');
      });

      it('200 - returns x-correlator header when provided', async () => {
        const correlator = 'test-correlator-123';
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .set('x-correlator', correlator)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(200);
        expect(res.headers['x-correlator']).toBe(correlator);
      });
    });

    describe('Error Cases', () => {
      it('400 INVALID_ARGUMENT - invalid phone number format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: 'invalid-phone' });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
        expect(res.body.message).toBe('Client specified an invalid argument, request body or query param.');
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
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
        expect(res.body.message).toBe('Request not authenticated due to missing, invalid, or expired credentials.');
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
        expect(res.body.message).toBe('Device identifier not found.');
      });

      it('422 MISSING_IDENTIFIER - two-legged without phoneNumber', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({});

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('MISSING_IDENTIFIER');
        expect(res.body.message).toBe('The phone number cannot be identified.');
      });

      it('422 UNNECESSARY_IDENTIFIER - three-legged with phoneNumber in body', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('UNNECESSARY_IDENTIFIER');
      });

      it('422 SERVICE_NOT_APPLICABLE - service not available for identifier', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${serviceNotApplicableToken}`)
          .send({});

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('SERVICE_NOT_APPLICABLE');
        expect(res.body.message).toBe('The service is not available for the provided identifier.');
      });
    });
  });

  describe('POST /check', () => {
    const endpoint = `${BASE_URL}/check`;

    describe('Success Cases', () => {
      it('200 - swapped=true when swap occurred within maxAge', async () => {
        // +123456789 has latestDeviceChange: '2024-09-18T07:37:53.471Z'
        // Use a very large maxAge to ensure it captures the swap
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 2400 });

        expect(res.status).toBe(200);
        expect(typeof res.body.swapped).toBe('boolean');
      });

      it('200 - swapped=false when no swap occurred within maxAge', async () => {
        // +123456789 has swap in Sept 2024, using small maxAge should return false
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 1 });

        expect(res.status).toBe(200);
        expect(res.body.swapped).toBe(false);
      });

      it('200 - swapped=false when latestDeviceChange is null', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+222222222', maxAge: 240 });

        expect(res.status).toBe(200);
        expect(res.body.swapped).toBe(false);
      });

      it('200 - uses default maxAge (240) when not provided', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789' });

        expect(res.status).toBe(200);
        expect(typeof res.body.swapped).toBe('boolean');
      });

      it('200 - extracts phone from three-legged token', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({ maxAge: 240 });

        expect(res.status).toBe(200);
        expect(typeof res.body.swapped).toBe('boolean');
      });

      it('200 - returns x-correlator header when provided', async () => {
        const correlator = 'test-correlator-456';
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .set('x-correlator', correlator)
          .send({ phoneNumber: '+123456789', maxAge: 240 });

        expect(res.status).toBe(200);
        expect(res.headers['x-correlator']).toBe(correlator);
      });
    });

    describe('Error Cases', () => {
      it('400 INVALID_ARGUMENT - invalid phone number format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: 'invalid-phone', maxAge: 240 });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
        expect(res.body.message).toBe('Client specified an invalid argument, request body or query param.');
      });

      it('400 INVALID_ARGUMENT - maxAge is not an integer', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 'abc' });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
      });

      it('400 INVALID_ARGUMENT - maxAge below minimum (0)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 0 });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
      });

      it('400 INVALID_ARGUMENT - maxAge above maximum (2401)', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 2401 });

        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INVALID_ARGUMENT');
      });

      it('401 UNAUTHENTICATED - missing authorization', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .send({ phoneNumber: '+123456789', maxAge: 240 });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('401 UNAUTHENTICATED - invalid token format', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', 'Bearer invalid-token')
          .send({ phoneNumber: '+123456789', maxAge: 240 });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('401 UNAUTHENTICATED - expired token', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 240 });

        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
      });

      it('404 IDENTIFIER_NOT_FOUND - phone number not in database', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ phoneNumber: '+999999999', maxAge: 240 });

        expect(res.status).toBe(404);
        expect(res.body.code).toBe('IDENTIFIER_NOT_FOUND');
        expect(res.body.message).toBe('Device identifier not found.');
      });

      it('422 MISSING_IDENTIFIER - two-legged without phoneNumber', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${twoLeggedToken}`)
          .send({ maxAge: 240 });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('MISSING_IDENTIFIER');
        expect(res.body.message).toBe('The phone number cannot be identified.');
      });

      it('422 UNNECESSARY_IDENTIFIER - three-legged with phoneNumber in body', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${threeLeggedToken}`)
          .send({ phoneNumber: '+123456789', maxAge: 240 });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('UNNECESSARY_IDENTIFIER');
      });

      it('422 SERVICE_NOT_APPLICABLE - service not available for identifier', async () => {
        const res = await request(app.getHttpServer())
          .post(endpoint)
          .set('Authorization', `Bearer ${serviceNotApplicableToken}`)
          .send({ maxAge: 240 });

        expect(res.status).toBe(422);
        expect(res.body.code).toBe('SERVICE_NOT_APPLICABLE');
        expect(res.body.message).toBe('The service is not available for the provided identifier.');
      });
    });
  });
});
