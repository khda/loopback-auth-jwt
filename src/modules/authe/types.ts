export interface ICredentials {
	username: string;
	password: string;
}

export interface IAuthUser {
	id: unknown;
}

export interface IJwtService<AuthUser> {
	isRevoked?: (accessToken: string) => Promise<boolean>;
	verify: (accessToken: string) => AuthUser | Promise<AuthUser>;
}

export interface IUserService<AuthUser> {
	verify: (credentials: ICredentials) => AuthUser | Promise<AuthUser>;
}
