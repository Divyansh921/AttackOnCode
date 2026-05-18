import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const GithubStrategy_base: new (...args: any[]) => Strategy;
export declare class GithubStrategy extends GithubStrategy_base {
    private config;
    private authService;
    constructor(config: ConfigService, authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any) => void): Promise<void>;
}
export {};
