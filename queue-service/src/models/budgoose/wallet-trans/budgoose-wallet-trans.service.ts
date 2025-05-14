import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BudgooseInfoEntity,
  BudgooseManagementEntity,
  BudgooseWalletEntity,
  BudgooseWalletTransEntity,
} from '../../../entity';
import { PagingType, UtilService } from '../../util/util.service';
import Decimal from 'decimal.js';

@Injectable()
export class BudgooseWalletTransService {
  /**
   * Constructor for BudgooseWalletTransService
   */
  constructor(
    @InjectRepository(BudgooseWalletTransEntity)
    private readonly budgooseWalletTransRepository: Repository<BudgooseWalletTransEntity>,
    @InjectRepository(BudgooseInfoEntity)
    private readonly budgooseInfoRepository: Repository<BudgooseInfoEntity>,
    @InjectRepository(BudgooseWalletEntity)
    private readonly budgooseWalletEntityRepository: Repository<BudgooseWalletEntity>,
    @InjectRepository(BudgooseManagementEntity)
    private readonly budgooseManagementEntityRepository: Repository<BudgooseManagementEntity>,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Get all Budgoose wallet transactions by wallet entity
   * @param { string } username - Budgoose wallet entity
   * @param { number } offset - Offset for pagination
   * @param { number } limit - Limit for pagination
   *
   * @returns { Promise<BudgooseWalletTransEntity[]> } - List of Budgoose wallet transactions
   */
  public async getList(
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseWalletTransEntity>[]> {
    const list = await this.budgooseWalletTransRepository.find({
      where: {
        budgooseWallet: {
          username: username,
        },
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        date: 'desc',
      },
    });

    return this.utilService.convertToPagination<BudgooseWalletTransEntity>(
      list,
      offset,
      limit,
    );
  }

  /**
   * Get all Budgoose wallet transactions by wallet entity
   * @param { string } budgooseWalletId - Budgoose wallet entity
   * @param { string } username - Budgoose wallet entity
   * @param { number } offset - Offset for pagination
   * @param { number } limit - Limit for pagination
   *
   * @returns { Promise<PagingType<BudgooseWalletTransEntity>[]> } - List of Budgoose wallet transactions
   */
  public async getListByWalletId(
    budgooseWalletId: string,
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseWalletTransEntity>[]> {
    const list = await this.budgooseWalletTransRepository.find({
      where: {
        budgooseWallet: {
          budgooseWalletId: budgooseWalletId,
          username: username,
        },
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        date: 'desc',
      },
    });

    return this.utilService.convertToPagination<BudgooseWalletTransEntity>(
      list,
      offset,
      limit,
    );
  }

  /**
   * Add new transaction
   * @param { string } username - Budgoose wallet entity
   * @param { BudgooseWalletEntity } walletEntity - Budgoose wallet entity
   * @param { BudgooseManagementEntity } budgooseManagementEntity - Budgoose wallet entity
   * @param { number } cashIn - Cash in amount
   * @param { number } cashOut - Cash out amount
   * @param { string | undefined } note - Note
   * @param { Date } date - Date
   *
   * @returns { Promise<void> } - List of Budgoose wallet transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async createNewTransaction(
    username: string,
    walletEntity: BudgooseWalletEntity,
    budgooseManagementEntity: BudgooseManagementEntity,
    cashIn: number,
    cashOut: number,
    note: string | undefined,
    date: Date,
  ): Promise<BudgooseWalletTransEntity> {
    // Get budgoose info
    const selectedBudgooseInfo = await this.budgooseInfoRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!selectedBudgooseInfo) {
      throw new BadRequestException('Budgoose info not found');
    }

    // Get the budgoose wallet entity
    const selectedWallet = await this.budgooseWalletEntityRepository.findOne({
      where: {
        budgooseWalletId: walletEntity.budgooseWalletId,
        username: username,
      },
    });
    if (!selectedWallet) {
      throw new BadRequestException('Budgoose wallet not found');
    }

    // Get budgoose management entity
    const selectedBudgooseManagement =
      await this.budgooseManagementEntityRepository.findOne({
        where: {
          budgooseManagementId: budgooseManagementEntity.budgooseManagementId,
          username: username,
        },
      });
    if (!selectedBudgooseManagement) {
      throw new BadRequestException('Budgoose management not found');
    }

    // Create new transaction
    const newTransaction = this.budgooseWalletTransRepository.save({
      cashIn: cashIn,
      cashOut: cashOut,
      note: note,
      date: date,
      budgooseWallet: selectedWallet,
      budgooseManagementEntity: selectedBudgooseManagement,
    });

    // Decimal js
    const cashInDecimal = new Decimal(cashIn);
    const cashOutDecimal = new Decimal(cashOut);

    // Update the cash balance of the wallet
    selectedWallet.cashBalance = new Decimal(selectedWallet.cashBalance)
      .plus(cashInDecimal)
      .sub(cashOutDecimal)
      .toNumber();

    // Update userEntity
    selectedBudgooseInfo.cashBalance = new Decimal(
      selectedBudgooseInfo.cashBalance,
    )
      .plus(cashInDecimal)
      .sub(cashOutDecimal)
      .toNumber();

    // Update the cash balance of the management
    await this.budgooseWalletEntityRepository.save(selectedWallet);

    await this.budgooseInfoRepository.save(selectedBudgooseInfo);

    return newTransaction;
  }

  /**
   * Delete transaction
   * @param { string } username - Username of the user
   * @param { string } budgooseManagementId - Budgoose management ID
   *
   * @returns { Promise<void> } - List of Budgoose wallet transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async deleteTransaction(
    username: string,
    budgooseManagementId: string,
  ): Promise<void> {
    // Get budgoose info
    const budgooseInfo = await this.budgooseInfoRepository.findOne({
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
        relations: ['budgooseWallet'],
      });
    if (!budgooseManagementEntity) {
      throw new BadRequestException('Budgoose management not found');
    }

    // Get all Budgoose loan transactions by management ID
    const selectedTransaction = await this.budgooseWalletTransRepository.find({
      where: {
        budgooseManagementEntity: {
          budgooseManagementId: budgooseManagementId,
        },
      },
      relations: ['budgooseWallet'],
    });

    for (const transaction of selectedTransaction) {
      // Get the Budgoose wallet entity
      const selectedWallet = await this.budgooseWalletEntityRepository.findOne({
        where: {
          username: username,
          budgooseWalletId: transaction.budgooseWallet.budgooseWalletId,
        },
      });
      if (!selectedWallet) {
        throw new BadRequestException('Budgoose loan holder not found');
      }

      // Decimal js
      const cashInDecimal = new Decimal(transaction.cashIn);
      const cashOutDecimal = new Decimal(transaction.cashOut);

      // Update holder
      selectedWallet.cashBalance = new Decimal(selectedWallet.cashBalance)
        .sub(cashInDecimal)
        .plus(cashOutDecimal)
        .toNumber();

      // Update info
      budgooseInfo.cashBalance = new Decimal(budgooseInfo.cashBalance)
        .sub(cashInDecimal)
        .plus(cashOutDecimal)
        .toNumber();

      // Save
      await this.budgooseWalletEntityRepository.save(selectedWallet);
      await this.budgooseInfoRepository.save(budgooseInfo);

      // Delete transaction
      await this.budgooseWalletTransRepository.delete(transaction);
    }
  }
}
