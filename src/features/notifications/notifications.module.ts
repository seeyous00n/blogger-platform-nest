import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsConfig } from './config/notifications.config';
import { NotificationsConfigModule } from './config/notifications-config.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [NotificationsConfigModule],
      useFactory: (notificationsConfig: NotificationsConfig) => ({
        transport: {
          host: notificationsConfig.smtpHost,
          port: notificationsConfig.smtpPort,
          auth: {
            user: notificationsConfig.smtpAuthUser,
            pass: notificationsConfig.smtpAuthPass,
          },
        },
      }),
      inject: [NotificationsConfig],
    }),
  ],
  providers: [EmailService, NotificationsConfig],
  exports: [EmailService],
})
export class NotificationsModule {}
