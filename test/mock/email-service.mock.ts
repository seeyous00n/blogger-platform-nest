import {
  EmailService,
  TYPE_EMAIL,
} from '../../src/features/notifications/email.service';

export class EmailServiceMock extends EmailService {
  async sendEmail(
    to: string,
    link: string,
    type: string = TYPE_EMAIL.REGISTRATION,
  ) {
    return Promise.resolve();
  }
}
