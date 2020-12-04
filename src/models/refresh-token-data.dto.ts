import { Model, model, property } from '@loopback/repository';

@model({ name: 'refresh_token_data' })
export class RefreshTokenData extends Model {
	@property({ type: 'number', required: true, name: 'user_id' })
	userId: number;

	@property({ type: 'string', required: true, name: 'access_token' })
	accessToken: string;

	constructor(data?: Partial<RefreshTokenData>) {
		super(data);
	}
}
