import * as crypto from 'crypto';

import {
	BindingScope,
	ContextTags,
	bind,
	config,
	service,
} from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import * as jwt from 'jsonwebtoken';

import { AuthUser, Jwt, RevokedTokenData } from '../models';
import { IJwtService, JwtAuthenticationBindings } from '../modules/authe';
import {
	RefreshTokenRepository,
	RevokedTokenRepository,
} from '../repositories';

import { UserService } from './user.service';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = 86400;
const DEFAULT_ACCESS_TOKEN_SECRET = 'secret';
const DEFAULT_ACCESS_TOKEN_ISSUER = 'loopback4';
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = 604800;
const DEFAULT_REFRESH_TOKEN_SIZE = 32;

const SECOND = 1000;

/**
 *
 */
export interface IJwtServiceOptions {
	accessTokenExpiresIn?: number;
	accessTokenSecret?: string;
	accessTokenIssuer?: string;
	refreshTokenExpiresIn?: number;
	refreshTokenSize?: number;
}

/**
 *
 */
@bind({
	scope: BindingScope.SINGLETON,
	tags: { [ContextTags.KEY]: JwtAuthenticationBindings.JWT_SERVICE },
})
export class JwtService implements IJwtService<AuthUser> {
	private readonly config: Required<IJwtServiceOptions>;

	/**
	 *
	 */
	constructor(
		@repository(RefreshTokenRepository)
		private readonly refreshTokenRepository: RefreshTokenRepository,
		@repository(RevokedTokenRepository)
		private readonly revokedTokenRepository: RevokedTokenRepository,
		@service(UserService)
		private readonly userService: UserService,
		@config()
		private readonly options?: IJwtServiceOptions,
	) {
		this.config = {
			accessTokenExpiresIn: DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
			accessTokenSecret: DEFAULT_ACCESS_TOKEN_SECRET,
			accessTokenIssuer: DEFAULT_ACCESS_TOKEN_ISSUER,
			refreshTokenExpiresIn: DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
			refreshTokenSize: DEFAULT_REFRESH_TOKEN_SIZE,
			...this.options,
		};
	}

	public async isRevoked(accessToken: string): Promise<boolean> {
		const revokedToken = await this.revokedTokenRepository.get(accessToken);

		return Boolean(revokedToken);
	}

	/**
	 *
	 */
	public verify(accessToken: string): AuthUser {
		return new AuthUser(
			jwt.verify(accessToken, this.config.accessTokenSecret) as object,
		);
	}

	/**
	 *
	 */
	public async generate(authUser: AuthUser): Promise<Jwt> {
		try {
			if (authUser.isArchived) {
				throw new HttpErrors.Unauthorized('User does not exist!');
			}

			const accessToken = jwt.sign(
				authUser.toJSON(),
				this.config.accessTokenSecret,
				{
					expiresIn: this.config.accessTokenExpiresIn,
					issuer: this.config.accessTokenIssuer,
				},
			);

			const refreshToken = crypto
				.randomBytes(this.config.refreshTokenSize)
				.toString('hex');

			await this.refreshTokenRepository.set(
				refreshToken,
				{ userId: authUser.id, accessToken },
				{ ttl: this.config.refreshTokenExpiresIn * SECOND },
			);

			return new Jwt({ accessToken, refreshToken });
		} catch (error) {
			throw error instanceof HttpErrors.HttpError
				? error
				: new HttpErrors.Unauthorized('Invalid Credentials!');
		}
	}

	/**
	 *
	 */
	public async revoke(
		accessToken: string,
		revokedTokenData: RevokedTokenData,
	): Promise<void> {
		await this.revokedTokenRepository.set(accessToken, revokedTokenData, {
			ttl: this.config.accessTokenExpiresIn * SECOND,
		});
	}

	/**
	 *
	 */
	public async refreshToken(refreshToken: string): Promise<Jwt> {
		const refreshTokenData = await this.refreshTokenRepository.get(
			refreshToken,
		);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!refreshTokenData) {
			throw new HttpErrors.Unauthorized('Token Expired!');
		}

		const user = await this.userService.findById(refreshTokenData.userId);
		const authUser = await this.userService.formAuthUser(user);

		return this.generate(authUser);
	}
}
