import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.from = this.config.get<string>('EMAIL_FROM', 'noreply@attackoncode.dev');
    this.frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not found. Emails will be logged to console only.');
    }
  }

  // ── VERIFICATION EMAIL ────────────────────────────────────────────────

  async sendVerificationEmail(email: string, token: string): Promise<void> {
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

  // ── PASSWORD RESET EMAIL ──────────────────────────────────────────────

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
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

  // ── CORE SEND METHOD ──────────────────────────────────────────────────

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, (err as Error).stack);
      }
    } else {
      this.logger.log('--- EMAIL SIMULATION ---');
      this.logger.log(`To: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Content snippet: ${html.slice(0, 100)}...`);
      this.logger.log('------------------------');
    }
  }
}
