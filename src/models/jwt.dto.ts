import { Model, model, property } from '@loopback/repository';

@model()
export class Jwt extends Model {
	@property({ type: 'string', required: true })
	accessToken: string;

	@property({ type: 'string', required: true })
	refreshToken: string;

	constructor(data?: Partial<Jwt>) {
		super(data);
	}
}
