import { AuthenticationBindings, authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import {
	get,
	getModelSchemaRef,
	param,
	post,
	requestBody,
} from '@loopback/rest';

import { AuthUser, Jwt, LoginRequest, RevokedTokenData, User } from '../models';
import {
	BASIC_AUTENTICATION_NAME,
	JWT_AUTENTICATION_NAME,
} from '../modules/authe';
import { JwtService, UserService } from '../services';
import {
	BASIC_OPERATION_SECURITY_SPEC,
	BEARER_OPERATION_SECURITY_SPEC,
} from '../utils/security-spec';

export class AuthController {
	/**
	 *
	 */
	constructor(
		@service(JwtService)
		private readonly jwtService: JwtService,
		@service(UserService)
		private readonly userService: UserService,
	) {}

	@authenticate(BASIC_AUTENTICATION_NAME)
	@get('/jwt', {
		security: BASIC_OPERATION_SECURITY_SPEC,
		responses: {
			200: {
				content: {
					'application/json': { schema: { 'x-ts-type': Jwt } },
				},
			},
		},
	})
	async getJwt(
		@inject(AuthenticationBindings.CURRENT_USER)
		currentAuthUser: AuthUser,
	): Promise<Jwt> {
		return this.jwtService.generate(currentAuthUser);
	}

	/**
	 *
	 */
	@post('/login', {
		responses: {
			200: {
				content: {
					'application/json': { schema: { 'x-ts-type': Jwt } },
				},
			},
		},
	})
	async login(
		@requestBody({
			content: {
				'application/json': { schema: getModelSchemaRef(LoginRequest) },
			},
		})
		loginRequest: LoginRequest,
	): Promise<Jwt> {
		const user = await this.userService.verifyCredentials(loginRequest);
		const authUser = await this.userService.formAuthUser(user);

		return this.jwtService.generate(authUser);
	}

	/**
	 *
	 */
	@authenticate(JWT_AUTENTICATION_NAME)
	@get('/myself', {
		security: BEARER_OPERATION_SECURITY_SPEC,
		responses: {
			'200': {
				description: 'Return current user',
				content: {
					'application/json': { schema: { 'x-ts-type': User } },
				},
			},
		},
	})
	myself(
		@inject(AuthenticationBindings.CURRENT_USER)
		currentAuthUser: AuthUser,
	): AuthUser {
		return currentAuthUser;
	}

	/**
	 *
	 */
	@authenticate(BASIC_AUTENTICATION_NAME)
	@post('/logout', {
		security: BEARER_OPERATION_SECURITY_SPEC,
		responses: {
			200: {
				content: {
					'application/json': { schema: { type: 'boolean' } },
				},
			},
		},
	})
	public async logout(
		@param.header.string('authorization')
		authorization: string,
		@inject(AuthenticationBindings.CURRENT_USER)
		currentAuthUser: AuthUser,
	): Promise<boolean> {
		const accessToken = authorization.replace(/bearer /iu, '');

		await this.jwtService.revoke(
			accessToken,
			new RevokedTokenData({ userId: currentAuthUser.id }),
		);

		return true;
	}

	/**
	 *
	 */
	@get('/token-refresh', {
		responses: {
			200: {
				content: {
					'application/json': { schema: { 'x-ts-type': Jwt } },
				},
			},
		},
	})
	public async tokenRefresh(
		@param.query.string('refreshToken', { required: true })
		refreshToken: string,
	): Promise<Jwt> {
		return this.jwtService.refreshToken(refreshToken);
	}
}
