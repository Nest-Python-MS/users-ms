import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AppUser-MS-DB')

  onModuleInit() {
    this.$connect();
    this.logger.log('Successfully connected')
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.user.create({
        data: createUserDto
      });

      return user;
    } catch (error) {
      const customMessage = `Email '${createUserDto.email}' is already in use.`;
      this.handleRpcError(error, customMessage);
    }
  }

  async findAll(paginationDto : PaginationDto) {
    try {
      const {page, limit} = paginationDto;
      const total_rows = await this.user.count();
      const last_page = Math.ceil(total_rows/limit);

      return {
        data: await this.user.findMany({
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
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.user.findFirst({
        where: { id },
      });
  
      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
        });
      }
  
      return user;
    } catch (error) {
      
      if (!(error instanceof RpcException)) {
        this.handleRpcError(error);
      }
  
      throw error;
    }
  }
  
  async update(id: number, updateUserDto: UpdateUserDto) {

    try{
      const {id: __, ...data} = updateUserDto;
      const user = await this.user.update({
        where: {id},
        data: data,
      })
      
      return user;
    }
    catch(error){
      this.handleRpcError(error);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.user.update({
        where: { id },
        data: { active: false },
      });
      return user;

    } catch (error) {
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: unknown, customMessage?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025': // Registro no encontrado
          throw new RpcException({
            status: HttpStatus.NOT_FOUND,
            message: customMessage || 'Resource not found',
          });
        case 'P2002': // Restricción única violada
          throw new RpcException({
            status: HttpStatus.CONFLICT,
            message: customMessage || 'Duplicate entry',
          });
        // Agrega más códigos de error si se necesitan
        default:
          throw new RpcException({
            status: HttpStatus.BAD_REQUEST,
            message: `Database error`,
          });
      }
    }
  
    // Manejo de otros errores genéricos
    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: customMessage || 'An unexpected error occurred',
    });
  }
}
