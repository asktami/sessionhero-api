const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Schedule Endpoints', function() {
	let db;
	const { testUsers, testSessions, testSchedules } = helpers.makeFixtures();

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

	// UNAUTHORIZED REQUESTS ***************************
	describe(`Unauthorized requests`, () => {
		beforeEach('insert schedule', () => {
			return db.into('schedule').insert(testSchedules);
		});

		it(`responds with 401 Unauthorized for GET /api/schedule`, () => {
			return supertest(app)
				.get('/api/schedule')
				.expect(401, { error: 'Unauthorized request' });
		});

		it(`responds with 401 Unauthorized for POST /api/schedule`, () => {
			return supertest(app)
				.post('/api/schedule')
				.send({
					session_id: 'ABC123',
					user_id: 1
				})
				.expect(401, { error: 'Unauthorized request' });
		});

		// TBD change this to POST
		it(`responds with 401 Unauthorized for POST /api/schedule/:sessionId`, () => {
			const scheduleItem = testSchedules[1];
			return supertest(app)
				.get(`/api/schedule/${scheduleItem.id}`)
				.expect(401, { error: 'Unauthorized request' });
		});

		it(`responds with 401 Unauthorized for DELETE /api/schedule/:commentId`, () => {
			const scheduleItem = testSchedules[1];
			return supertest(app)
				.delete(`/api/comments/${scheduleItem.session_id}`)
				.expect(401, { error: 'Unauthorized request' });
		});
	});

	// AUTHORIZED REQUESTS ***************************
	describe(`GET /api/schedule`, () => {
		context(`Given no schedule`, () => {
			beforeEach(() =>
				helpers.seedUsers(db, testUsers, testSessions, testSchedules)
			);

			// send fake user_id = 3, a user with no schedule records
			it(`responds with 404`, () => {
				return supertest(app)
					.get(`/api/schedule`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[2]))
					.expect(404, { error: `Schedule Not Found` });
			});
		});

		context('Given there are schedules in the database', () => {
			beforeEach('insert schedules', () =>
				helpers.seedTables(db, testUsers, testSessions, testSchedules)
			);

			it('responds with 200 and the specified schedule', () => {
				const expectedSchedule = helpers.makeExpectedSchedule(
					testUsers[0],
					testSessions[0]
				);

				return supertest(app)
					.get(`/api/schedule`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedSchedule);
			});
		});
	});

	// POST SCHEDULE ITEM ************************************
	describe(`POST /api/schedule/:sessionId/`, () => {
		beforeEach('insert schedule', () =>
			helpers.seedTables(db, testUsers, testSessions, testSchedules)
		);

		it(`creates a schedule record, responding with 201 and the new schedule record`, () => {
			let session_id = testSessions[0].id;

			const newScheduleItem = {
				session_id: session_id
			};
			return supertest(app)
				.post(`/api/schedule/${session_id}/`)
				.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
				.send(newScheduleItem)
				.expect(201)
				.expect(res => {
					expect(res.body).to.have.property('id');
					expect(res.body.session_id).to.eql(newScheduleItem.session_id);
					expect(res.headers.location).to.eql(
						`/api/schedule/${session_id}/${res.body.id}`
					);
				});
		});

		// loop thru required fields and test what happens when each is missing
		const requiredFields = ['session_id'];

		requiredFields.forEach(field => {
			let session_id = testSessions[0].id;

			const newScheduleItem = {
				session_id: session_id
			};

			it(`responds with 400 and an error message when the '${field}' is missing`, () => {
				delete newScheduleItem[field];

				return supertest(app)
					.post(`/api/schedule/${session_id}/`)
					.send(newScheduleItem)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(400, {
						error: `'${field}' is required`
					});
			});
		});
	});

	// DELETE SCHEDULE ITEM
	describe(`DELETE /api/schedule/:scheduleId`, () => {
		context(`Given no schedule item`, () => {
			it(`responds with 404`, () => {
				// create fake schedule.id
				let id = '911';

				return supertest(app)
					.delete(`/api/schedule/${id}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Schedule record Not Found` });
			});
		});

		context('Given there are schedules in the database', () => {
			beforeEach('insert schedules', () =>
				helpers.seedTables(db, testUsers, testSessions, testSchedules)
			);

			it('responds with 204 and removes the schedule item', () => {
				const expectedSchedule = helpers.makeExpectedSchedule(
					911,
					testUsers[0],
					testSessions[0]
				);

				let idToRemove = expectedSchedule.id;

				return supertest(app)
					.delete(`/api/schedule/${idToRemove}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then(
						res =>
							supertest(app)
								.get(`/api/schedule`)
								.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
								.expect(res => {
									expect(res.body[0]).to.have.property('id');
									expect(res.body.id).to.eql(expectedSchedule.id);
								})

						// .expect(200, expectedSchedule);
					);
			});
		});
	});
});
