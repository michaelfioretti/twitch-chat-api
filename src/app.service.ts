import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHeartbeat(): string {
    return 'ok';
  }
}
