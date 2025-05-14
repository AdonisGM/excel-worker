import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseLoanHolderEntity,
  BudgooseLoanTransEntity,
  BudgooseManagementEntity,
} from '../../../entity';
import { Repository } from 'typeorm';
import { PagingType, UtilService } from '../../util/util.service';
import Decimal from 'decimal.js';

@Injectable()
export class BudgooseLoanTransService {
  /**
   * Constructor for BudgooseLoanTransService
   */
  constructor(
    @InjectRepository(BudgooseInfoEntity)
    private readonly budgooseInfoEntityRepository: Repository<BudgooseInfoEntity>,
    @InjectRepository(BudgooseLoanTransEntity)
    private readonly budgooseLoanTransRepository: Repository<BudgooseLoanTransEntity>,
    @InjectRepository(BudgooseLoanHolderEntity)
    private readonly budgooseLoanHolderEntityRepository: Repository<BudgooseLoanHolderEntity>,
    @InjectRepository(BudgooseManagementEntity)
    private readonly budgooseManagementEntityRepository: Repository<BudgooseManagementEntity>,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Get all Budgoose loan transactions by username
   * @param { string } username - Budgoose loan entity
   * @param { number } offset - Offset for pagination
   * @param { number } limit - Limit for pagination
   *
   * @returns { Promise<BudgooseLoanTransEntity[]> } - List of Budgoose loan transactions
   */
  public async getList(
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseLoanTransEntity>[]> {
    const list = await this.budgooseLoanTransRepository.find({
      where: {
        budgooseLoanHolderEntity: {
          username: username,
        },
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        date: 'desc',
      },
    });

    return this.utilService.convertToPagination<BudgooseLoanTransEntity>(
      list,
      offset,
      limit,
    );
  }

  /**
   * Get all Budgoose loan transactions by loan entity
   * @param { string } budgooseLoanHolderId - Budgoose loan entity
   * @param { string } username - Budgoose loan entity
   * @param { number } offset - Offset for pagination
   * @param { number } limit - Limit for pagination
   *
   * @returns { Promise<BudgooseLoanTransEntity[]> } - List of Budgoose loan transactions
   */
  public async getListByLoanHolder(
    budgooseLoanHolderId: string,
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseLoanTransEntity>[]> {
    const list = await this.budgooseLoanTransRepository.find({
      where: {
        budgooseLoanHolderEntity: {
          username: username,
          budgooseLoanHolderId: budgooseLoanHolderId,
        },
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        date: 'desc',
      },
    });

    return this.utilService.convertToPagination<BudgooseLoanTransEntity>(
      list,
      offset,
      limit,
    );
  }

  /**
   * Add new transaction
   * @param { string } username - Budgoose loan entity
   * @param { string } budgooseLoanHolderId - Budgoose loan entity
   * @param { string } budgooseManagementId - Budgoose management entity
   * @param { number } cashIn - Cash in amount
   * @param { number } cashOut - Cash out amount
   * @param { string | undefined } note - Note for the transaction
   * @param { Date } date - Date of the transaction
   *
   * @returns { Promise<BudgooseLoanTransEntity> } - Created Budgoose loan transaction
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async addTransaction(
    username: string,
    budgooseLoanHolderId: string,
    budgooseManagementId: string,
    cashIn: number,
    cashOut: number,
    note: string | undefined,
    date: Date,
  ): Promise<BudgooseLoanTransEntity> {
    // Get budgoose info
    const budgooseInfo = await this.budgooseInfoEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!budgooseInfo) {
      throw new BadRequestException('Budgoose info not found');
    }

    // Get the Budgoose loan holder entity
    const budgooseLoanHolderEntity =
      await this.budgooseLoanHolderEntityRepository.findOne({
        where: {
          username: username,
          budgooseLoanHolderId: budgooseLoanHolderId,
        },
      });
    if (!budgooseLoanHolderEntity) {
      throw new BadRequestException('Budgoose loan holder not found');
    }

    // Get the Budgoose management entity
    const budgooseManagementEntity =
      await this.budgooseManagementEntityRepository.findOne({
        where: {
          budgooseManagementId: budgooseManagementId,
          username: username,
        },
      });
    if (!budgooseManagementEntity) {
      throw new BadRequestException('Budgoose management not found');
    }

    const newTransaction = this.budgooseLoanTransRepository.save({
      budgooseLoanHolderEntity: budgooseLoanHolderEntity,
      budgooseManagementEntity: budgooseManagementEntity,
      cashIn: cashIn,
      cashOut: cashOut,
      note: note,
      date: date,
    });

    // Decimal js
    const cashInDecimal = new Decimal(cashIn);
    const cashOutDecimal = new Decimal(cashOut);

    // Update holder
    budgooseLoanHolderEntity.cashLoan = new Decimal(
      budgooseLoanHolderEntity.cashLoan,
    )
      .plus(cashInDecimal)
      .sub(cashOutDecimal)
      .toNumber();

    // Update info
    budgooseInfo.cashLoan = new Decimal(budgooseInfo.cashLoan)
      .plus(cashInDecimal)
      .sub(cashOutDecimal)
      .toNumber();

    // Save
    await this.budgooseLoanHolderEntityRepository.save(
      budgooseLoanHolderEntity,
    );
    await this.budgooseInfoEntityRepository.save(budgooseInfo);

    return newTransaction;
  }

  /**
   * Delete transaction by management ID
   * @param { string } username - Budgoose loan entity
   * @param { string } budgooseManagementId - Budgoose management entity
   *
   * @returns { Promise<void> } - Deleted Budgoose loan transaction
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async deleteTransaction(
    username: string,
    budgooseManagementId: string,
  ): Promise<void> {
    // Get budgoose info
    const budgooseInfo = await this.budgooseInfoEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!budgooseInfo) {
      throw new BadRequestException('Budgoose info not found');
    }

    // Get the Budgoose management entity
    const budgooseManagementEntity =
      await this.budgooseManagementEntityRepository.findOne({
        where: {
          username: username,
          budgooseManagementId: budgooseManagementId,
        },
      });
    if (!budgooseManagementEntity) {
      throw new BadRequestException('Budgoose management not found');
    }

    // Get all Budgoose loan transactions by management ID
    const listTransaction = await this.budgooseLoanTransRepository.find({
      where: {
        budgooseManagementEntity: {
          username: username,
          budgooseManagementId: budgooseManagementId,
        },
      },
      relations: ['budgooseLoanHolderEntity'],
    });

    for (const transaction of listTransaction) {
      // Get holder
      const selectedHolder =
        await this.budgooseLoanHolderEntityRepository.findOne({
          where: {
            username: username,
            budgooseLoanHolderId:
              transaction.budgooseLoanHolderEntity.budgooseLoanHolderId,
          },
        });
      if (!selectedHolder) {
        throw new BadRequestException('Budgoose loan holder not found');
      }

      // Decimal js
      const cashInDecimal = new Decimal(transaction.cashIn);
      const cashOutDecimal = new Decimal(transaction.cashOut);

      // Update holder
      selectedHolder.cashLoan = new Decimal(selectedHolder.cashLoan)
        .sub(cashInDecimal)
        .plus(cashOutDecimal)
        .toNumber();

      // Update info
      budgooseInfo.cashLoan = new Decimal(budgooseInfo.cashLoan)
        .sub(cashInDecimal)
        .plus(cashOutDecimal)
        .toNumber();

      // Save
      await this.budgooseLoanHolderEntityRepository.save(selectedHolder);
      await this.budgooseInfoEntityRepository.save(budgooseInfo);

      // Delete transaction
      await this.budgooseLoanTransRepository.delete(transaction);
    }
  }
}
