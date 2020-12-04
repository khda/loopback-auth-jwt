import { Model, model, property } from '@loopback/repository';

@model()
export class LoginRequest extends Model {
	@property({ type: 'string', required: true })
	username: string;

	@property({ type: 'string', required: true })
	password: string;

	constructor(data?: Partial<LoginRequest>) {
		super(data);
	}
}
