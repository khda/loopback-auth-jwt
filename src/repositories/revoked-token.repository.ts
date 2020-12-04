import { inject } from '@loopback/core';
import { DefaultKeyValueRepository } from '@loopback/repository';

import { RedisDataSource } from '../datasources';
import { RevokedTokenData } from '../models';

export class RevokedTokenRepository extends DefaultKeyValueRepository<
	RevokedTokenData
> {
	constructor(
		@inject('datasources.redis') public dataSource: RedisDataSource,
	) {
		super(RevokedTokenData, dataSource);
	}
}
