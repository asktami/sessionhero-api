const app = require('../src/app');

// Happy Path testing
describe(`App Server endpoints - Unauthorized requests`, () => {
	it('GET / responds with 200 containing "Hello, world!"', () => {
		return supertest(app)
			.get('/')
			.expect(200, 'Hello, world!');
	});
});

describe('App Server endpoints - Authorized requests', () => {
	it('GET / responds with 200 containing "Hello, world!"', () => {
		return supertest(app)
			.get('/')
			.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
			.expect(200, 'Hello, world!');
	});
});
