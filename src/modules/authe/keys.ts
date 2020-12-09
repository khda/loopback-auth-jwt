import { BindingKey } from '@loopback/core';

import { IAuthUser, IJwtService, IUser, IUserService } from './types';

export namespace BasicAuthenticationBindings {
	export const USER_SERVICE = BindingKey.create<
		IUserService<IUser, IAuthUser>
	>('services.UserService');
}

export namespace JwtAuthenticationBindings {
	export const JWT_SERVICE = BindingKey.create<IJwtService<IAuthUser>>(
		'services.JwtService',
	);
}
