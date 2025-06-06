import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { createdAt: 'createdat' } })
export class Message {
  @Prop()
  username: string;

  @Prop()
  channel: string;

  @Prop()
  message: string;

  @Prop()
  badges: string[];

  @Prop()
  color: string;

  @Prop()
  room: string;

  @Prop()
  bits: number;

  @Prop()
  mod: number;

  @Prop()
  subscribed: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
