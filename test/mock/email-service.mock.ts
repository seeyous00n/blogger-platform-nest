import { EmailService } from '../../src/features/notifications/email.service';

export class EmailServiceMock extends EmailService {
  async sendEmail(to: string, link: string, type: string) {
    return Promise.resolve();
  }
}
