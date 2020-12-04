import path from 'path';

import {
	AuthenticationComponent,
	registerAuthenticationStrategy,
} from '@loopback/authentication';
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import {
	RestExplorerBindings,
	RestExplorerComponent,
} from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';

import { MySequence } from './sequence';
import {
	BasicAuthenticationStrategy,
	JwtAuthenticationBindings,
	JwtAuthenticationStrategy,
} from './services';
import { SECURITY_SCHEME_SPEC } from './utils/security-spec';

export { ApplicationConfig };

export class LoopbackMyJwtAutheApplication extends BootMixin(
	ServiceMixin(RepositoryMixin(RestApplication)),
) {
	constructor(options: ApplicationConfig = {}) {
		super(options);

		// Set up the custom sequence
		this.sequence(MySequence);

		// Set up default home page
		this.static('/', path.join(__dirname, '../public'));

		// Customize @loopback/rest-explorer configuration here
		this.configure(RestExplorerBindings.COMPONENT).to({
			path: '/explorer',
		});
		this.component(RestExplorerComponent);

		// Authentication
		this.component(AuthenticationComponent);
		// Basic authentication
		registerAuthenticationStrategy(this, BasicAuthenticationStrategy);
		// Jwt authentication
		this.bind(JwtAuthenticationBindings.ACCESS_TOKEN_SECRET).to(
			options.authentication.accessTokenSecret,
		);
		this.bind(JwtAuthenticationBindings.ACCESS_TOKEN_EXPIRES_IN).to(
			options.authentication.accessTokenExpiresIn,
		);
		this.bind(JwtAuthenticationBindings.ACCESS_TOKEN_ISSUER).to(
			options.authentication.accessTokenIssuer,
		);
		this.bind(JwtAuthenticationBindings.REFRESH_TOKEN_EXPIRES_IN).to(
			options.authentication.refreshTokenExpiresIn,
		);
		this.bind(JwtAuthenticationBindings.REFRESH_TOKEN_SIZE).to(
			options.authentication.refreshTokenSize,
		);
		registerAuthenticationStrategy(this, JwtAuthenticationStrategy);

		this.projectRoot = __dirname;
		// Customize @loopback/boot Booter Conventions here
		this.bootOptions = {
			controllers: {
				// Customize ControllerBooter Conventions here
				dirs: ['controllers'],
				extensions: ['.controller.js'],
				nested: true,
			},
		};

		this.api({
			openapi: '3.0.0',
			info: { title: '-', version: '0.1.0' },
			paths: {},
			components: { securitySchemes: SECURITY_SCHEME_SPEC },
			servers: [{ url: '/' }],
		});

		this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({
			debug: Boolean(process.env.DEBUG),
			safeFields: ['name', 'message', 'code', 'meta'],
		});
	}
}
