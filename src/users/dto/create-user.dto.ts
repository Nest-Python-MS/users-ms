import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    public first_name: string;

    @IsString()
    public last_name: string;

    @IsString()
    @IsEmail()
    public email: string;

}
