import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/features/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { deleteAllData } from './delete-all-data';
import { UserTestManager } from './user-test-manager';
import { BlogTestManager } from './blog-test-manager';
import { PostTestManager } from './post-test-manager';
import { CommentTestManager } from './comment-test-manager';
import { ThrottlerGuard } from '@nestjs/throttler';

type ModuleBuilderType = (moduleBuilder: TestingModuleBuilder) => void;

export const initSettings = async (
  addSettingsToModuleBuilder?: ModuleBuilderType,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);
  // .overrideGuard(ThrottlerGuard)
  // .useValue({ canActivate: () => true }); //don't work hh??

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();

  appSetup(app);

  const userTestManager = new UserTestManager(app);
  const blogTestManager = new BlogTestManager(app);
  const postTestManager = new PostTestManager(app);
  const commentTestManager = new CommentTestManager(app);

  await app.init();

  const dbConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();

  await deleteAllData(app);

  return {
    app,
    dbConnection,
    httpServer,
    userTestManager,
    blogTestManager,
    postTestManager,
    commentTestManager,
  };
};
