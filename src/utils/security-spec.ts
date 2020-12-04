import { ReferenceObject, SecuritySchemeObject } from '@loopback/openapi-v3';

export const BEARER_OPERATION_SECURITY_SPEC = [{ bearer: [] }];
export const BASIC_OPERATION_SECURITY_SPEC = [{ basic: [] }];

export type SecuritySchemeObjects = Record<
	string,
	SecuritySchemeObject | ReferenceObject
>;

export const SECURITY_SCHEME_SPEC: SecuritySchemeObjects = {
	bearer: {
		name: 'jwt',
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
	},
	basic: {
		name: 'basic',
		type: 'http',
		scheme: 'basic',
	},
};
