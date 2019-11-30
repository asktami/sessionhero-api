const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Comments Endpoints', function() {
	let db;
	const { testComments, testUsers, testSessions } = helpers.makeFixtures();

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
		beforeEach('insert comment', () => {
			helpers.seedTables(db, testUsers, testSessions, testComments);
		});

		// it(`responds with 401 Unauthorized for GET /api/comments`, () => {
		// 	return supertest(app)
		// 		.get('/api/comments')
		// 		.expect(401, { error: 'Unauthorized request' });
		// });

		it(`responds with 401 Unauthorized for POST /api/comments`, () => {
			return supertest(app)
				.post('/api/comments')
				.send({
					text: 'test comment',
					rating: 1
				})
				.expect(401, { error: 'Missing bearer token' });
		});

		it(`responds with 401 Unauthorized for GET /api/comments/:commentId`, () => {
			const comment = testComments[1];
			return supertest(app)
				.get(`/api/comments/${comment.id}`)
				.expect(401, { error: 'Missing bearer token' });
		});

		it(`responds with 401 Unauthorized for DELETE /api/comments/:commentId`, () => {
			const comment = testComments[1];
			return supertest(app)
				.delete(`/api/comments/${comment.id}`)
				.expect(401, { error: 'Missing bearer token' });
		});
	});

	// AUTHORIZED REQUESTS ***************************
	describe(`GET /api/comments/:commentId`, () => {
		context(`Given no comments`, () => {
			beforeEach(() =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			it(`responds with 404`, () => {
				const commentId = 123456;
				return supertest(app)
					.get(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Comment Not Found` });
			});
		});

		context('Given there are comments in the database', () => {
			beforeEach('insert comments', () =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			it('responds with 200 and the specified comment', () => {
				const commentId = testComments[0].id;
				const expectedComment = helpers.makeExpectedComment(
					testComments[0],
					testSessions[0]
				);

				return supertest(app)
					.get(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedComment);
			});
		});
	});

	// POST SESSION COMMENTS ************************************
	describe(`POST /api/comments/`, () => {
		beforeEach('insert comments', () =>
			helpers.seedTables(db, testUsers, testSessions, testComments)
		);

		it(`creates a comment, responding with 201 and the new comment`, () => {
			let userId = testUsers[0].id;
			let sessionId = testSessions[0].id;

			const newComment = {
				text: 'Test New Comment',
				rating: 1,
				session_id: sessionId,
				user_id: userId
			};
			return supertest(app)
				.post(`/api/comments/`)
				.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
				.send(newComment)
				.expect(201)
				.expect(res => {
					expect(res.body).to.have.property('id');
					expect(res.body.text).to.eql(newComment.text);
					expect(res.body.rating).to.eql(newComment.rating);
					expect(res.body.session_id).to.eql(newComment.session_id);
					expect(res.body.user_id).to.eql(newComment.user_id);
					expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`);
				});
		});

		// loop thru required fields and test what happens when each is missing
		const requiredFields = ['text', 'rating'];

		requiredFields.forEach(field => {
			let userId = testUsers[0].id;
			let sessionId = testSessions[0].id;

			const newComment = {
				text: 'Test New Comment',
				rating: 1,
				session_id: sessionId,
				user_id: userId
			};

			it(`responds with 400 and an error message when the '${field}' is missing`, () => {
				delete newComment[field];

				return supertest(app)
					.post(`/api/sessions/${sessionId}/comments/`)
					.send(newComment)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(400, {
						error: { message: `'${field}' is required` }
					});
			});
		});

		// test what happens when try to post xss attack
		// context(`Given an XSS attack comment`, () => {
		// 	let testUser = testUsers[0];
		// 	const {
		// 		maliciousComment,
		// 		expectedComment
		// 	} = helpers.makeMaliciousComment(testUser, testSessions[0]);

		// 	beforeEach('insert malicious comment', () => {
		// 		return helpers.seedMaliciousComment(db, testUser, maliciousComment);
		// 	});

		// 	it('removes XSS attack content', () => {
		// 		return supertest(app)
		// 			.get(`/api/comments/${maliciousComment.id}`)
		// 			.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
		// 			.expect(200)
		// 			.expect(res => {
		// 				expect(res.body[0].text).to.eql(expectedComment.text);
		// 				expect(res.body[0].rating).to.eql(expectedComment.rating);
		// 			});
		// 	});
		// });
	});

	// DELETE COMMENT
	describe(`DELETE /api/comments/:commentId`, () => {
		context(`Given no comment`, () => {
			it(`responds with 404`, () => {
				const commentId = 123456;
				return supertest(app)
					.delete(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Comment Not Found` });
			});
		});

		context('Given there are comments in the database', () => {
			beforeEach('insert comments', () =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			// TBD shouldn't this be comment.id === idToRemove???
			// What are we doing here??? Are we creating an array = everything NOT deleted OR just a 1 element array of the thing to be deleted???
			it('responds with 204 and removes the comment', () => {
				const commentId = testComments[0];
				const expectedComment = helpers.makeExpectedComment(
					testComments[0],
					testSessions[0]
				);

				return supertest(app)
					.delete(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then(
						res =>
							supertest(app)
								.get(`/api/comments`)
								.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
								.expect(res => {
									expect(res.body[0]).to.have.property('id');
									expect(res.body.text).to.eql(expectedComment.text);
								})

						// .expect(200, expectedComment);
						// DISCUSS WITH MENTOR
					);
			});
		});
	});

	// PATCH COMMENTS
	describe(`PATCH /api/comments/:commentId`, () => {
		context(`Given no comment`, () => {
			it(`responds with 404`, () => {
				const commentId = 123456;
				return supertest(app)
					.delete(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: { message: `Comment Not Found` } });
			});
		});

		context('Given there are comments in the database', () => {
			beforeEach('insert comments', () =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			it('responds with 204 and updates the comment', () => {
				const idToUpdate = testComments[0].id;

				const commentToUpdate = testComments.filter(
					comment => comment.id === idToUpdate
				);
				const expectedComment = testComments[idToUpdate];

				return supertest(app)
					.patch(`/api/comments/${idToUpdate}`)
					.send(commentToUpdate)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then(res =>
						supertest(app)
							.get(`/api/comments/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
							.expect(res => {
								expect(res.body).to.have.property('id');
								expect(res.body.text).to.eql(expectedComment.text);
							})
					);
			});

			it(`responds with 400 when no required fields supplied`, () => {
				const idToUpdate = 2;
				return supertest(app)
					.patch(`/api/comments/${idToUpdate}`)
					.send({ irrelevantField: 'foo' })
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(400, {
						error: {
							message: `Update must contain text and rating`
						}
					});
			});

			it(`responds with 204 when updating only a subset of fields`, () => {
				const idToUpdate = testComments[0].id;
				const commentToUpdate = {
					text: 'updated comment text'
				};

				const expectedComment = testComments[idToUpdate];

				return supertest(app)
					.patch(`/api/comments/${idToUpdate}`)
					.send({
						...commentToUpdate,
						fieldToIgnore: 'should not be in GET response'
					})
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204)
					.then(res =>
						supertest(app)
							.get(`/api/notes/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
							.expect(res => {
								expect(res.body).to.have.property('id');
								expect(res.body.text).to.eql(expectedComment.text);
							})
					);
			});
		});
	});
});
