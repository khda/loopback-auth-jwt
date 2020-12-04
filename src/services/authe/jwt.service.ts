import * as crypto from 'crypto';

import { BindingScope, bind, inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import * as jwt from 'jsonwebtoken';

import { AuthUser, Jwt, RevokedTokenData } from '../../models';
import {
	RefreshTokenRepository,
	RevokedTokenRepository,
	UserRepository,
} from '../../repositories';

import { JwtAuthenticationBindings } from './keys';
import { UserService } from './user.service';

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = 86400;
const DEFAULT_ACCESS_TOKEN_SECRET = 'secret';
const DEFAULT_ACCESS_TOKEN_ISSUER = 'loopback4';
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN = 604800;
const DEFAULT_REFRESH_TOKEN_SIZE = 32;

const MILLISECOND = 1000;

@bind({ scope: BindingScope.SINGLETON, tags: ['service'] })
export class JwtService {
	constructor(
		@repository(UserRepository)
		private readonly userRepository: UserRepository,
		@repository(RefreshTokenRepository)
		private readonly refreshTokenRepository: RefreshTokenRepository,
		@repository(RevokedTokenRepository)
		private readonly revokedTokenRepository: RevokedTokenRepository,

		@service(UserService)
		private readonly userService: UserService,

		@inject(JwtAuthenticationBindings.ACCESS_TOKEN_SECRET)
		private readonly accessTokenSecret: string = DEFAULT_ACCESS_TOKEN_SECRET,
		@inject(JwtAuthenticationBindings.ACCESS_TOKEN_EXPIRES_IN)
		private readonly accessTokenExpiresIn: number = DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
		@inject(JwtAuthenticationBindings.ACCESS_TOKEN_ISSUER)
		private readonly accessTokenIssuer: string = DEFAULT_ACCESS_TOKEN_ISSUER,
		@inject(JwtAuthenticationBindings.REFRESH_TOKEN_EXPIRES_IN)
		private readonly refreshTokenExpiresIn: number = DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
		@inject(JwtAuthenticationBindings.REFRESH_TOKEN_SIZE)
		private readonly refreshTokenSize: number = DEFAULT_REFRESH_TOKEN_SIZE,
	) {}

	async verify(accessToken: string): Promise<AuthUser> {
		const revokedToken = await this.revokedTokenRepository.get(accessToken);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (revokedToken) {
			throw new HttpErrors.Unauthorized('Token is revoked!');
		}

		return new AuthUser(
			jwt.verify(accessToken, this.accessTokenSecret) as object,
		);
	}

	async generate(authUser: AuthUser): Promise<Jwt> {
		try {
			if (authUser.isArchived) {
				throw new HttpErrors.Unauthorized('User does not exist!');
			}

			const accessToken = jwt.sign(
				authUser.toJSON(),
				this.accessTokenSecret,
				{
					expiresIn: this.accessTokenExpiresIn,
					issuer: this.accessTokenIssuer,
				},
			);

			const refreshToken = crypto
				.randomBytes(this.refreshTokenSize)
				.toString('hex');

			await this.refreshTokenRepository.set(
				refreshToken,
				{ userId: authUser.id, accessToken },
				{ ttl: this.refreshTokenExpiresIn * MILLISECOND },
			);

			return new Jwt({ accessToken, refreshToken });
		} catch (error) {
			throw error instanceof HttpErrors.HttpError
				? error
				: new HttpErrors.Unauthorized('Invalid Credentials!');
		}
	}

	async revoke(
		accessToken: string,
		revokedTokenData: RevokedTokenData,
	): Promise<void> {
		await this.revokedTokenRepository.set(accessToken, revokedTokenData, {
			ttl: this.accessTokenExpiresIn * MILLISECOND,
		});
	}

	async refreshToken(refreshToken: string) {
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
