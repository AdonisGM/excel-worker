import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { BodyJWT } from '../models/auth/auth.type';
import { InjectRepository } from '@nestjs/typeorm';
import { BudgooseInfoEntity } from '../entity';
import { Repository } from 'typeorm';

@Injectable()
export class BudgooseRegGuard implements CanActivate {
  constructor(
    @InjectRepository(BudgooseInfoEntity)
    private readonly budgooseInfoEntityRepository: Repository<BudgooseInfoEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // get username from request body
    const tokenData = request['tokenData'] as BodyJWT;
    const username = tokenData.username;

    // Check if the user is registered
    const isRegistered = await this.budgooseInfoEntityRepository.count({
      where: { username },
    });
    if (isRegistered === 0) {
      throw new ForbiddenException(
        'You have not registered this service, please register first',
      );
    }

    return true;
  }
}
