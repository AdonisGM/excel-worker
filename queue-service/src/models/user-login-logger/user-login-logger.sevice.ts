import { Injectable } from '@nestjs/common';
import { UserLoginLoggerEntity } from '../../entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Service to log user login attempts.
 * This service is responsible for logging user login attempts
 */
@Injectable()
export class UserLoginLoggerService {
  /**
   * Constructor to initialize the UserLoginLoggerService
   */
  constructor(
    @InjectRepository(UserLoginLoggerEntity)
    private readonly userLoginLoggerRepository: Repository<UserLoginLoggerEntity>,
  ) {}

  /**
   * Save a user login logger entity to the database.
   *
   * @param {UserLoginLoggerEntity} userLoginLogger - The user login logger entity to save.
   *
   * @return {Promise<UserLoginLoggerEntity>} - The saved user login logger entity.
   */
  public async save(
    userLoginLogger: UserLoginLoggerEntity,
  ): Promise<UserLoginLoggerEntity> {
    return this.userLoginLoggerRepository.save(userLoginLogger);
  }
}
