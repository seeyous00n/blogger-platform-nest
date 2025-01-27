import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import * as request from 'supertest';
import { delay } from './helpers/delay';
import {
  authBasicData,
  newBlogData,
  newPostData,
  newUserData,
} from './mock/mock-data';
import { UserTestManager } from './helpers/user-test-manager';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_INJECT } from '../src/features/user-accounts/constants/auth-tokens.jwt';

describe('SecurityController', () => {
  let app: INestApplication;
  let httpServer;
  let dbConnection;
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
    dbConnection = result.dbConnection;
    userTestManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /security/devices', () => {
    let users;

    beforeEach(async () => {
      users = await userTestManager.createSeveralUsers(3);
    });

    it('should response with 200', async () => {
      const tokens = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      const data = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /security/devices/:id', () => {
    let users;

    beforeEach(async () => {
      users = await userTestManager.createSeveralUsers(3);
    });

    it('should delete one device', async () => {
      const tokens = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      const tokens2 = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      const response = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(response.body.length).toBe(2);

      await request(httpServer)
        .delete(`/security/devices/${response.body[0].deviceId}`)
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);

      const responseAfterDeleteOneDevice = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', [tokens2.refreshToken])
        .auth(tokens2.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(responseAfterDeleteOneDevice.body.length).toBe(1);
      expect(responseAfterDeleteOneDevice.body[0].deviceId).toBe(
        response.body[1].deviceId,
      );
    });
  });

  describe('DELETE /security/devices', () => {
    let users;

    beforeEach(async () => {
      users = await userTestManager.createSeveralUsers(3);
    });

    it('should delete all devices except current', async () => {
      const tokens = await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      await userTestManager.loginUserGetTwoTokens({
        loginOrEmail: users[0].login,
        password: newUserData.password,
      });

      const response = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(response.body.length).toBe(3);

      await request(httpServer)
        .delete(`/security/devices`)
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.NO_CONTENT);

      const responseAfterDeleteAllDevices = await request(httpServer)
        .get('/security/devices')
        .set('Cookie', [tokens.refreshToken])
        .auth(tokens.accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      expect(responseAfterDeleteAllDevices.body.length).toBe(1);
      expect(responseAfterDeleteAllDevices.body[0].deviceId).toBe(
        response.body[0].deviceId,
      );
    });
  });
});
