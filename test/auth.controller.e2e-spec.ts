import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import * as request from 'supertest';
import { delay } from './helpers/delay';
import { authBasicData, newUserData } from './mock/mock-data';
import { UserTestManager } from './helpers/user-test-manager';

describe('AuthController', () => {
  let app: INestApplication;
  let httpServer;
  let dbConnection;
  let userTestManager: UserTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: process.env.JWT_ACCESS_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );

    app = result.app;
    httpServer = result.httpServer;
    dbConnection = result.dbConnection;
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
        .get('/users')
        .auth(authBasicData.login, authBasicData.password)
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /registration-confirmation', () => {
    it('should confirmation', async () => {
      await userTestManager.registrationUser(newUserData);
      const users = await userTestManager.getUsers();

      const user = await dbConnection
        .model('User')
        .findOne({ _id: users.items[0].id });
      expect(user.emailConfirmation.isConfirmed).toBe(false);

      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: user.emailConfirmation.confirmationCode })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdateData = await dbConnection
        .model('User')
        .findOne({ _id: users.items[0].id });
      expect(userUpdateData.emailConfirmation.isConfirmed).toBe(true);
    });
  });

  describe('POST /registration-email-resending', () => {
    it('should resending code', async () => {
      await userTestManager.registrationUser(newUserData);

      const user = await dbConnection.model('User').findOne({});

      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdateData = await dbConnection.model('User').findOne({});
      expect(user.emailConfirmation.confirmationCode).not.toBe(
        userUpdateData.emailConfirmation.confirmationCode,
      );
    });
  });

  describe('POST /password-recovery', () => {
    it('should change password', async () => {
      await userTestManager.registrationUser(newUserData);

      const user = await dbConnection.model('User').findOne({});
      expect(user.passwordHash.recoveryCode).toBeUndefined();
      expect(user.passwordHash.expirationDate).toBeUndefined();

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(HttpStatus.NO_CONTENT);

      const userUpdate = await dbConnection.model('User').findOne({});
      expect(userUpdate).toHaveProperty('passwordHash.recoveryCode');
      expect(userUpdate).toHaveProperty('passwordHash.expirationDate');
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

      const user = await dbConnection.model('User').findOne({});

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: newPassword,
          recoveryCode: user.passwordHash.recoveryCode,
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

      const user = await dbConnection.model('User').findOne({});

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: newPassword,
          recoveryCode: user.passwordHash.recoveryCode,
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
});
