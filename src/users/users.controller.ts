import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('create_user')
  create(@Payload() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('find_all_users')
  findAll(@Payload() paginationDto : PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @MessagePattern('find_one_user')
  findOne(@Payload('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @MessagePattern('update_user')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('delete_user')
  remove(@Payload('id') id: string) {
    return this.usersService.remove(+id);
  }
}
