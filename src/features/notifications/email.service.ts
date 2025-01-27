import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const TYPE_EMAIL = {
  REGISTRATION: 'registration',
  RESEND_CODE: 'resendCode',
  RECOVERY_CODE: 'recoveryCode',
};

const BASE_URL = 'http://localhost:3003';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendEmail(
    to: string,
    link: string,
    type: string = TYPE_EMAIL.REGISTRATION,
  ) {
    const htmlTemplate = this.getTemplate(link, type);
    await this.mailerService.sendMail({
      from: this.configService.get<string>('SMTP_AUTH_USER'),
      to: to,
      subject: 'Activation link',
      text: '',
      html: htmlTemplate,
    });
  }

  private getTemplate(link: string, type: string): string {
    let htmlTemplate = '';
    switch (type) {
      case TYPE_EMAIL.REGISTRATION:
        htmlTemplate = `<h1>Hi! Registration</h1><div><a href="${BASE_URL}/auth/registration-confirmation?code=${link}">Confirm</a></div>`;
        break;
      case TYPE_EMAIL.RESEND_CODE:
        htmlTemplate = `<h1>Hi! Resend CODE</h1><div><a href="${BASE_URL}/auth/registration-confirmation?code=${link}">Confirm</a></div>`;
        break;
      case TYPE_EMAIL.RECOVERY_CODE:
        htmlTemplate = `<h1>Hi! Recovery CODE</h1><div><a href="${BASE_URL}/auth/password-recovery?recoveryCode=${link}">Confirm</a></div>`;
        break;
      default:
        htmlTemplate = '<h1>Ups... </h1>';
    }

    return htmlTemplate;
  }
}
