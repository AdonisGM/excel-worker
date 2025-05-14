import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BudgooseWalletEntity, UserEntity } from '../../../entity';
import { Not, Repository } from 'typeorm';
import { PagingType, UtilService } from '../../util/util.service';
import { CreateBudgooseWalletDto } from './budgoose-wallet.zod';

@Injectable()
export class BudgooseWalletService {
  /**
   * Constructor for BudgooseWalletService
   */
  constructor(
    @InjectRepository(BudgooseWalletEntity)
    private readonly budgooseWalletRepository: Repository<BudgooseWalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Get all Budgoose wallets of a user
   * @param { string } username - The username of the user
   * @param {number} offset - The offset for pagination.
   * @param {number} limit - The limit for pagination.
   *
   * @returns { Promise<PagingType<BudgooseWalletEntity>[]> } - The Budgoose wallets of the user
   */
  public async getWallets(
    username: string,
    offset: number,
    limit: number,
  ): Promise<PagingType<BudgooseWalletEntity>[]> {
    const listWallet = await this.budgooseWalletRepository.find({
      where: { username },
      skip: (offset - 1) * limit,
      take: limit,
    });

    return this.utilService.convertToPagination<BudgooseWalletEntity>(
      listWallet,
      offset,
      limit,
    );
  }

  /**
   * Get detail wallet by id
   * @param { string } username - The username of the user
   * @param { string } walletId - The id of the wallet
   *
   * @returns { Promise<BudgooseWalletEntity> } - The Budgoose wallet
   *
   * @throws { BadRequestException } - If the walletId is not valid
   */
  public async getWalletById(
    username: string,
    walletId: string,
  ): Promise<BudgooseWalletEntity> {
    // Check walletId is valid
    const selectedWallet = await this.budgooseWalletRepository.findOne({
      where: { budgooseWalletId: walletId, username: username },
    });
    if (!selectedWallet) {
      throw new BadRequestException('Wallet not found');
    }

    return selectedWallet;
  }

  /**
   * Create a new Budgoose wallet
   * @param { string } username - The username of the user
   * @param { CreateBudgooseWalletDto } body - The body of the request
   *
   * @returns { Promise<BudgooseWalletEntity> } - The Budgoose wallet
   *
   * @throws { BadRequestException } - If the user is not found or the wallet name already exists
   */
  public async createNewWallet(
    username: string,
    body: CreateBudgooseWalletDto,
  ): Promise<BudgooseWalletEntity> {
    // Get userEntity
    const userEntity = await this.userEntityRepository.findOne({
      where: { username: username },
    });
    if (!userEntity) {
      throw new BadRequestException('User not found');
    }

    // Check name wallet is existed
    const wallet = await this.budgooseWalletRepository.findOne({
      where: { name: body.name, username: username },
    });
    if (wallet) {
      throw new BadRequestException('Wallet name already exists');
    }

    // Create new object wallet
    const newWallet = {
      username: username,
      cashBalance: 0,
      userEntity: userEntity,
      name: body.name,
      description: body.description,
    } as BudgooseWalletEntity;

    // Save new wallet
    return await this.budgooseWalletRepository.save(newWallet);
  }

  /**
   * Update a Budgoose wallet
   * @param { string } username - The username of the user
   * @param { string } walletId - The id of the wallet
   * @param { CreateBudgooseWalletDto } body - The body of the request
   *
   * @returns { Promise<BudgooseWalletEntity> } - The Budgoose wallet
   *
   * @throws { BadRequestException } - If the walletId is not valid
   */
  public async updateWallet(
    username: string,
    walletId: string,
    body: CreateBudgooseWalletDto,
  ): Promise<BudgooseWalletEntity> {
    // Check walletId is valid
    const selectedWallet = await this.budgooseWalletRepository.findOne({
      where: { budgooseWalletId: walletId, username: username },
    });
    if (!selectedWallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Check name wallet is existed
    const wallet = await this.budgooseWalletRepository.findOne({
      where: {
        name: body.name,
        username: username,
        budgooseWalletId: Not(walletId),
      },
    });
    if (wallet) {
      throw new BadRequestException('Wallet name already exists');
    }

    // Update wallet
    await this.budgooseWalletRepository.update(
      {
        budgooseWalletId: walletId,
      },
      {
        name: body.name,
        description: body.description ?? undefined,
      },
    );

    // Get updated wallet
    return (await this.budgooseWalletRepository.findOne({
      where: { budgooseWalletId: walletId, username: username },
    }))!;
  }

  /**
   * Delete a Budgoose wallet
   * @param { string } username - The username of the user
   * @param { string } walletId - The id of the wallet
   *
   * @returns { Promise<BudgooseWalletEntity> } - The Budgoose wallet
   *
   * @throws { BadRequestException } - If the walletId is not valid
   */
  public async deleteWallet(username: string, walletId: string): Promise<void> {
    // Check walletId is valid
    const selectedWallet = await this.budgooseWalletRepository.findOne({
      where: { budgooseWalletId: walletId, username: username },
    });
    if (!selectedWallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Delete wallet
    await this.budgooseWalletRepository.delete({
      budgooseWalletId: walletId,
      username: username,
    });
  }
}
