import { BindingScope, ContextTags, bind } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';

import { AuthUser, User } from '../models';
import {
	BasicAuthenticationBindings,
	ICredentials,
	IUserService,
} from '../modules/authe';
import { UserRepository } from '../repositories';

/**
 *
 */
@bind({
	scope: BindingScope.SINGLETON,
	tags: { [ContextTags.KEY]: BasicAuthenticationBindings.USER_SERVICE },
})
export class UserService implements IUserService<AuthUser> {
	/**
	 *
	 */
	constructor(
		@repository(UserRepository)
		private readonly userRepository: UserRepository,
	) {}

	/**
	 *
	 */
	public async verify(credentials: ICredentials): Promise<AuthUser> {
		const { username, password } = credentials;

		const user = await this.userRepository.findOne({ where: { username } });

		if (!user || user.isArchived || !user.password) {
			throw new HttpErrors.Unauthorized('User not found!');
		} else if (!(password === user.password)) {
			throw new HttpErrors.Unauthorized('Invalid Credentials!');
		}

		return this.formAuthUser(user);
	}

	/**
	 *
	 */
	public async formAuthUser(user: User): Promise<AuthUser> {
		return Promise.resolve(new AuthUser(user));
	}

	/**
	 *
	 */
	public async findById(id: typeof User.prototype.id): Promise<User> {
		return this.userRepository.findById(id);
	}
}
