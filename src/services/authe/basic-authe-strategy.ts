import { AuthenticationStrategy } from '@loopback/authentication';
import { service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors, Request } from '@loopback/rest';
import { UserProfile, securityId } from '@loopback/security';

import { UserRepository } from '../../repositories';

import { ICredentials } from './types';
import { UserService } from './user.service';

export const BASIC_AUTENTICATION_NAME = 'basic';

export class BasicAuthenticationStrategy implements AuthenticationStrategy {
	public readonly name = BASIC_AUTENTICATION_NAME;

	constructor(
		@repository(UserRepository)
		private readonly userRepository: UserRepository,
		@service(UserService)
		private readonly userService: UserService,
	) {}

	public async authenticate(request: Request): Promise<UserProfile> {
		const credentials = this.extractCredentials(request);
		const user = await this.userService.verifyCredentials(credentials);
		const authUser = await this.userService.formAuthUser(user);

		return Object.assign(authUser, { [securityId]: String(authUser.id) });
	}

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
