/* eslint-disable @typescript-eslint/no-magic-numbers */
import * as dotenv from 'dotenv';

import {
	ILoopbackMyJwtAutheApplicationConfig,
	LoopbackMyJwtAutheApplication,
} from './application';

export * from './application';

export async function main(options: ILoopbackMyJwtAutheApplicationConfig = {}) {
	const app = new LoopbackMyJwtAutheApplication(options);
	await app.boot();
	await app.start();

	const { url } = app.restServer;
	console.log(`Server is running at ${url}`);
	console.log(`Try ${url}/ping`);

	return app;
}

if (require.main === module) {
	dotenv.config();

	const config = {
		rest: {
			port: Number(process.env.PORT ?? 3000),
			host: process.env.HOST,
			// The `gracePeriodForClose` provides a graceful close for http/https
			// servers with keep-alive clients. The default value is `Infinity`
			// (don't force-close). If you want to immediately destroy all sockets
			// upon stop, set its value to `0`.
			// See https://www.npmjs.com/package/stoppable
			gracePeriodForClose: 5000,
			openApiSpec: {
				// useful when used with OpenAPI-to-GraphQL to locate your application
				setServersFromRequest: true,
			},
		},
		jwt: {
			accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? 'secret',
			accessTokenExpiresIn: Number(
				process.env.ACCESS_TOKEN_EXPIRES_IN ?? 86400,
			),
			accessTokenIssuer: process.env.ACCESS_TOKEN_ISSUER ?? 'loopback4',
			refreshTokenExpiresIn: Number(
				process.env.REFRESH_TOKEN_EXPIRES_IN ?? 604800,
			),
			refreshTokenSize: Number(process.env.REFRESH_TOKEN_SIZE ?? 32),
		},
	};
	main(config).catch((err) => {
		console.error('Cannot start the application.', err);
		process.exit(1);
	});
}
