export interface ICredentials {
	username: string;
	password: string;
}

export interface IAuthUser {
	id: unknown;
}

export interface IJwtService<AuthUser> {
	verify: (accessToken: string) => Promise<AuthUser>;
}

export interface IUserService<AuthUser> {
	verify: (credentials: ICredentials) => Promise<AuthUser>;
}
