import { PartialType } from '@nestjs/mapped-types';
import { CreateTableGroupDto } from './create-table-group.dto';

export class UpdateTableGroupDto extends PartialType(CreateTableGroupDto) {}
