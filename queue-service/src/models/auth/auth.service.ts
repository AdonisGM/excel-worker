import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BcryptPassword, BodyJWT, BodyJWTRefresh } from './auth.type';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions } from 'express';

/**
 * AuthService class
 * Handles authentication-related operations.
 */
@Injectable()
export class AuthService {
  private BCRYPT_ROUNDS: number;
  private SECRET_KEY_TOKEN: string;
  private SECRET_KEY_RF_TOKEN: string;
  private TOKEN_EXPIRE: string;
  private RF_TOKEN_EXPIRE: string;

  /**
   * Constructor for AuthService
   */
  constructor(private readonly jwtService: JwtService) {
    this.init();
  }

  /**
   * Init function load configurations from environment variables.
   */
  private init() {
    const scryptRounds = process.env.BCRYPT_ROUNDS;
    if (!scryptRounds) {
      throw new Error('BCRYPT_ROUNDS is not defined');
    }

    const scryptRoundsNumber = parseInt(scryptRounds, 10);
    if (isNaN(scryptRoundsNumber)) {
      throw new Error('BCRYPT_ROUNDS must be a number');
    }

    const jwtSecretKeyToken = process.env.SECRET_KEY_TOKEN;
    if (!jwtSecretKeyToken) {
      throw new Error('SECRET_KEY_TOKEN is not defined');
    }

    const jwtSecretKeyRfToken = process.env.SECRET_KEY_RF_TOKEN;
    if (!jwtSecretKeyRfToken) {
      throw new Error('SECRET_KEY_RF_TOKEN is not defined');
    }

    const tokenExpire = process.env.TOKEN_EXPIRE;
    if (!tokenExpire) {
      throw new Error('TOKEN_EXPIRE is not defined');
    }

    const rfTokenExpire = process.env.RF_TOKEN_EXPIRE;
    if (!rfTokenExpire) {
      throw new Error('RF_TOKEN_EXPIRE is not defined');
    }

    this.SECRET_KEY_TOKEN = jwtSecretKeyToken;
    this.SECRET_KEY_RF_TOKEN = jwtSecretKeyRfToken;
    this.TOKEN_EXPIRE = tokenExpire;
    this.RF_TOKEN_EXPIRE = rfTokenExpire;
    this.BCRYPT_ROUNDS = scryptRoundsNumber;
  }

  /**
   * Checks if the provided password is valid for the given user.
   *
   * @param {string} plainTextPassword - The plain text password to validate.
   * @param {string} encryptedPassword - The hashed password stored in the database.
   *
   * @returns {Promise<boolean>} - A promise that resolves to true if the password is valid, false otherwise.
   */
  public async isValidPassword(
    plainTextPassword: string,
    encryptedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, encryptedPassword);
  }

  /**
   * Generates a hashed password using bcrypt.
   *
   * @param password - The plain text password to hash.
   *
   * @returns Promise<BcryptPassword> - An object containing the hashed password and the salt used.
   */
  public async generatePassword(password: string): Promise<BcryptPassword> {
    const salt = await bcrypt.genSalt(this.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    return {
      password: hashedPassword,
      salt: salt,
    };
  }

  /**
   * Generates a JWT token for the user.
   *
   * @param {BodyJWT} body - The body containing user information.
   *
   * @returns Promise<string> - The generated JWT token.
   */
  public async generateJwtToken(body: BodyJWT) {
    return this.jwtService.signAsync(
      {
        rfi: body.rfi,
        jti: body.jti,
        username: body.username,
        name: body.name,
        zoneInfo: body.zoneInfo,
        ipAddress: body.ipAddress,
        ipAddressV6: body.ipAddressV6,
        device: body.device,
      },
      {
        secret: this.SECRET_KEY_TOKEN,
        expiresIn: this.TOKEN_EXPIRE,
      },
    );
  }

  /**
   * Generates a refresh token for the user.
   *
   * @param {BodyJWTRefresh} body - The body containing user information.
   *
   * @returns Promise<string> - The generated refresh token.
   */
  public async generateRefreshToken(body: BodyJWTRefresh) {
    return this.jwtService.signAsync(
      {
        jti: body.jti,
        username: body.username,
        name: body.name,
        zoneInfo: body.zoneInfo,
        ipAddress: body.ipAddress,
        ipAddressV6: body.ipAddressV6,
        device: body.device,
      },
      {
        secret: this.SECRET_KEY_RF_TOKEN,
        expiresIn: this.RF_TOKEN_EXPIRE,
      },
    );
  }

  /**
   * Validates a JWT token.
   *
   * @param {string} token - The JWT token to validate.
   *
   * @returns Promise<BodyJWT> - The decoded token if valid, null otherwise.
   *
   * @throws {Error} - Throws an error if the token is invalid or expired.
   */
  public async validateToken(token: string): Promise<BodyJWT | null> {
    return await this.jwtService.verifyAsync<BodyJWT>(token, {
      secret: this.SECRET_KEY_TOKEN,
    });
  }

  /**
   * Validates a refresh token.
   *
   * @param {string} token - The refresh token to validate.
   *
   * @returns Promise<BodyJWTRefresh> - The decoded token if valid, null otherwise.
   *
   * @throws {Error} - Throws an error if the token is invalid or expired.
   */
  public async validateRefreshToken(
    token: string,
  ): Promise<BodyJWTRefresh | null> {
    return await this.jwtService.verifyAsync<BodyJWTRefresh>(token, {
      secret: this.SECRET_KEY_RF_TOKEN,
    });
  }

  /**
   * Get options cookie for JWT token.
   *
   * @returns {CookieOptions} - The options for the cookie.
   */
  public getOptionsCookie(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.TOP_DOMAIN_FE
          : 'localhost',
      expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    };
  }

  /**
   * Get options cookie for refresh token.
   *
   * @returns {CookieOptions} - The options for the cookie.
   */
  public getOptionsCookieRefresh(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.TOP_DOMAIN_FE
          : 'localhost',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    };
  }

  /**
   * Get options cookie for public JWT token.
   *
   * @returns {CookieOptions} - The options for the cookie.
   */
  public getOptionsCookiePublic(): CookieOptions {
    return {
      httpOnly: false,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.TOP_DOMAIN_FE
          : 'localhost',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    };
  }
}
