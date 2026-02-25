import { Module } from '@nestjs/common';
import { NumberVerificationController } from './controllers/number-verification.controller';
import { NumberVerificationService } from './services/number-verification.service';
import {
  NUMBER_VERIFICATION_REPOSITORY,
  NumberVerificationRepository,
} from './repositories/number-verification.repository';
import { Free5GCNumberVerificationRepository } from './repositories/number-verification.repository.free5gc';

@Module({
  controllers: [NumberVerificationController],
  providers: [
    NumberVerificationService,
    {
      provide: NUMBER_VERIFICATION_REPOSITORY,
      useFactory: () => {
        const mongoUri = process.env.MONGODB_URI;
        if (mongoUri) {
          return new Free5GCNumberVerificationRepository(mongoUri);
        }
        return new NumberVerificationRepository();
      },
    },
  ],
})
export class NumberVerificationModule {}
