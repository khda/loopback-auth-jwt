import { IAuthUser } from '../modules/authe';

import { User } from './user.model';

export class AuthUser extends User implements IAuthUser {}
