export interface ICredentials {
	username: string;
	password: string;
}

export interface IUser {
	id: unknown;
}

export interface IAuthUser extends IUser {}

export interface IJwtService<AuthUser> {
	verify: (accessToken: string) => Promise<AuthUser>;
}

export interface IUserService<User, AuthUser> {
	verifyCredentials: (credentials: ICredentials) => Promise<User>;
	formAuthUser: (user: User) => Promise<AuthUser>;
}
