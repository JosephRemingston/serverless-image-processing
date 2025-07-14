const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../index');

// Sample image for upload tests
const sampleImagePath = path.join(__dirname, '../sample.png');

// Mock AWS Rekognition for image recognition endpoint
global.beforeAll(() => {
  jest.mock('aws-sdk', () => {
    const actual = jest.requireActual('aws-sdk');
    return {
      ...actual,
      Rekognition: jest.fn(() => ({
        detectLabels: jest.fn(() => ({
          promise: () => Promise.resolve({ Labels: [{ Name: 'TestLabel', Confidence: 99 }] })
        }))
      }))
    };
  });
});

describe('API Endpoints', () => {
  it('should process image and return processed image', async () => {
    const res = await request(app)
      .post('/api/image/process-image')
      .attach('image', sampleImagePath);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
  });

  it('should return labels from ai-recognition', async () => {
    const res = await request(app)
      .post('/api/image/ai-recognition')
      .attach('image', sampleImagePath);
    expect(res.statusCode).toBe(200);
    expect(res.body.labels).toBeDefined();
    expect(Array.isArray(res.body.labels)).toBe(true);
  });

  it('should generate signed url for media upload', async () => {
    const res = await request(app)
      .get('/api/media');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('signed url');
    expect(res.body.data).toHaveProperty('filename');
  });

  // Add more tests for /api/auth and /api/user as needed, e.g. registration, login, get user, etc.
}); 