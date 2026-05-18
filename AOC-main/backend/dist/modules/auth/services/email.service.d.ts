import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private config;
    private resend;
    private readonly logger;
    private readonly from;
    private readonly frontendUrl;
    constructor(config: ConfigService);
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    private send;
}
