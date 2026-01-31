export class CreateItemDto {
    posItemId: number;
    itemDescription: string;
    price: number;
    isInventory: boolean;
    isLocked: boolean;
}