import { AuthenticationStrategy } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { HttpErrors, Request } from '@loopback/rest';
import { UserProfile, securityId } from '@loopback/security';

import { JwtAuthenticationBindings } from './keys';
import { IAuthUser, IJwtService } from './types';

export const JWT_AUTENTICATION_NAME = 'jwt';

/**
 *
 */
export class JwtAuthenticationStrategy implements AuthenticationStrategy {
	public readonly name = JWT_AUTENTICATION_NAME;

	/**
	 *
	 */
	constructor(
		@inject(JwtAuthenticationBindings.JWT_SERVICE)
		private readonly jwtService: IJwtService<IAuthUser>,
	) {}

	/**
	 *
	 */
	public async authenticate(request: Request): Promise<UserProfile> {
		const accessToken = this.extractAccessToken(request);
		const isRevoked = await this.jwtService.isRevoked!(accessToken);

		if (isRevoked) {
			throw new HttpErrors.Unauthorized('Token is revoked!');
		}

		const authUser = await this.jwtService.verify(accessToken);

		return Object.assign(authUser, { [securityId]: String(authUser.id) });
	}

	/**
	 *
	 */
	private extractAccessToken(request: Request): string {
		if (!request.headers.authorization) {
			throw new HttpErrors.Unauthorized(
				'Authorization header not found!',
			);
		}

		// for example : Bearer xxx.yyy.zzz
		const authHeaderValue = request.headers.authorization;

		if (!authHeaderValue.startsWith('Bearer')) {
			throw new HttpErrors.Unauthorized(
				`Authorization header is not of type 'Bearer'.`,
			);
		}

		// split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
		const parts = authHeaderValue.split(' ');
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (parts.length !== 2) {
			throw new HttpErrors.Unauthorized(
				`Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
			);
		}
		const [, accessToken] = parts;

		return accessToken;
	}
}
