/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitsModule } from './bits/bits.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BitsModule,
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9zf2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
