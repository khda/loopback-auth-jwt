import {
	Client,
	createRestAppClient,
	givenHttpServerConfig,
} from '@loopback/testlab';

import { LoopbackMyJwtAutheApplication } from '../..';

export async function setupApplication(): Promise<AppWithClient> {
	const restConfig = givenHttpServerConfig({
		// Customize the server configuration here.
		// Empty values (undefined, '') will be ignored by the helper.
		//
		// host: process.env.HOST,
		// port: +process.env.PORT,
	});

	const app = new LoopbackMyJwtAutheApplication({
		rest: restConfig,
	});

	await app.boot();
	await app.start();

	const client = createRestAppClient(app);

	return { app, client };
}

export interface AppWithClient {
	app: LoopbackMyJwtAutheApplication;
	client: Client;
}
