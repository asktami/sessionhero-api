const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Happy Path testing
describe('Schedule Endpoints', function() {
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

	// AUTHORIZED REQUESTS ***************************
	describe(`GET /api/schedule`, () => {
		context('Given there are schedules in the database', () => {
			beforeEach('insert schedules', () =>
				helpers.seedTables(
					db,
					testUsers,
					testSessions,
					testComments,
					testSchedules
				)
			);

			it('responds with 200 and all the schedule records for the logged in user', () => {
				let userId = testUsers[0].id;

				const filteredSchedule = testSchedules.filter(
					schedule => schedule.user_id === userId
				);

				const expectedSchedules = filteredSchedule.map(schedule =>
					helpers.makeExpectedSchedule(userId, schedule, testSessions)
				);

				return supertest(app)
					.get(`/api/schedule`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedSchedules);
			});
		});
	});

	// POST SCHEDULE ITEM ************************************
	describe(`POST /api/schedule/:sessionId/`, () => {
		context('Given there are no schedules in the database', () => {
			beforeEach('insert schedules', () =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			it(`creates a schedule record, responding with 201 and the new schedule record`, () => {
				let session_id = testSessions[0].id;

				const newScheduleItem = {
					session_id: session_id
				};

				return supertest(app)
					.post(`/api/schedule/${session_id}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.send(newScheduleItem)
					.expect(201)
					.expect(res => {
						expect(res.body).to.have.property('id');
						expect(res.body.session_id).to.eql(newScheduleItem.session_id);
						expect(res.headers.location).to.eql(`/api/schedule/${session_id}`);
					});
			});
		});
	});

	// DELETE SCHEDULE ITEM
	describe(`DELETE /api/schedule/:scheduleId`, () => {
		context('Given there are schedules in the database', () => {
			beforeEach('insert schedules', () =>
				helpers.seedTables(
					db,
					testUsers,
					testSessions,
					testComments,
					testSchedules
				)
			);

			it('responds with 204 and removes the schedule item', () => {
				const idToRemove = 2;

				const expectedScheduleItem = testSchedules.filter(
					schedule => schedule.id !== idToRemove
				);

				return supertest(app)
					.delete(`/api/schedule/${idToRemove}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204);
			});
		});
	});
});
