const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Sessions Endpoints', function() {
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

				// TODO need to get all sessions with no login userId and in result no schedule_id and no user_id
				return supertest(app)
					.get('/api/sessions')
					.expect(200, expectedSessions);
			});
		});
	});

	describe(`GET /api/sessions/:session_id`, () => {
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
				const sessionId = testSessions[0].id;

				const expectedSessions = helpers.makeExpectedSession(testSessions[0]);

				return supertest(app)
					.get(`/api/sessions/${sessionId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedSessions);
			});
		});
	});

	describe(`GET /api/sessions/:session_id/comments`, () => {
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
				let userId = testUsers[0].id;
				let sessionId = testSessions[0].id;

				const filteredComments = testComments.filter(
					comment => comment.user_id === userId
				);

				const expectedComments = filteredComments.map(comment =>
					helpers.makeExpectedSessionComments(comment, testUsers)
				);

				return supertest(app)
					.get(`/api/sessions/${sessionId}/comments`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedComments);
			});
		});
	});
});
