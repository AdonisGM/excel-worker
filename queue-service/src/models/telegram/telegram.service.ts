import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BudgooseLoanTransEntity,
  TelegramTemplateEntity,
  UserEntity,
} from '../../entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { UtilService } from '../util/util.service';

@Injectable()
export class TelegramService {
  private urlBot: string;

  constructor(
    @InjectRepository(TelegramTemplateEntity)
    private readonly telegramRepository: Repository<TelegramTemplateEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly loggerService: LoggerService,
    private readonly utilService: UtilService,
  ) {
    this.urlBot = `${process.env.TL_BOT_URL}/bot${process.env.TL_BOT_TOKEN}`;
  }

  /**
   * Send message create new budgoose loan transaction
   * @param {string} username - The username of the user
   * @param {BudgooseLoanTransEntity} budgooseLoanTrans - The budgoose loan transaction entity
   *
   * @returns {Promise<void>} - A promise that resolves when the message is sent
   */
  public async sendMessageCreateBudgooseLoanTrans(
    username: string,
    budgooseLoanTrans: BudgooseLoanTransEntity,
  ): Promise<void> {
    try {
      // Get userEntity from database
      const userEntity = await this.userEntityRepository.findOne({
        where: { username },
      });
      if (!userEntity) {
        this.loggerService.error(`User ${username} not found`);
        return;
      }

      // Get template from database
      const template = await this.getTemplate('budgoose-loan-create');

      // Replace template variables with actual values - self message
      const message = template
        .replace(
          /{{fullname}}/g,
          budgooseLoanTrans.budgooseLoanHolderEntity.holderName,
        )
        .replace(
          /{{cash}}/g,
          budgooseLoanTrans.cashIn === 0
            ? '📉 '
            : '📈 ' +
                this.utilService.convertToStringCash(
                  budgooseLoanTrans.cashIn === 0
                    ? budgooseLoanTrans.cashOut
                    : budgooseLoanTrans.cashIn,
                ),
        )
        .replace(
          /{{date}}/g,
          this.utilService.convertDateToString(
            budgooseLoanTrans.date,
            'YYYY-MM-dd',
          ),
        )
        .replace(/{{description}}/g, budgooseLoanTrans.note || '')
        .replace(
          /{{loanBalance}}/g,
          this.utilService.convertToStringCash(
            budgooseLoanTrans.budgooseLoanHolderEntity.cashLoan,
          ) || '',
        );

      // Send message to telegram
      // Get template from database
      const templateTarget = await this.getTemplate('budgoose-loan-create');

      // Replace template variables with actual values - self message
      const messageTarget = templateTarget
        .replace(/{{fullname}}/g, userEntity.fullname)
        .replace(
          /{{cash}}/g,
          budgooseLoanTrans.cashIn === 0
            ? '📈 '
            : '📉 ' +
                this.utilService.convertToStringCash(
                  budgooseLoanTrans.cashIn === 0
                    ? budgooseLoanTrans.cashOut
                    : budgooseLoanTrans.cashIn,
                ),
        )
        .replace(
          /{{date}}/g,
          this.utilService.convertDateToString(
            budgooseLoanTrans.date,
            'YYYY-MM-dd',
          ),
        )
        .replace(/{{description}}/g, budgooseLoanTrans.note || '')
        .replace(
          /{{loanBalance}}/g,
          this.utilService.convertToStringCash(
            budgooseLoanTrans.budgooseLoanHolderEntity.cashLoan,
          ) || '',
        );

      await this.sendMessageToTelegram(userEntity.telegramId, message);
      await this.sendMessageToTelegram(
        budgooseLoanTrans.budgooseLoanHolderEntity.telegramId,
        messageTarget,
      );
    } catch (error) {
      console.error(error);
      this.loggerService.error(error);
    }
  }

  /**
   * Get template from database
   * @param {string} code - The code of the template
   *
   * @returns {Promise<string>} - A promise that resolves to the template string
   *
   * @throws {Error} - If the template is not found
   */
  private async getTemplate(code: string): Promise<string> {
    const template = await this.telegramRepository.findOne({
      where: { code },
    });

    if (!template) {
      throw new Error(`Template ${code} not found`);
    }

    return template.template;
  }

  /**
   * Send message to telegram
   * @param {string} chatId - The chat ID of the user
   * @param {string} message - The message to send
   *
   * @returns {Promise<void>} - A promise that resolves when the message is sent
   */
  private async sendMessageToTelegram(
    chatId: string,
    message: string,
  ): Promise<void> {
    try {
      const url = `${this.urlBot}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'MarkdownV2',
        }),
      });
      if (!response.ok) {
        this.loggerService.error(
          `Error sending message to Telegram: ${response.statusText}`,
        );
      }
    } catch (error) {
      this.loggerService.error(`Error sending message to Telegram: ${error}`);
    }
  }
}
