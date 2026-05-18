import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LockService } from './lock.service';

@Injectable()
export class LockExpiryScheduler {
  private readonly logger = new Logger(LockExpiryScheduler.name);

  constructor(private readonly lockService: LockService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async liberarLocksVencidos() {
    const count = await this.lockService.expireStaleLocks();
    if (count > 0) {
      this.logger.log(`${count} lock(s) liberados por inactividad/TTL`);
    }
  }
}
