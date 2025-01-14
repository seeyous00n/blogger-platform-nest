import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import * as request from 'supertest';
import { delay } from './helpers/delay';
import { authBasicData, newUserData } from './mock/mock-data';

describe('AuthController', () => {
  let app: INestApplication;
  let httpServer;
  let dbConnection;

  beforeEach(async () => {
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
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /login', () => {
    it('should respond with 200', async () => {
      await request(httpServer)
        .post('/users')
        .auth(authBasicData.login, authBasicData.password)
        .send(newUserData)
        .expect(201);

      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(200);
    });
  });

  describe('GET /me', () => {
    it('should respond with 200', async () => {
      await request(httpServer)
        .post('/users')
        .auth(authBasicData.login, authBasicData.password)
        .send(newUserData)
        .expect(201);

      const result = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(200);

      await request(httpServer)
        .get('/auth/me')
        .auth(result.body.accessToken, { type: 'bearer' })
        .expect(200);
    });

    it('should should status code 401', async () => {
      await request(httpServer)
        .post('/users')
        .auth(authBasicData.login, authBasicData.password)
        .send(newUserData)
        .expect(201);

      const result = await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(200);

      await delay(2200);

      await request(httpServer)
        .get('/auth/me')
        .auth(result.body.accessToken, { type: 'bearer' })
        .expect(401);
    });
  });

  describe('POST /registration', () => {
    it('should register new user', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204);

      await request(httpServer)
        .get('/users')
        .auth(authBasicData.login, authBasicData.password)
        .expect(200);
    });
  });

  describe('POST /registration-confirmation', () => {
    it('should confirmation', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204);

      const users = await request(httpServer)
        .get('/users')
        .auth(authBasicData.login, authBasicData.password)
        .expect(200);

      const dbAnswer1 = await dbConnection
        .model('User')
        .findOne({ _id: users.body.items[0].id });
      expect(dbAnswer1.emailConfirmation.isConfirmed).toBe(false);

      await request(httpServer)
        .post('/auth/registration-confirmation')
        .send({ code: dbAnswer1.emailConfirmation.confirmationCode })
        .expect(204);

      const dbAnswer2 = await dbConnection
        .model('User')
        .findOne({ _id: users.body.items[0].id });
      expect(dbAnswer2.emailConfirmation.isConfirmed).toBe(true);
    });
  });

  describe('POST /registration-email-resending', () => {
    it('should resending code', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204);

      const dbAnswer1 = await dbConnection.model('User').findOne({});

      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: newUserData.email })
        .expect(204);

      const dbAnswer2 = await dbConnection.model('User').findOne({});
      expect(dbAnswer1.emailConfirmation.confirmationCode).not.toBe(
        dbAnswer2.emailConfirmation.confirmationCode,
      );
    });
  });

  describe('POST /password-recovery', () => {
    it('should change password', async () => {
      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204);

      const dbAnswer1 = await dbConnection.model('User').findOne({});
      expect(dbAnswer1.passwordHash.recoveryCode).toBeUndefined();
      expect(dbAnswer1.passwordHash.expirationDate).toBeUndefined();

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(204);

      const dbAnswer2 = await dbConnection.model('User').findOne({});
      expect(dbAnswer2).toHaveProperty('passwordHash.recoveryCode');
      expect(dbAnswer2).toHaveProperty('passwordHash.expirationDate');
    });
  });

  describe('POST /new-password', () => {
    it('should create new password', async () => {
      const newPassword = '123123123';

      await request(httpServer)
        .post('/auth/registration')
        .send(newUserData)
        .expect(204);

      await request(httpServer)
        .post('/auth/password-recovery')
        .send({ email: newUserData.email })
        .expect(204);

      const dbAnswer2 = await dbConnection.model('User').findOne({});

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: newPassword,
          recoveryCode: dbAnswer2.passwordHash.recoveryCode,
        })
        .expect(204);

      await request(httpServer)
        .post('/auth/login')
        .send({
          loginOrEmail: newUserData.login,
          password: newUserData.password,
        })
        .expect(401);

      await request(httpServer)
        .post('/auth/login')
        .send({ loginOrEmail: newUserData.login, password: newPassword })
        .expect(200);
    });
  });
});
