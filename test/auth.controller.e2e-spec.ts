import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import * as request from 'supertest';
import { delay } from './helpers/delay';
import { authBasicData, newUserData } from './mock/mock-data';
import { UserTestManager } from './helpers/user-test-manager';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_INJECT } from '../src/features/user-accounts/constants/auth-tokens.jwt';

describe('AuthController', () => {
  let app: INestApplication;
  let httpServer;
  let dataSource;
  let userTestManager: UserTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(ACCESS_TOKEN_INJECT).useFactory({
        factory: (configService: ConfigService) => {
          return new JwtService({
            secret: configService.get<string>('JWT_ACCESS_SECRET'),
            signOptions: { expiresIn: '2s' },
          });
        },
        inject: [ConfigService],
      }),
    );

    app = result.app;
    httpServer = result.httpServer;
    dataSource = result.dataSource;
    userTestManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /login', () => {
    it('should response with 200', async () => {
      await userTestManager.createUser(newUserData);

      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('GET /me', () => {
    it('should response with 200', async () => {
      await userTestManager.createUser(newUserData);

      const accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });

      await request(httpServer)
        .get('/auth/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);
    });

    it('should return statusCode 401 when accessToken expire', async () => {
      await userTestManager.createUser(newUserData);

      const accessToken = await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });

      await delay(2200);

      await request(httpServer)
        .get('/auth/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /registration', () => {
    it('should register new user', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer)
        .get('/sa/users')
        .auth(authBasicData.login, authBasicData.password)
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /registration-confirmation', () => {
    it('should confirmation', async () => {
      await userTestManager.registrationUser(newUserData);
      const users = await userTestManager.getUsers();

      const user = await dataSource.query(
        `SELECT *
                 FROM "user"
                 WHERE id = $1`,
        [users.items[0].id],
      );

      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: user[0].email_confirmation_code })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdateData = await dataSource.query(
        `SELECT *
                 FROM "user"
                 WHERE id = $1`,
        [users.items[0].id],
      );
      expect(userUpdateData[0].email_is_confirmed).toBe(true);
    });
  });

  describe('POST /registration-email-resending', () => {
    it('should resending code', async () => {
      await userTestManager.registrationUser(newUserData);

      const user = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );

      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdateData = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );
      expect(user[0].email_confirmation_code).not.toBe(
        userUpdateData[0].email_confirmation_code,
      );
    });
  });

  describe('POST /password-recovery', () => {
    it('should change password', async () => {
      await userTestManager.registrationUser(newUserData);

      const user = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );

      expect(user[0].password_recovery_code).toBe(null);
      expect(user[0].password_expiration_date).toBe(null);

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdate = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );
      expect(userUpdate[0]).toHaveProperty('password_recovery_code');
      expect(userUpdate[0]).toHaveProperty('password_expiration_date');
    });
  });

  describe('POST /new-password', () => {
    it('should login with new password', async () => {
      const newPassword = '123123123';

      await userTestManager.registrationUser(newUserData);

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const user = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: newPassword,
          recoveryCode: user[0].password_recovery_code,
        })
        .expect(HttpStatus.NO_CONTENT);

      await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newPassword,
      });
    });

    it('after update the password should return UNAUTHORIZED', async () => {
      const newPassword = '123123123';

      await userTestManager.registrationUser(newUserData);

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const user = await dataSource.query(
        `SELECT *
                 FROM "user"`,
      );

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: newPassword,
          recoveryCode: user[0].password_recovery_code,
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /logout', () => {
    let users;

    beforeEach(async () => {
      users = await userTestManager.createSeveralUsers(1);
    });

    it('should logout', async () => {
      await userTestManager.registrationUser(newUserData);

      const tokens = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      await request(httpServer)
        .post('/auth/logout')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('POST /refresh-token', () => {
    let users;

    beforeEach(async () => {
      users = await userTestManager.createSeveralUsers(1);
    });

    it('should refresh tokens', async () => {
      await userTestManager.registrationUser(newUserData);

      const tokens = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      await delay(1000);

      const response = await request(httpServer)
        .post('/auth/refresh-token')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(response.body.accessToken).not.toBe(tokens.accessToken);
    });
  });

  describe('POST /auth/login', () => {
    it('check Throttle', async () => {
      await userTestManager.registrationUser(newUserData);

      await userTestManager.loginUser({
        loginOrEmail: newUserData.login,
        password: newUserData.password,
      });
    });
  });
});
