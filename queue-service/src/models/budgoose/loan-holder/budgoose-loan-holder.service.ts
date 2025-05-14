import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BudgooseLoanHolderEntity,
  BudgooseLoanTransEntity,
  UserEntity,
} from '../../../entity';
import { Not, Repository } from 'typeorm';
import { PagingType, UtilService } from '../../util/util.service';
import { CreateBudgooseHolderDto } from './budgoose-loan-holder.zod';

/**
 * BudgooseLoanHolderService is a service that manages the Budgoose loan-holder
 */
@Injectable()
export class BudgooseLoanHolderService {
  /**
   * Constructor for BudgooseLoanHolderService
   */
  constructor(
    @InjectRepository(BudgooseLoanHolderEntity)
    private readonly budgooseLoanHolderEntityRepository: Repository<BudgooseLoanHolderEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(BudgooseLoanTransEntity)
    private readonly budgooseLoanTransEntityRepository: Repository<BudgooseLoanTransEntity>,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Get all Budgoose loan holders by username owner has pagination
   * @param {string} username - The username of the loan holder to find.
   * @param {number} offset - The offset for pagination.
   * @param {number} limit - The limit for pagination.
   *
   * @return {Promise<PagingType<BudgooseLoanHolderEntity>[]>} - A promise that resolves to the found loan holder entity.
   */
  public async findByUsername(
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseLoanHolderEntity>[]> {
    const listWallet = await this.budgooseLoanHolderEntityRepository.find({
      where: { username },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        cashLoan: 'desc',
        holderName: 'asc',
      },
    });

    return this.utilService.convertToPagination<BudgooseLoanHolderEntity>(
      listWallet,
      offset,
      limit,
    );
  }

  /**
   * Get detail budgoose loan holder by id
   * @param {string} holderId - The id of the loan holder to find.
   * @param {string} username - The username of the loan holder to find.
   *
   * @return {Promise<BudgooseLoanHolderEntity>} - A promise that resolves to the found loan holder entity.
   *
   * @throws {BadRequestException} - If the loan holder is not found.
   */
  public async getDetail(
    holderId: string,
    username: string,
  ): Promise<BudgooseLoanHolderEntity> {
    // Check holderId is correct
    const holder = await this.budgooseLoanHolderEntityRepository.findOne({
      where: { budgooseLoanHolderId: holderId, username: username },
    });

    if (!holder) {
      throw new BadRequestException('Budgoose holder not found');
    }

    return holder;
  }

  /**
   * Create new budgoose holder
   * @param { string } username - The username of the loan holder to find.
   * @param { CreateBudgooseHolderDto } body - The body of the request.
   *
   * @return {Promise<BudgooseLoanHolderEntity>} - A promise that resolves to the created loan holder entity.
   *
   * @throws {BadRequestException} - If the user does not exist or the loan holder already exists.
   */
  public async createNewHolder(
    username: string,
    body: CreateBudgooseHolderDto,
  ): Promise<BudgooseLoanHolderEntity> {
    // Check username is existed
    const user = await this.userEntityRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BadRequestException('User already exists');
    }

    // Check if the loan holder already exists
    const existHolder = await this.budgooseLoanHolderEntityRepository.findOne({
      where: { holderName: body.name, username },
    });
    if (existHolder) {
      throw new BadRequestException('Budgoose holder already exists');
    }

    // Create new budgoose holder
    const newObjectHolder = {
      username: username,
      holderName: body.name,
      note: body.note,
      userEntity: user,
    } as BudgooseLoanHolderEntity;

    return this.budgooseLoanHolderEntityRepository.save(newObjectHolder);
  }

  /**
   * Update budgoose holder
   * @param { string } holderId - The id of the loan holder to update.
   * @param { string } username - The username of the loan holder to find.
   * @param { CreateBudgooseHolderDto } body - The body of the request.
   *
   * @return {Promise<BudgooseLoanHolderEntity>} - A promise that resolves to the updated loan holder entity.
   *
   * @throws {BadRequestException} - If the user does not exist or the loan holder already exists.
   */
  public async updateHolder(
    holderId: string,
    username: string,
    body: CreateBudgooseHolderDto,
  ): Promise<BudgooseLoanHolderEntity> {
    // Check username is existed
    const user = await this.userEntityRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BadRequestException('User already exists');
    }

    // Check holderId is correct
    const holder = await this.budgooseLoanHolderEntityRepository.findOne({
      where: { budgooseLoanHolderId: holderId, username: username },
    });
    if (!holder) {
      throw new BadRequestException('Budgoose holder not found');
    }

    // Check if the loan holder already exists
    const existHolder = await this.budgooseLoanHolderEntityRepository.findOne({
      where: {
        holderName: body.name,
        username: username,
        budgooseLoanHolderId: Not(holderId),
      },
    });
    if (existHolder) {
      throw new BadRequestException('Budgoose holder name already exists');
    }

    // Update budgoose holder
    const updatedObjectHolder =
      await this.budgooseLoanHolderEntityRepository.update(
        {
          budgooseLoanHolderId: holderId,
        },
        {
          holderName: body.name,
          note: body.note ?? undefined,
        },
      );

    if (updatedObjectHolder.affected === 0) {
      throw new BadRequestException('Budgoose holder not found');
    }

    return (await this.budgooseLoanHolderEntityRepository.findOne({
      where: { budgooseLoanHolderId: holderId },
    }))!;
  }

  /**
   * Delete budgoose holder
   * @param { string } holderId - The id of the loan holder to delete.
   * @param { string } username - The username of the loan holder to find.
   *
   * @return {Promise<void>} - A promise that resolves when the loan holder is deleted.
   *
   * @throws {BadRequestException} - If the user does not exist or the loan holder already exists.
   */
  public async deleteHolder(holderId: string, username: string): Promise<void> {
    // Check username is existed
    const user = await this.userEntityRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new BadRequestException('User already exists');
    }

    // Check holderId is correct
    const holder = await this.budgooseLoanHolderEntityRepository.findOne({
      where: { budgooseLoanHolderId: holderId, username: username },
    });
    if (!holder) {
      throw new BadRequestException('Budgoose holder not found');
    }

    // Check if the loan holder has any management transactions
    const existManagement = await this.budgooseLoanTransEntityRepository.count({
      where: { budgooseLoanHolderEntity: holder },
    });

    if (existManagement > 0) {
      throw new BadRequestException(
        'Budgoose holder has management transactions, cannot delete',
      );
    }

    // Delete budgoose holder
    await this.budgooseLoanHolderEntityRepository.delete({
      budgooseLoanHolderId: holderId,
    });
  }
}
