const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Comments Endpoints', function() {
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

		// NOT AN ENDPOINT
		// it(`responds with 401 Unauthorized for GET /api/comments`, () => {
		// 	return supertest(app)
		// 		.get('/api/comments')
		// 		.expect(401, { error: 'Unauthorized request' });
		// });

		it(`responds with 401 Unauthorized for POST /api/comments`, () => {
			return supertest(app)
				.post('/api/comments')
				.send({
					comment: 'test comment',
					rating: 1
				})
				.expect(401, { error: 'Missing bearer token' });
		});

		it(`responds with 401 Unauthorized for GET /api/comments/:commentId`, () => {
			const comment = testComments[0];
			return supertest(app)
				.get(`/api/comments/${comment.id}`)
				.expect(401, { error: 'Missing bearer token' });
		});

		it(`responds with 401 Unauthorized for DELETE /api/comments/:commentId`, () => {
			const comment = testComments[0];
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
				const commentId = 1;
				const expectedComment = helpers.makeExpectedComment(testComments[0]);

				console.log('----------- expectedComment id = ', commentId);
				console.log('expectedComment = ', expectedComment);

				return supertest(app)
					.get(`/api/comments/${commentId}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(res => {
						expect(res.body.comment).to.eql(expectedComment.comment);
						expect(res.body).to.have.property('id');
					});
			});
		});
	});

	// POST SESSION COMMENTS ************************************
	describe(`POST /api/comments/`, () => {
		beforeEach('insert comments', () =>
			helpers.seedTables(db, testUsers, testSessions, testComments)
		);

		it(`creates a comment, responding with 201 and the new comment`, () => {
			let testComment = testComments[0];
			const newComment = {
				comment: testComment.comment,
				rating: testComment.rating,
				session_id: testComment.session_id,
				user_id: testComment.user_id
			};
			return supertest(app)
				.post(`/api/comments/`)
				.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
				.send(newComment)
				.expect(201)
				.expect(res => {
					expect(res.body).to.have.property('id');
					expect(res.body.comment).to.eql(newComment.comment);
					expect(Number(res.body.rating)).to.eql(Number(newComment.rating));
					expect(res.body.session_id).to.eql(newComment.session_id);
					expect(res.body.user_id).to.eql(newComment.user_id);
					expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`);
				});
		});

		// loop thru required fields and test what happens when each is missing
		const requiredFields = ['comment', 'rating'];

		requiredFields.forEach(field => {
			let testComment = testComments[0];
			let sessionId = testComment.session_id;

			const newComment = {
				comment: testComment.comment,
				rating: testComment.rating,
				session_id: testComment.session_id,
				user_id: testComment.user_id
			};

			it(`responds with 400 and an error message when the '${field}' is missing`, () => {
				delete newComment[field];

				return supertest(app)
					.post(`/api/comments/`)
					.send(newComment)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(400, {
						error: `Missing '${field}' in request body`
					});
			});
		});

		// test what happens when try to post xss attack
		context(`Given an XSS attack comment`, () => {
			const {
				maliciousComment,
				expectedComment
			} = helpers.makeMaliciousComment();

			beforeEach('insert malicious comment', () => {
				return db.into('comments').insert([maliciousComment]);
			});

			let idToFind = maliciousComment.id;

			it('removes XSS attack content', () => {
				return supertest(app)
					.get(`/api/comments/${idToFind}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(200)
					.expect(res => {
						expect(res.body[0].comment).to.eql(expectedComment.comment);
						expect(res.body[0].rating).to.eql(expectedComment.rating);
					});
				// .expect(res => {
				// 	console.log('-------- XXX maliciousComment 200 res ', res);
				// })
			});
		});
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

			it('responds with 204 and removes the comment', () => {
				const idToRemove = 2;

				const expectedComment = testComments.filter(
					comment => comment.id !== idToRemove
				);

				return supertest(app)
					.delete(`/api/comments/${idToRemove}`)
					.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
					.expect(204);
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
					.expect(404, { error: `Comment Not Found` });
				// .expect(res => {
				// 	console.log('-------- PATCH 404 res ', res);
				// })
			});
		});

		context('Given there are comments in the database', () => {
			beforeEach('insert comments', () =>
				helpers.seedTables(db, testUsers, testSessions, testComments)
			);

			it('responds with 204 and updates the comment', () => {
				const idToUpdate = 2;

				const commentToUpdate = {
					comment: 'updated comment',
					rating: 2,
					session_id: 'BUS04'
				};

				const expectedComment = {
					...testComments[idToUpdate - 1],
					...commentToUpdate
				};

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
								expect(res.body.comment).to.eql(expectedComment.comment);
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
						error: `Update must contain comment and rating`
					});
			});

			it(`responds with 204 when updating only a subset of fields`, () => {
				const idToUpdate = 2;

				const commentToUpdate = {
					comment: 'updated comment'
				};

				const expectedComment = {
					...testComments[idToUpdate - 1],
					...commentToUpdate
				};

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
							.get(`/api/comments/${idToUpdate}`)
							.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
							.expect(res => {
								expect(res.body).to.have.property('id');
								expect(res.body.comment).to.eql(expectedComment.comment);
							})
					);
			});
		});
	});
});
