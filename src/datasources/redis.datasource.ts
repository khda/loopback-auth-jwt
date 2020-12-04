import {
	LifeCycleObserver,
	ValueOrPromise,
	inject,
	lifeCycleObserver,
} from '@loopback/core';
import { juggler } from '@loopback/repository';

export interface RedisConfig {
	name: string;
	connector: string;
	url?: string;
	host?: string;
	port?: string;
	password?: string;
	db?: string;
}

@lifeCycleObserver('datasource')
export class RedisDataSource
	extends juggler.DataSource
	implements LifeCycleObserver {
	public static readonly dataSourceName = 'redis';

	constructor(
		@inject('datasources.config.redis', { optional: true })
		dsConfig: RedisConfig = {
			name: 'redis',
			connector: 'kv-redis',
			url: process.env.REDIS_URL,
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			password: process.env.REDIS_PASSWORD,
			db: process.env.REDIS_DATABASE,
		},
	) {
		super(dsConfig);
	}

	/**
	 * Start the datasource when application is started
	 */
	public start(): ValueOrPromise<void> {
		// Add your logic here to be invoked when the application is started
	}

	/**
	 * Disconnect the datasource when application is stopped. This allows the
	 * application to be shut down gracefully.
	 */
	public stop(): ValueOrPromise<void> {
		return super.disconnect();
	}
}
