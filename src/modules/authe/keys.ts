import { BindingKey } from '@loopback/core';

import { IAuthUser, IJwtService, IUserService } from './types';

export namespace BasicAuthenticationBindings {
	export const USER_SERVICE = BindingKey.create<IUserService<IAuthUser>>(
		'services.UserService',
	);
}

export namespace JwtAuthenticationBindings {
	export const JWT_SERVICE = BindingKey.create<IJwtService<IAuthUser>>(
		'services.JwtService',
	);
}
