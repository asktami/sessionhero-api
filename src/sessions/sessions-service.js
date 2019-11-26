// methods to store database transactions
const xss = require('xss');
// const Treeize = require('treeize');
let table = 'sessions';

const sessionService = {
	getAllSessions(db, loginUserId) {
		console.log('LOGIN USER ID = ', loginUserId);
		if (loginUserId) {
			console.log('********************');
			console.log('********************');

			console.log('******************** sessions WITH id = ');

			var ts = new Date();
			console.log(ts.toDateString());
			console.log(ts.toTimeString());

			console.log('********************');
			console.log('********************');

			// return db(
			// 	db(table)
			// 		.select('sessions.*')
			// 		.as('sessions')
			// )
			// 	.leftJoin(
			// 		db('schedule')
			// 			.select('schedule.*')
			// 			.where('schedule.user_id', loginUserId)
			// 			.as('schedule')
			// 	)
			// 	.on('sessions.id', 'schedule.session_id');

			return (
				db
					.select(
						'sessions.*',
						'users.id as users_id',
						'users.fullname',
						'schedule.id as schedules_id',
						'schedule.user_id',
						'schedule.session_id'
					)
					.from(table)
					.leftJoin('schedule', 'sessions.id', 'schedule.session_id')
					.leftJoin('users', 'users.id', 'schedule.user_id')
					// .where('schedule.user_id', loginUserId)
					.orderBy('sessions.date', 'asc')
					.orderBy('sessions.time_start', 'asc')
					.orderBy('sessions.track', 'asc')
			);
		} else {
			console.log('********************');
			console.log('********************');

			console.log('******************** sessions without id = ');

			var ts = new Date();
			console.log(ts.toDateString());
			console.log(ts.toTimeString());

			console.log('********************');
			console.log('********************');

			return db
				.select('*')
				.from(table)
				.orderBy('sessions.date', 'asc')
				.orderBy('sessions.time_start', 'asc')
				.orderBy('sessions.track', 'asc');
		}
	},

	// get schedule records for logInUserId, join to user table and session table
	getAllSessionsXXX(knex, loginUserId) {
		return knex
			.select('*')
			.from(table)
			.leftJoin('schedule', 'sessions.id', 'schedule.session_id')
			.leftJoin('users', 'users.id', 'schedule.user_id')
			.where('schedule.user_id', loginUserId);
	},

	getById(db, id) {
		// return sessionService
		// 	.getAllSessions(db)
		// 	.where('sessions.id', id)
		// 	.first();

		return db
			.select(
				'sessions.*',
				'users.id as users_id',
				'users.fullname',
				'schedule.id as schedules_id',
				'schedule.user_id',
				'schedule.session_id'
			)
			.from(table)
			.leftJoin('schedule', 'sessions.id', 'schedule.session_id')
			.leftJoin('users', 'users.id', 'schedule.user_id')
			.where('sessions.id', id)
			.orderBy('sessions.date', 'asc')
			.orderBy('sessions.time_start', 'asc')
			.orderBy('sessions.track', 'asc');
	},

	getCommentsForSession(db, sessionId) {
		return db
			.from('comments AS com')
			.select(
				'com.id',
				'com.rating',
				'com.text',
				'com.date_created',
				...userFields
			)
			.where('com.session_id', sessionId)
			.leftJoin('users AS usr', 'com.user_id', 'usr.id')
			.groupBy('com.id', 'usr.id');
	},

	serializeSessions(sessions) {
		return sessions.map(this.serializeSession);
	},

	serializeSession(session) {
		return session;
		//const sessionTree = new Treeize();

		// Some light hackiness to allow for the fact that `treeize`
		// only accepts arrays of objects, and we want to use a single
		// object.
		// const sessionData = sessionTree.grow([session]).getData()[0];

		// return {
		// 	id: sessionData.id,
		// 	track: sessionData.track,
		// 	day: sessionData.day,
		// 	date: sessionData.date,
		// 	time_start: sessionData.time_start,
		// 	time_end: sessionData.time_end,
		// 	location: sessionData.location,
		// 	name: sessionData.name,
		// 	description: sessionData.description,
		// 	background: sessionData.background,
		// 	objective_1: sessionData.objective_1,
		// 	objective_2: sessionData.objective_2,
		// 	objective_3: sessionData.objective_3,
		// 	objective_4: sessionData.objective_4,
		// 	speaker: sessionData.speaker,
		// 	// user: sessionData.user || {},
		// 	number_of_comments: Number(sessionData.number_of_comments) || 0,
		// 	average_comment_rating:
		// 		Math.round(sessionData.average_comment_rating) || 0
		// };
	},

	serializeSessionComments(comments) {
		return comments.map(this.serializeSessionComment);
	},

	serializeSessionComment(comment) {
		const commentTree = new Treeize();

		// Some light hackiness to allow for the fact that `treeize`
		// only accepts arrays of objects, and we want to use a single
		// object.
		const commentData = commentTree.grow([comment]).getData()[0];

		return {
			id: commentData.id,
			text: xss(commentData.text),
			rating: xss(commentData.rating),
			session_id: commentData.session_id,
			user: commentData.user || {},
			date_created: commentData.date_created
		};
	}
};

const userFields = [
	'usr.id AS user:id',
	'usr.user_name AS user:username',
	'usr.full_name AS user:fullname',
	'usr.date_created AS user:date_created',
	'usr.date_modified AS user:date_modified'
];

module.exports = sessionService;
