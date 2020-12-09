import { Entity, model, property } from '@loopback/repository';

import { IUser } from '../modules/authe';

@model()
export class User extends Entity implements IUser {
	@property({
		type: 'number',
		required: false,
		id: true,
		generated: true,
		name: 'id',
	})
	id: number;

	@property({
		type: 'string',
		required: true,
		name: 'username',
	})
	username: string;

	@property({
		type: 'string',
		required: true,
		name: 'password',
	})
	password: string;

	@property({
		type: 'boolean',
		required: false,
		name: 'is_archived',
	})
	isArchived: boolean;

	@property({
		type: 'string',
		required: true,
		name: 'description',
	})
	description: string;

	constructor(data?: Partial<User>) {
		super(data);
	}
}

export interface UserRelations {}

export type UserWithRelations = User & UserRelations;
