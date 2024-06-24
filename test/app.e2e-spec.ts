import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import * as mongoose from 'mongoose';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testUser: CreateUserDto;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      const randomEmail = `testuser-${Date.now()}-${i}@example.com`;
      testUser = { email: randomEmail, password: 'testpassword' };

      try {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser);

        if (response.status === 201) {
          break;
        }
      } catch (error) {
        if (i === 2) {
          throw new Error(`Failed to register user after 3 attempts: ${error.message}`);
        }
        console.warn(`Error registering user (attempt ${i + 1}):`, error.message);
      }
    }
  });

  afterAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.collection('users').deleteOne({ email: testUser.email });
    await mongoose.disconnect();
  });

  it('should login a user and return an access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    expect(response.status).toBe(201); 
    expect(response.body).toHaveProperty('access_token');
    accessToken = response.body.access_token;
  });

  it('should get all users (protected route)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it('should get all logs (protected route)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/logs')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });
});