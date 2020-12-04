import { BindingKey } from '@loopback/core';

export namespace JwtAuthenticationBindings {
	export const ACCESS_TOKEN_SECRET = BindingKey.create<string>(
		'authentication.jwt.accessToken.secret',
	);
	export const ACCESS_TOKEN_EXPIRES_IN = BindingKey.create<string>(
		'authentication.jwt.accessToken.expiresIn',
	);
	export const ACCESS_TOKEN_ISSUER = BindingKey.create<string>(
		'authentication.jwt.accessToken.issuer',
	);

	export const REFRESH_TOKEN_EXPIRES_IN = BindingKey.create<string>(
		'authentication.jwt.refreshToken.expiresIn',
	);
	export const REFRESH_TOKEN_SIZE = BindingKey.create<number>(
		'authentication.jwt.refreshToken.size',
	);
}
