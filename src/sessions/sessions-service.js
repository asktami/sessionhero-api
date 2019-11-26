// methods to store database transactions
const xss = require('xss');
const Treeize = require('treeize');
let table = 'sessions';

const sessionService = {
	getAllSessions(db) {
		return db
			.select('*')
			.from(table)
			.orderBy('date', 'asc')
			.orderBy('time_start', 'asc')
			.orderBy('track', 'asc');
	},

	getById(db, id) {
		console.log('got here - sessions-service getById = ', id);

		// return sessionService
		// 	.getAllSessions(db)
		// 	.where('sessions.id', id)
		// 	.first();

		return db
			.select('*')
			.from(table)
			.where('id', id)
			.first();
	},

	getCommentsForSession(db, id) {
		return db
			.from('comments AS com')
			.select(
				'com.id',
				'com.rating',
				'com.text',
				'com.date_created',
				'usr.id as users.id',
				'usr.username'
			)
			.where('com.session_id', id)
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

	// serializeSessionComment(comment) {
	// 	const commentTree = new Treeize();

	// 	// Some light hackiness to allow for the fact that `treeize`
	// 	// only accepts arrays of objects, and we want to use a single
	// 	// object.
	// 	const commentData = commentTree.grow([comment]).getData()[0];

	// 	return {
	// 		id: commentData.id,
	// 		text: xss(commentData.text),
	// 		rating: xss(commentData.rating),
	// 		session_id: commentData.session_id,
	// 		user: commentData.user || {},
	// 		date_created: commentData.date_created
	// 	};
	// }

	serializeSessionComment(comment) {
		return comment;
		// const { user } = comment;
		// return {
		// 	id: comment.id,
		// 	text: xss(comment.text),
		// 	session_id: comment.session_id,
		// 	date_created: new Date(comment.date_created),
		// 	user: {
		// 		id: user.id,
		// 		user_name: user.username,
		// 		full_name: user.fullname,
		// 		date_created: new Date(user.date_created),
		// 		date_modified: new Date(user.date_modified) || null
		// 	}
		// };
	}
};

module.exports = sessionService;
