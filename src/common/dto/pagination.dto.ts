import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";
import { number } from "joi";

export class PaginationDto{

    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    page? : number = 1;

    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;
}