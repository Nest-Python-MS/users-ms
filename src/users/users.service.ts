import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('UsersService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected')
  }

  create(createUserDto: CreateUserDto) {
    return this.user.create({
      data: createUserDto
    })
  }

  async findAll(paginationDto : PaginationDto) {
    const {page, limit} = paginationDto;
    const total_rows = await this.user.count({where: {active: true}});
    const last_page = Math.ceil(total_rows/limit);


    return {
      data: await this.user.findMany({
        where: {active: true},
        skip: (page - 1) * limit,
        take: limit
      }),
      metadata: {
        page: page,
        limit: limit,
        total_rows: total_rows,
        last_page: last_page
      }
    }
  }

  async findOne(id: number) {
    const user = await this.user.findFirst({
      where: {id, active: true}
    })

    if(!user){
      throw new NotFoundException(`User dosn´t exist`)
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    try{
      const {id: __, ...data} = updateUserDto;
      const user = await this.user.update({
        where: {id},
        data: data,
      })
      if(!user){
        throw new NotFoundException(`User with id ${id} does not exist`);
      }
      return user;
    }
    catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(`User with id ${id} does not exist`);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async remove(id: number) {
    try{
      const user = await this.user.update({
        where: {id},
        data: {
          active: false
        },
      })
      if(!user){
        throw new NotFoundException(`User with id ${id} does not exist`);
      }
      return user;
    }
    catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException(`User with id ${id} does not exist`);
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
