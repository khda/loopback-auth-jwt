import { inject } from '@loopback/core';
import { DefaultKeyValueRepository } from '@loopback/repository';

import { RedisDataSource } from '../datasources';
import { RefreshTokenData } from '../models';

export class RefreshTokenRepository extends DefaultKeyValueRepository<RefreshTokenData> {
	constructor(
		@inject('datasources.redis') public dataSource: RedisDataSource,
	) {
		super(RefreshTokenData, dataSource);
	}
}
