// methods to store database transactions
const xss = require('xss');
const Treeize = require('treeize');
let table = 'sessions';

const sessionService = {
	getAllSessions(db) {
		return db
			.from('sessions AS ses')
			.select(
				'*',
				...userFields,
				db.raw(`count(DISTINCT com) AS number_of_comments`),
				db.raw(`AVG(com.rating) AS average_comment_rating`)
			)
			.leftJoin('comments AS com', 'ses.id', 'com.thing_id')
			.leftJoin('users AS usr', 'ses.user_id', 'usr.id')
			.groupBy('ses.id', 'usr.id');
	},

	getById(db, id) {
		return sessionService
			.getAllSessions(db)
			.where('ses.id', id)
			.first();
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
			.where('com.sessionId', sessionId)
			.leftJoin('users AS usr', 'com.userId', 'usr.id')
			.groupBy('com.id', 'usr.id');
	},

	serializeSessions(sessions) {
		return sessions.map(this.serializeSession);
	},

	serializeSession(session) {
		const sessionTree = new Treeize();

		// Some light hackiness to allow for the fact that `treeize`
		// only accepts arrays of objects, and we want to use a single
		// object.
		const sessionData = sessionTree.grow([session]).getData()[0];

		return {
			id: sessionData.id,
			track: xss(sessionData.track),
			day: xss(sessionData.day),
			date: xss(sessionData.date),
			time_start: xss(sessionData.time_start),
			time_end: xss(sessionData.time_end),
			location: xss(sessionData.location),
			name: xss(sessionData.name),
			description: xss(sessionData.description),
			background: xss(sessionData.background),
			objective_1: xss(sessionData.objective_1),
			objective_2: xss(sessionData.objective_2),
			objective_3: xss(sessionData.objective_3),
			objective_4: xss(sessionData.objective_4),
			speaker: sessionData.speaker,
			user: sessionData.user || {},
			number_of_comments: Number(sessionData.number_of_comments) || 0,
			average_comment_rating:
				Math.round(sessionData.average_comment_rating) || 0
		};
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
			sessionId: commentData.sessionId,
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
