const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Sessions Endpoints', function() {
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

	describe(`GET /api/sessions`, () => {
		context(`Given no sessions`, () => {
			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get('/api/sessions')
					.expect(200, []);
			});
		});

		context('Given there are sessions in the database', () => {
			beforeEach('insert sessions', () =>
				helpers.seedTables(
					db,
					testUsers,
					testSessions,
					testComments,
					testSchedules
				)
			);

			it('responds with 200 and all of the sessions', () => {
				const expectedSessions = testSessions.map(session =>
					helpers.makeExpectedSession(session)
				);
				return supertest(app)
					.get('/api/sessions')
					.expect(200, expectedSessions);
			});
		});
	});

	describe(`GET /api/sessions/:session_id`, () => {
		context(`Given no sessions`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 404`, () => {
				const sessionId = 123456;
				return supertest(app)
					.get(`/api/sessions/${sessionId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Session doesn't exist` });
			});
		});

		context('Given there are sessions in the database', () => {
			beforeEach('insert sessions', () =>
				helpers.seedTables(
					db,
					testUsers,
					testSessions,
					testComments,
					testSchedules
				)
			);

			it('responds with 200 and the specified session', () => {
				const sessionId = 'BUS04';

				const expectedSessions = helpers.makeExpectedSession(testSessions[0]);

				// TBD NOTE not getting loginUserId from AuthHeader for search!!!
				return supertest(app)
					.get(`/api/sessions/${sessionId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedSessions);
			});
		});
	});

	describe(`GET /api/sessions/:session_id/comments`, () => {
		context(`Given no sessions`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 404`, () => {
				const sessionId = 123456;
				return supertest(app)
					.get(`/api/sessions/${sessionId}/comments`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Session doesn't exist` });
			});
		});

		context('Given there are comments for session in the database', () => {
			beforeEach('insert sessions', () =>
				helpers.seedTables(
					db,
					testUsers,
					testSessions,
					testComments,
					testSchedules
				)
			);

			it('responds with 200 and the specified comments', () => {
				const sessionId = testSessions[0].id;
				const expectedComments = helpers.makeExpectedSessionComments(
					testUsers[0],
					testSessions[0],
					testComments[0]
				);

				return supertest(app)
					.get(`/api/sessions/${sessionId}/comments`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedComments);
			});
		});
	});
});
