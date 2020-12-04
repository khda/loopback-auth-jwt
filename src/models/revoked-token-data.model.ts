import { Model, model, property } from '@loopback/repository';

@model({ name: 'revoked_token_data' })
export class RevokedTokenData extends Model {
	@property({ type: 'number', required: true, name: 'user_id' })
	userId: number;

	constructor(data?: Partial<RevokedTokenData>) {
		super(data);
	}
}
