import { BadRequestException, Injectable } from '@nestjs/common';
import { BudgooseInfoEntity, UserEntity } from '../../../entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * BudgooseInfoService is a service that manages the Budgoose info
 */
@Injectable()
export class BudgooseInfoService {
  /**
   * Constructor for BudgooseInfoService
   */
  constructor(
    @InjectRepository(BudgooseInfoEntity)
    private readonly budgooseInfoRepository: Repository<BudgooseInfoEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Check user has registered service budgoose
   * @param {string} username - The username of the user
   *
   * @returns {Promise<boolean>}
   */
  public async checkRegisteredService(username: string): Promise<boolean> {
    const budgooseInfo = await this.budgooseInfoRepository.findOne({
      where: { username },
    });
    return !!budgooseInfo;
  }

  /**
   * Get budgoose info by username
   * @param {string} username - The username of the user
   *
   * @returns {Promise<BudgooseInfoEntity>}
   */
  public async getByUsername(
    username: string,
  ): Promise<BudgooseInfoEntity | null> {
    return await this.budgooseInfoRepository.findOne({
      where: { username },
    });
  }

  /**
   * Register user to budgoose service
   * @param {string} username - The username of the user
   *
   * @returns {Promise<BudgooseInfoEntity>}
   *
   * @description
   * 1. Get user entity
   * 2. Check if user already registered
   * 3. If not, create new budgoose info entity
   * 4. Update user entity with budgoose info
   * 5. Save to database
   *
   * @throws {BadRequestException} - If user already registered
   */
  public async registerService(username: string): Promise<BudgooseInfoEntity> {
    // Get user entity
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user already registered
    const isRegistered = await this.checkRegisteredService(username);
    if (isRegistered) {
      throw new BadRequestException('User already registered');
    }

    // new object of budgoose info
    const budgooseInfo = {
      username: username,
      cashBalance: 0,
      cashCreditLimit: 0,
      cashCreditUsage: 0,
      cashLoan: 0,
      cashSavings: 0,
    } as BudgooseInfoEntity;

    // Create new budgoose info entity
    budgooseInfo.userEntity = user;
    const newBudgooseInfo =
      await this.budgooseInfoRepository.save(budgooseInfo);

    // Update user entity with budgoose info
    user.budgooseInfo = newBudgooseInfo;
    await this.userRepository.save(user);

    // Save to database
    return newBudgooseInfo;
  }
}
