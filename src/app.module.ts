import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitsModule } from './bits/bits.module';

@Module({
  imports: [BitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
