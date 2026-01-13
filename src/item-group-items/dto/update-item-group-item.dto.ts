import { PartialType } from '@nestjs/mapped-types';
import { CreateItemGroupItemDto } from './create-item-group-item.dto';

export class UpdateItemGroupItemDto extends PartialType(CreateItemGroupItemDto) {}
