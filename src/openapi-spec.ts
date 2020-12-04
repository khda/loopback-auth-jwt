import { ApplicationConfig } from '@loopback/core';

import { LoopbackMyJwtAutheApplication } from './application';

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<void> {
	const config: ApplicationConfig = {
		rest: {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			port: Number(process.env.PORT ?? 3000),
			host: process.env.HOST ?? 'localhost',
		},
	};
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const outFile = process.argv[2] ?? '';
	const app = new LoopbackMyJwtAutheApplication(config);
	await app.boot();
	await app.exportOpenApiSpec(outFile);
}

exportOpenApiSpec().catch((err) => {
	console.error('Fail to export OpenAPI spec from the application.', err);
	process.exit(1);
});
