import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Terminal extends Document {
    @Prop({ required: true, unique: true })
    terminalId: number;

    @Prop({ required: true })
    terminalNumber: string;
}

export const TerminalSchema = SchemaFactory.createForClass(Terminal);