const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', function() {
	let db;

	const {
		testUsers,
		testSessions,
		testComments,
		testSchedules
	} = helpers.makeFixtures();

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());
	before('cleanup', () => helpers.cleanTables(db));
	afterEach('cleanup', () => helpers.cleanTables(db));

	beforeEach('insert data into all tables', () =>
		helpers.seedTables(db, testUsers, testSessions, testComments, testSchedules)
	);

	const protectedEndpoints = [
		{
			name: 'POST /api/auth/refresh',
			path: '/api/auth/refresh',
			method: supertest(app).post
		},
		{
			name: 'GET /api/comments/:commentId',
			path: '/api/comments/1',
			method: supertest(app).get
		},
		{
			name: 'POST /api/sessions/:sessionId/comments/',
			path: '/api/sessions/BUS04/comments/',
			method: supertest(app).get
		},
		{
			name: 'GET /api/sessions/:sessionId',
			path: '/api/sessions/BUS04',
			method: supertest(app).get
		},
		{
			name: 'GET /api/sessions/:sessionId/comments',
			path: '/api/sessions/BUS04/comments',
			method: supertest(app).get
		},
		{
			name: 'GET /api/schedule',
			path: '/api/schedule',
			method: supertest(app).get
		},
		{
			name: 'POST /api/schedule/:sessionId',
			path: '/api/schedule/BUS04',
			method: supertest(app).post
		},
		{
			name: 'DELETE /api/schedule/:scheduleId',
			path: '/api/schedule/1',
			method: supertest(app).post
		}
	];

	protectedEndpoints.forEach(endpoint => {
		describe(endpoint.name, () => {
			it(`responds 401 'Missing bearer token' when no bearer token`, () => {
				return endpoint
					.method(endpoint.path)
					.expect(401, { error: `Missing bearer token` });
			});

			it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
				const validUser = testUsers[0];
				const invalidSecret = 'bad-secret';

				return endpoint
					.method(endpoint.path)
					.set(
						'Authorization',
						helpers.makeAuthHeader(validUser, invalidSecret)
					)
					.expect(401, { error: `Unauthorized request` });
			});

			it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
				const invalidUser = { user_name: 'user-not-existy', id: 1 };
				return endpoint
					.method(endpoint.path)
					.set('Authorization', helpers.makeAuthHeader(invalidUser))
					.expect(401, { error: `Unauthorized request` });
			});
		});
	});
});
