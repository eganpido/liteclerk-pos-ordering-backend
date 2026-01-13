import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminalsService } from './terminals.service';
import { TerminalsController } from './terminals.controller';
import { Terminal, TerminalSchema } from './terminal.schema';
import { Counter, CounterSchema } from '../schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Terminal.name, schema: TerminalSchema },
      { name: Counter.name, schema: CounterSchema }
    ])
  ],
  controllers: [TerminalsController],
  providers: [TerminalsService],
})
export class TerminalsModule { }