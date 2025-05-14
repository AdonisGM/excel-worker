import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { SignInDto, signInSchema, SignUpDto, signUpSchema } from './auth.zod';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import {
  UserEntity,
  UserLoginLoggerEntity,
  UserRefreshTokenEntity,
} from '../../entity';
import { BodyJWT, BodyJWTRefresh } from './auth.type';
import { UtilService } from '../util/util.service';
import { UserRefreshTokenService } from '../user-refresh-token/user-refresh-token.service';
import { UserLoginLoggerService } from '../user-login-logger/user-login-logger.sevice';
import { LoggerService } from '../logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly utilService: UtilService,
    private readonly userRefreshToken: UserRefreshTokenService,
    private readonly userLoginLogger: UserLoginLoggerService,
    private readonly logger: LoggerService,
  ) {}

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Ip() ip: string,
    @Body(new ZodValidationPipe(signInSchema)) body: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get user agent from request
    const userAgent = req.headers['user-agent'];

    // Get system user
    const userSystem = await this.getUserSystem();

    // Find user by username
    const user = await this.userService.findByUsername(body.username);
    if (!user) {
      this.logger.warn(`Login failed: ${body.username}`);
      throw new BadRequestException('User not found');
    }

    // Check password
    const isPasswordValid = await this.authService.isValidPassword(
      body.password,
      user.password,
    );

    // Save logger login to database
    const newUserLoginLogger = new UserLoginLoggerEntity();
    newUserLoginLogger.username = user.username;
    newUserLoginLogger.userEntity = user;
    newUserLoginLogger.ipAddressV6 = ip;
    newUserLoginLogger.createdBy = userSystem;
    newUserLoginLogger.isCorrectPassword = isPasswordValid ? 1 : 0;
    if (userAgent) {
      newUserLoginLogger.device = userAgent;
    }

    await this.userLoginLogger.save(newUserLoginLogger);

    if (!isPasswordValid) {
      this.logger.warn(`Login with incorrect password: ${body.username}`);
      throw new BadRequestException('Username or password is incorrect');
    }

    // Create JWT tokens
    const bodyJWTRefresh: BodyJWTRefresh = {
      jti: this.utilService.generateUUIDv7(),
      username: user.username,
      name: user.fullname,
      ipAddressV6: ip,
      device: userAgent,
    };

    const bodyJWT: BodyJWT = {
      rfi: bodyJWTRefresh.jti,
      jti: this.utilService.generateUUIDv7(),
      username: bodyJWTRefresh.username,
      name: bodyJWTRefresh.name,
      ipAddressV6: bodyJWTRefresh.ipAddressV6,
      device: userAgent,
    };

    const refreshToken =
      await this.authService.generateRefreshToken(bodyJWTRefresh);
    const accessToken = await this.authService.generateJwtToken(bodyJWT);

    // Save refresh token to database
    const newUserRefreshToken = new UserRefreshTokenEntity();
    newUserRefreshToken.userEntity = user;
    newUserRefreshToken.username = user.username;
    newUserRefreshToken.refreshToken = refreshToken;
    newUserRefreshToken.expireDate =
      this.authService.getOptionsCookieRefresh().expires!;
    newUserRefreshToken.ipAddressV6 = ip;
    newUserRefreshToken.createdBy = userSystem;
    if (userAgent) {
      newUserRefreshToken.device = userAgent;
    }

    await this.userRefreshToken.save(newUserRefreshToken);

    res.cookie('rt', refreshToken, this.authService.getOptionsCookieRefresh());
    res.cookie('at', accessToken, this.authService.getOptionsCookie());
    res.cookie('ui', user.userId, this.authService.getOptionsCookiePublic());
    res.cookie('un', user.username, this.authService.getOptionsCookiePublic());
    res.cookie('nm', user.fullname, this.authService.getOptionsCookiePublic());

    this.logger.log(`Login successfully: ${user.username} - ${ip}`);

    return bodyJWT;
  }

  @Post('sign-up')
  @HttpCode(200)
  async signUp(@Body(new ZodValidationPipe(signUpSchema)) body: SignUpDto) {
    // Find user by username
    const user = await this.userService.findByUsernameAndEmail(
      body.username,
      body.email,
    );
    if (user) {
      throw new BadRequestException('Exist username or email');
    }

    // Get system user
    const userSystem = await this.getUserSystem();

    // Hash password
    const hashedPassword = await this.authService.generatePassword(
      body.password,
    );

    // Create new user
    const newUser = new UserEntity();
    newUser.username = body.username;
    newUser.email = body.email;
    newUser.fullname = body.name;
    newUser.password = hashedPassword.password;
    newUser.passwordSalt = hashedPassword.salt;
    newUser.status = 'active';
    newUser.createdBy = userSystem;

    // Save user to database
    await this.userService.save(newUser);

    this.logger.log(`Sign up successfully: ${newUser.username}`);

    // return success response
    return {
      userId: newUser.userId,
    };
  }

  @Post('refresh-token')
  @HttpCode(200)
  public async refreshToken(
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = <string | undefined>req.cookies['rt'];
    if (!refreshToken) {
      this.logger.warn(`Refresh token not found`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Verify refresh token
    const decoded = await this.authService.validateRefreshToken(refreshToken);
    if (!decoded) {
      this.logger.warn(`Invalid refresh token`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Validate Ip address - allow only same ip address
    if (decoded.ipAddressV6 !== ip) {
      this.logger.warn(
        `IP address from refresh token does not match: requested ${ip}, token ${decoded.ipAddressV6}`,
      );
      throw new UnauthorizedException('Unauthorized');
    }

    // Check refresh token in database
    const isExist = await this.userRefreshToken.exists(refreshToken);
    if (!isExist) {
      this.logger.warn(`Refresh token not found in database`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Delete old refresh token
    await this.userRefreshToken.delete(refreshToken);

    // Delete expired refresh tokens
    await this.userRefreshToken.deleteExpired(decoded.username);

    // Create new refresh token
    const bodyJWTRefresh: BodyJWTRefresh = {
      jti: this.utilService.generateUUIDv7(),
      username: decoded.username,
      name: decoded.name,
      ipAddressV6: ip,
      device: decoded.device,
    };
    const bodyJWT: BodyJWT = {
      rfi: bodyJWTRefresh.jti,
      jti: this.utilService.generateUUIDv7(),
      username: bodyJWTRefresh.username,
      name: bodyJWTRefresh.name,
      ipAddressV6: bodyJWTRefresh.ipAddressV6,
      device: decoded.device,
    };
    const newRefreshToken =
      await this.authService.generateRefreshToken(bodyJWTRefresh);
    const newAccessToken = await this.authService.generateJwtToken(bodyJWT);

    // Save new refresh token to database
    const user = await this.userService.findByUsername(decoded.username);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userSystem = await this.getUserSystem();

    const newUserRefreshToken = new UserRefreshTokenEntity();
    newUserRefreshToken.userEntity = user;
    newUserRefreshToken.username = user.username;
    newUserRefreshToken.refreshToken = newRefreshToken;
    newUserRefreshToken.expireDate =
      this.authService.getOptionsCookieRefresh().expires!;
    newUserRefreshToken.ipAddressV6 = ip;
    newUserRefreshToken.createdBy = userSystem;
    if (decoded.device) {
      newUserRefreshToken.device = decoded.device;
    }

    await this.userRefreshToken.save(newUserRefreshToken);

    // Set new cookies
    res.cookie(
      'rt',
      newRefreshToken,
      this.authService.getOptionsCookieRefresh(),
    );
    res.cookie('at', newAccessToken, this.authService.getOptionsCookie());
    res.cookie('ui', user.userId, this.authService.getOptionsCookiePublic());
    res.cookie('un', user.username, this.authService.getOptionsCookiePublic());
    res.cookie('nm', user.fullname, this.authService.getOptionsCookiePublic());

    this.logger.log(`Refresh token successfully: ${user.username} - ${ip}`);

    return bodyJWT;
  }

  @Post('sign-out')
  @HttpCode(200)
  public async signOut(
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = <string | undefined>req.cookies['rt'];
    if (!refreshToken) {
      this.logger.warn(`Refresh token not found`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Verify refresh token
    const decoded = await this.authService.validateRefreshToken(refreshToken);
    if (!decoded) {
      this.logger.warn(`Invalid refresh token`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Validate Ip address - allow only same ip address
    if (decoded.ipAddressV6 !== ip) {
      this.logger.warn(
        `IP address from refresh token does not match: requested ${ip}, token ${decoded.ipAddressV6}`,
      );
      throw new UnauthorizedException('Unauthorized');
    }

    // Check refresh token in database
    const isExist = await this.userRefreshToken.exists(refreshToken);
    if (!isExist) {
      this.logger.warn(`Refresh token not found in database`);
      throw new UnauthorizedException('Unauthorized');
    }

    // Delete refresh token from database
    await this.userRefreshToken.delete(refreshToken);

    // Clear cookies
    res.clearCookie('rt');
    res.clearCookie('at');
    res.clearCookie('ui');
    res.clearCookie('un');
    res.clearCookie('nm');

    this.logger.log(`Sign out successfully: ${decoded.username} - ${ip}`);

    return { message: 'Sign out successfully' };
  }

  private async getUserSystem(): Promise<UserEntity> {
    const user = await this.userService.getUserSystem();
    if (!user) {
      throw new Error('User system not found');
    }
    return user;
  }
}
