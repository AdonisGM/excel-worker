import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRefreshTokenEntity } from '../../entity';
import { Repository, LessThanOrEqual } from 'typeorm';

/**
 * Service for managing user refresh tokens.
 */
@Injectable()
export class UserRefreshTokenService {
  /**
   * Constructor for UserRefreshTokenService.
   */
  constructor(
    @InjectRepository(UserRefreshTokenEntity)
    private readonly userRefreshTokenRepository: Repository<UserRefreshTokenEntity>,
  ) {}

  /**
   * Save a user refresh token entity to the database.
   *
   * @param {UserRefreshTokenEntity} userRefreshToken - The user refresh token entity to save.
   *
   * @return {Promise<UserRefreshTokenEntity>} - The saved user refresh token entity.
   */
  public async save(
    userRefreshToken: UserRefreshTokenEntity,
  ): Promise<UserRefreshTokenEntity> {
    return this.userRefreshTokenRepository.save(userRefreshToken);
  }

  /**
   * Check existence of a refresh token in the database.
   *
   * @param {string} refreshToken - The refresh token to check.
   *
   * @return {Promise<boolean>} - A promise that resolves to true if the refresh token exists, false otherwise.
   */
  public async exists(refreshToken: string): Promise<boolean> {
    const count = await this.userRefreshTokenRepository.count({
      where: { refreshToken },
    });
    return count === 1;
  }

  /**
   * Delete selected refresh token from the database.
   *
   * @param {string} refreshToken - The refresh token to delete.
   *
   * @return {Promise<void>} - A promise that resolves when the refresh token is deleted.
   */
  public async delete(refreshToken: string): Promise<void> {
    await this.userRefreshTokenRepository.delete({ refreshToken });
  }

  /**
   * Delete all expired refresh tokens in the database of a user.
   *
   * @param {string} username - The ID of the user whose expired refresh tokens to find.
   *
   * @return {Promise<void>} - A promise that resolves when the expired refresh tokens are deleted.
   */
  public async deleteExpired(username: string): Promise<void> {
    await this.userRefreshTokenRepository.delete({
      username,
      expireDate: LessThanOrEqual(new Date()),
    });
  }
}
