import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BudgooseManagementEntity,
  BudgooseManagementLoanEntity,
  BudgooseWalletEntity,
  UserEntity,
} from '../../../entity';
import { Repository } from 'typeorm';
import { PagingType, UtilService } from '../../util/util.service';
import { CreateBudgooseManagementDto } from './budgoose-management.zod';
import { BudgooseLoanTransService } from '../loan-trans/budgoose-loan-trans.service';
import { BudgooseWalletTransService } from '../wallet-trans/budgoose-wallet-trans.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class BudgooseManagementService {
  constructor(
    @InjectRepository(BudgooseManagementEntity)
    private readonly budgooseManagementRepository: Repository<BudgooseManagementEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    @InjectRepository(BudgooseWalletEntity)
    private readonly budgooseWalletEntityRepository: Repository<BudgooseWalletEntity>,
    @InjectRepository(BudgooseManagementLoanEntity)
    private readonly budgooseManagementLoanRepository: Repository<BudgooseManagementLoanEntity>,
    private readonly budgooseLoanHolderService: BudgooseLoanTransService,
    private readonly budgooseWalletTransService: BudgooseWalletTransService,
    private readonly utilService: UtilService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Get all Budgoose management transactions by username
   * @param { string } username - Budgoose management entity
   * @param { number } offset - Offset for pagination
   * @param { number } limit - Limit for pagination
   *
   * @returns { Promise<PagingType<BudgooseManagementEntity>[]> } - List of Budgoose management transactions
   */
  public async getList(
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseManagementEntity>[]> {
    const list = await this.budgooseManagementRepository.find({
      where: {
        username: username,
      },
      relations: {
        budgooseWallet: true,
        budgooseWalletTarget: true,
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        date: 'desc',
      },
    });

    return this.utilService.convertToPagination<BudgooseManagementEntity>(
      list,
      offset,
      limit,
    );
  }

  /**
   * Get Budgoose management transaction by ID
   * @param { string } username - Budgoose management entity
   * @param { string } managementId - Budgoose management entity
   *
   * @returns { Promise<BudgooseManagementEntity> } - List of Budgoose management transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async getManagementById(
    username: string,
    managementId: string,
  ): Promise<BudgooseManagementEntity> {
    // Check if managementId is valid
    if (!managementId) {
      throw new BadRequestException('Invalid managementId');
    }

    // Get Budgoose management transaction by ID
    const budgooseManagement = await this.budgooseManagementRepository.findOne({
      where: {
        username: username,
        budgooseManagementId: managementId,
      },
      relations: {
        budgooseWallet: true,
        budgooseWalletTarget: true,
      },
    });

    if (!budgooseManagement) {
      throw new BadRequestException('Budgoose management not found');
    }

    return budgooseManagement;
  }

  /**
   * Create new Budgoose management
   * @param { string } username - Budgoose management entity
   * @param { CreateBudgooseManagementDto } body - Budgoose management entity
   *
   * @returns { Promise<BudgooseManagementEntity> } - List of Budgoose management transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async createNewManagement(
    username: string,
    body: CreateBudgooseManagementDto,
  ): Promise<BudgooseManagementEntity> {
    // Get userEntity
    const userEntity = await this.userEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!userEntity) {
      throw new BadRequestException('User not found');
    }

    // Check Wallet ID owner
    const selectedWallet = await this.budgooseWalletEntityRepository.findOne({
      where: {
        budgooseWalletId: body.budgooseWalletId,
        username: username,
      },
    });

    if (!selectedWallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (body.businessType === 'transfer' && !body.budgooseWalletTargetId) {
      throw new BadRequestException('Wallet target is required for transfer');
    }

    let selectedWalletTarget: BudgooseWalletEntity | null = null;
    if (body.budgooseWalletTargetId) {
      // Check Wallet ID target
      selectedWalletTarget = await this.budgooseWalletEntityRepository.findOne({
        where: {
          budgooseWalletId: body.budgooseWalletTargetId,
          username: username,
        },
      });

      if (!selectedWalletTarget) {
        throw new BadRequestException('Wallet target not found');
      }
    }

    // Create new Budgoose management
    const newObjBudgooseManagement = {
      username: username,
      userEntity: userEntity,
      businessType: body.businessType,
      budgooseWallet: selectedWallet,
      budgooseWalletTarget: selectedWalletTarget,
      cash: body.cash,
      description: body.description,
      date: new Date(body.date),
    } as BudgooseManagementEntity;

    const budgooseManagement = await this.budgooseManagementRepository.save(
      newObjBudgooseManagement,
    );

    // Create Budgoose management loan
    if (body.listItemLoan != null && body.listItemLoan?.length !== 0) {
      for (const itemManagementItem of body.listItemLoan) {
        const temp = {
          cash: itemManagementItem.cash,
          description: itemManagementItem.note,
          budgooseManagement: budgooseManagement,
        } as BudgooseManagementLoanEntity;

        await this.budgooseManagementLoanRepository.save(temp);
      }
    }

    // Check business type
    switch (body.businessType) {
      case 'cash_in':
        {
          let totalCashLoanIn = 0;

          // Update list holder loan
          if (body.listItemLoan != null && body.listItemLoan?.length !== 0) {
            for (const item of body.listItemLoan) {
              await this.budgooseLoanHolderService.addTransaction(
                username,
                item.holderId,
                budgooseManagement.budgooseManagementId,
                0,
                item.cash,
                item.note ?? '',
                new Date(body.date),
              );

              // Update total cash loan
              totalCashLoanIn += item.cash;
            }
          } else {
            // Update total cash loan
            totalCashLoanIn = body.cash;
          }

          // Update balance wallet selected
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            budgooseManagement,
            totalCashLoanIn,
            0,
            body.description ?? '',
            new Date(body.date),
          );
        }
        break;
      case 'cash_out':
        {
          // Update list holder loan
          if (body.listItemLoan != null && body.listItemLoan?.length !== 0) {
            for (const item of body.listItemLoan) {
              await this.budgooseLoanHolderService.addTransaction(
                username,
                item.holderId,
                budgooseManagement.budgooseManagementId,
                item.cash,
                0,
                item.note ?? '',
                new Date(body.date),
              );
            }
          }

          // Update balance wallet selected
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            budgooseManagement,
            0,
            body.cash,
            body.description ?? '',
            new Date(body.date),
          );
        }
        break;
      case 'transfer':
        {
          // Create transfer transaction
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            budgooseManagement,
            0,
            body.cash,
            body.description ?? '',
            new Date(body.date),
          );

          // Update balance wallet target
          if (selectedWalletTarget) {
            await this.budgooseWalletTransService.createNewTransaction(
              username,
              selectedWalletTarget,
              budgooseManagement,
              body.cash,
              0,
              body.description ?? '',
              new Date(body.date),
            );
          }
        }
        break;
    }

    // Return Budgoose management transaction
    return budgooseManagement;
  }

  /**
   * Update Budgoose management transaction
   * @param { string } username - Budgoose management entity
   * @param { string } managementId - Budgoose management entity
   * @param { CreateBudgooseManagementDto } body - Budgoose management entity
   *
   * @returns { Promise<void> } - List of Budgoose management transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async updateManagement(
    username: string,
    managementId: string,
    body: CreateBudgooseManagementDto,
  ): Promise<BudgooseManagementEntity> {
    // Get userEntity
    const userEntity = await this.userEntityRepository.findOne({
      where: {
        username: username,
      },
    });
    if (!userEntity) {
      throw new BadRequestException('User not found');
    }

    // Get management by ID
    const selectedManagement = await this.budgooseManagementRepository.findOne({
      where: {
        username: username,
        budgooseManagementId: managementId,
      },
    });
    if (!selectedManagement) {
      throw new BadRequestException('Budgoose management not found');
    }

    // Get wallet
    const selectedWallet = await this.budgooseWalletEntityRepository.findOne({
      where: {
        budgooseWalletId: body.budgooseWalletId,
        username: username,
      },
    });
    if (!selectedWallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Get wallet target
    let selectedWalletTarget: BudgooseWalletEntity | null = null;
    if (body.budgooseWalletTargetId) {
      selectedWalletTarget = await this.budgooseWalletEntityRepository.findOne({
        where: {
          budgooseWalletId: body.budgooseWalletTargetId,
          username: username,
        },
      });
      if (!selectedWalletTarget) {
        throw new BadRequestException('Wallet target not found');
      }
    }

    // Get list of Budgoose management loan transactions
    const listBudgooseManagementLoan =
      await this.budgooseManagementLoanRepository.find({
        where: {
          budgooseManagement: selectedManagement,
        },
      });

    // Delete Budgoose management loan details
    for (const item of listBudgooseManagementLoan) {
      await this.budgooseManagementLoanRepository.delete(item);
    }

    // Delete budgoose wallet transaction
    await this.budgooseWalletTransService.deleteTransaction(
      username,
      managementId,
    );

    // Delete budgoose loan transaction
    await this.budgooseLoanHolderService.deleteTransaction(
      username,
      managementId,
    );

    // Create new Budgoose management
    const updateBudgoose = {
      budgooseManagementId: managementId,
      username: username,
      userEntity: userEntity,
      businessType: body.businessType,
      budgooseWallet: selectedWallet,
      budgooseWalletTarget: selectedWalletTarget,
      cash: body.cash,
      description: body.description,
      date: new Date(body.date),
    } as BudgooseManagementEntity;

    const updatedManagement =
      await this.budgooseManagementRepository.save(updateBudgoose);

    // Check business type
    switch (body.businessType) {
      case 'cash_in':
        {
          let totalCashLoanIn = 0;

          // Update list holder loan
          if (body.listItemLoan != null && body.listItemLoan?.length !== 0) {
            for (const item of body.listItemLoan) {
              await this.budgooseLoanHolderService.addTransaction(
                username,
                item.holderId,
                updatedManagement.budgooseManagementId,
                0,
                item.cash,
                item.note ?? '',
                new Date(body.date),
              );

              // Update total cash loan
              totalCashLoanIn += item.cash;
            }
          } else {
            // Update total cash loan
            totalCashLoanIn = body.cash;
          }

          // Update balance wallet selected
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            updatedManagement,
            totalCashLoanIn,
            0,
            body.description ?? '',
            new Date(body.date),
          );
        }
        break;
      case 'cash_out':
        {
          // Update list holder loan
          if (body.listItemLoan != null && body.listItemLoan?.length !== 0) {
            for (const item of body.listItemLoan) {
              await this.budgooseLoanHolderService.addTransaction(
                username,
                item.holderId,
                updatedManagement.budgooseManagementId,
                item.cash,
                0,
                item.note ?? '',
                new Date(body.date),
              );
            }
          }

          // Update balance wallet selected
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            updatedManagement,
            0,
            body.cash,
            body.description ?? '',
            new Date(body.date),
          );
        }
        break;
      case 'transfer':
        {
          // Create transfer transaction
          await this.budgooseWalletTransService.createNewTransaction(
            username,
            selectedWallet,
            updatedManagement,
            0,
            body.cash,
            body.description ?? '',
            new Date(body.date),
          );

          // Update balance wallet target
          if (selectedWalletTarget) {
            await this.budgooseWalletTransService.createNewTransaction(
              username,
              selectedWalletTarget,
              updatedManagement,
              body.cash,
              0,
              body.description ?? '',
              new Date(body.date),
            );
          }
        }
        break;
    }

    // Return Budgoose management transaction
    return updatedManagement;
  }

  /**
   * Delete Budgoose management transaction
   * @param { string } username - Budgoose management entity
   * @param { string } managementId - Budgoose management entity
   *
   * @returns { Promise<void> } - List of Budgoose management transactions
   *
   * @throws { BadRequestException } - If any error occurs
   */
  public async deleteManagement(
    username: string,
    managementId: string,
  ): Promise<void> {
    // Get Budgoose management transaction by ID
    const selectedManagement = await this.budgooseManagementRepository.findOne({
      where: {
        username: username,
        budgooseManagementId: managementId,
      },
    });
    if (!selectedManagement) {
      throw new BadRequestException('Budgoose management not found');
    }

    // Get list of Budgoose management loan transactions
    const listBudgooseManagementLoan =
      await this.budgooseManagementLoanRepository.find({
        where: {
          budgooseManagement: selectedManagement,
        },
      });

    // Delete Budgoose management loan details
    for (const item of listBudgooseManagementLoan) {
      await this.budgooseManagementLoanRepository.delete(item);
    }

    // Delete budgoose wallet transaction
    await this.budgooseWalletTransService.deleteTransaction(
      username,
      managementId,
    );

    // Delete budgoose loan transaction
    await this.budgooseLoanHolderService.deleteTransaction(
      username,
      managementId,
    );

    // Delete Budgoose management transaction
    await this.budgooseManagementRepository.delete(selectedManagement);
  }
}
