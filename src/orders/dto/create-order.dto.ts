import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsNotEmpty()
    @IsNumber()
    orderItemId: number;

    @IsNotEmpty()
    @IsNumber()
    itemId: number;

    @IsNotEmpty()
    @IsString()
    itemDescription: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    subtotal: number;
}

export class CreateOrderDto {
    @IsOptional()
    @IsNumber()
    orderId?: number;

    @IsNotEmpty()
    @IsNumber()
    customerId: number;

    @IsNotEmpty()
    @IsNumber()
    terminalId: number;

    @IsNotEmpty()
    @IsNumber()
    tableId: number;

    @IsNotEmpty()
    @IsNumber()
    totalAmount: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    orderItems: OrderItemDto[];

    @IsBoolean()
    isLocked: boolean;
}