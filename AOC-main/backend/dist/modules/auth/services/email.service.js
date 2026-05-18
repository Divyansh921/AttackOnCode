"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.resend = null;
        this.logger = new common_1.Logger(EmailService_1.name);
        const apiKey = this.config.get('RESEND_API_KEY');
        this.from = this.config.get('EMAIL_FROM', 'noreply@attackoncode.dev');
        this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        else {
            this.logger.warn('RESEND_API_KEY not found. Emails will be logged to console only.');
        }
    }
    async sendVerificationEmail(email, token) {
        const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
        const subject = '⚔️ Verify your Attack on Code account';
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h1 style="color: #dc2626; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Welcome to the Ecosystem</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px;">Thanks for joining Attack on Code! Please verify your email to start forming teams and building projects.</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 24px 0;">Verify Email Address</a>
        <p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 10px;">Attack on Code — The Hackathon Collaboration Operating System</p>
      </div>
    `;
        await this.send(email, subject, html);
    }
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        const subject = '🔐 Reset your Attack on Code password';
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h1 style="color: #dc2626; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Password Reset Request</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px;">We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 24px 0;">Reset Password</a>
        <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 10px;">Attack on Code — Security System</p>
      </div>
    `;
        await this.send(email, subject, html);
    }
    async send(to, subject, html) {
        if (this.resend) {
            try {
                await this.resend.emails.send({
                    from: this.from,
                    to,
                    subject,
                    html,
                });
                this.logger.log(`Email sent to ${to}: ${subject}`);
            }
            catch (err) {
                this.logger.error(`Failed to send email to ${to}`, err.stack);
            }
        }
        else {
            this.logger.log('--- EMAIL SIMULATION ---');
            this.logger.log(`To: ${to}`);
            this.logger.log(`Subject: ${subject}`);
            this.logger.log(`Content snippet: ${html.slice(0, 100)}...`);
            this.logger.log('------------------------');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map