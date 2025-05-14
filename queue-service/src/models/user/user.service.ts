import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';

/**
 * UserService is responsible for handling user-related operations.
 * It interacts with the UserEntity to perform CRUD operations.
 */
@Injectable()
export class UserService {
  /**
   * Constructor for UserService.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Find a user by their username.
   *
   * @param {string} username - The username of the user to find.
   *
   * @return {Promise<UserEntity | null>} - A promise that resolves to the found user entity.
   */
  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['createdBy', 'updatedBy'],
    });
  }

  /**
   * Get user system, using for initial data create by system.
   *
   * @return {Promise<UserEntity | null>} - A promise that resolves to the found user entity.
   */
  async getUserSystem(): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { username: 'system' },
    });
  }

  /**
   * Find a user by their email.
   *
   * @param {string} email - The email of the user to find.
   *
   * @return {Promise<UserEntity | null>} - A promise that resolves to the found user entity.
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find a user by their username and email.
   *
   * @param {string} username - The username of the user to find.
   * @param {string} email - The email of the user to find.
   *
   * @return {Promise<UserEntity | null>} - A promise that resolves to the found user entity.
   */
  async findByUsernameAndEmail(
    username: string,
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: [{ username }, { email }],
    });
  }

  /**
   * Save a user entity to the database.
   *
   * @param {UserEntity} user - The user entity to create.
   *
   * @return {Promise<UserEntity>} - A promise that resolves to the created user entity.
   */
  async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }
}
