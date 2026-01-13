import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Terminal } from './terminal.schema';
import { Counter } from '../schemas/counter.schema';

@Injectable()
export class TerminalsService {
  constructor(
    @InjectModel(Terminal.name) private terminalModel: Model<Terminal>,
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
  ) { }

  async create(createTerminalDto: any): Promise<Terminal> {
    const counter = await this.counterModel.findOneAndUpdate(
      { id: 'terminal_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    createTerminalDto.terminalId = counter.seq;
    const newTerminal = new this.terminalModel(createTerminalDto);
    return newTerminal.save();
  }

  async findAll(): Promise<Terminal[]> {
    return this.terminalModel.find().exec();
  }
}