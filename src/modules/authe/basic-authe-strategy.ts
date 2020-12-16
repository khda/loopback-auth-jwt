import { AuthenticationStrategy } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { HttpErrors, Request } from '@loopback/rest';
import { UserProfile, securityId } from '@loopback/security';

import { BasicAuthenticationBindings } from './keys';
import { IAuthUser, ICredentials, IUserService } from './types';

export const BASIC_AUTENTICATION_NAME = 'basic';

/**
 *
 */
export class BasicAuthenticationStrategy implements AuthenticationStrategy {
	public readonly name = BASIC_AUTENTICATION_NAME;

	/**
	 *
	 */
	constructor(
		@inject(BasicAuthenticationBindings.USER_SERVICE)
		private readonly userService: IUserService<IAuthUser>,
	) {}

	/**
	 *
	 */
	public async authenticate(request: Request): Promise<UserProfile> {
		const credentials = this.extractCredentials(request);
		const authUser = await this.userService.verify(credentials);

		return Object.assign(authUser, { [securityId]: String(authUser.id) });
	}

	/**
	 *
	 */
	private extractCredentials(request: Request): ICredentials {
		if (!request.headers.authorization) {
			throw new HttpErrors.Unauthorized(
				`Authorization header not found!`,
			);
		}

		// for example : Basic Z2l6bW9AZ21haWwuY29tOnBhc3N3b3Jk
		const authHeaderValue = request.headers.authorization;

		if (!authHeaderValue.startsWith('Basic')) {
			throw new HttpErrors.Unauthorized(
				`Authorization header is not of type 'Basic'.`,
			);
		}

		// split the string into 2 parts. We are interested in the base64 portion
		const parts = authHeaderValue.split(' ');
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (parts.length !== 2) {
			throw new HttpErrors.Unauthorized(
				`Authorization header value has too many parts. It must follow the pattern: 'Basic xxyyzz' where xxyyzz is a base64 string.`,
			);
		}

		const [, encryptedCredentails] = parts;

		// decrypt the credentials. Should look like :   'username:password'
		const decryptedCredentails = Buffer.from(
			encryptedCredentails,
			'base64',
		).toString('utf8');

		// split the string into 2 parts
		const decryptedParts = decryptedCredentails.split(':');

		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (decryptedParts.length !== 2) {
			throw new HttpErrors.Unauthorized(
				`Authorization header 'Basic' value does not contain two parts separated by ':'.`,
			);
		}

		return {
			username: decryptedParts[0],
			password: decryptedParts[1],
		};
	}
}
