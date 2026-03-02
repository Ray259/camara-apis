import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NumberVerificationController } from './controllers/number-verification.controller';
import { NumberVerificationService } from './services/number-verification.service';
import { NUMBER_VERIFICATION_REPOSITORY } from './repositories/number-verification.repository';
import { Free5GCNumberVerificationRepository } from './repositories/number-verification.repository.free5gc';

@Module({
  imports: [ConfigModule],
  controllers: [NumberVerificationController],
  providers: [
    NumberVerificationService,
    {
      provide: NUMBER_VERIFICATION_REPOSITORY,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        if (mongoUri) {
          return new Free5GCNumberVerificationRepository(mongoUri);
        }
      },
    },
  ],
})
export class NumberVerificationModule {}
