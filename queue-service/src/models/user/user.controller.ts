import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthDecorator } from '../../decorator/auth.decorator';
import { BodyJWT } from '../auth/auth.type';
import { UserService } from './user.service';
import { LoggerService } from '../logger/logger.service';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { UpdateUserDto, updateUserSchema } from './user.zod';
import { UtilService } from '../util/util.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
    private readonly utilService: UtilService,
  ) {}

  @Get('info')
  @UseGuards(AuthGuard)
  async getUser(@AuthDecorator() jwtData: BodyJWT) {
    // Get information about the user
    const username = jwtData.username;
    const user = await this.userService.findByUsername(username);

    // Check if user exists
    if (!user) {
      this.logger.warn(`Search not found user: ${username}`);
      throw new Error('User not found');
    }

    return {
      userId: user.userId,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      mobile: user.mobile,
      birthday: user.birthday,
      status: user.status,
      subscriptionType: user.subscriptionType,
      createdTime: user.createdTime,
    };
  }

  @Put('update')
  @UseGuards(AuthGuard)
  async updateUser(
    @AuthDecorator() jwtData: BodyJWT,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserDto,
  ) {
    // Get information about the user
    const username = jwtData.username;
    const user = await this.userService.findByUsername(username);

    // Check if user exists
    if (!user) {
      this.logger.warn(`Search not found user: ${username}`);
      throw new Error('User not found');
    }

    // Update user information
    user.fullname = body.name;
    user.email = body.email;
    if (body.birthdate) {
      user.birthday = this.utilService.convertStringToDate(body.birthdate);
    }

    // Save updated user information
    await this.userService.save(user);

    this.logger.log(`User updated successfully: ${username}`);

    return {
      userId: user.userId,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      mobile: user.mobile,
      birthday: this.utilService.convertDateToString(
        user.birthday,
        'YYYY-MM-dd',
      ),
      status: user.status,
      subscriptionType: user.subscriptionType,
      createdTime: user.createdTime,
    };
  }
}
