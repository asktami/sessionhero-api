// methods to store database transactions
const xss = require('xss');
const Treeize = require('treeize');
let table = 'sessions';

const sessionService = {
	// XgetAllSessions(db) {
	// 	return db
	// 		.select('*')
	// 		.from(table)
	// 		.orderBy('date', 'asc')
	// 		.orderBy('time_start', 'asc')
	// 		.orderBy('track', 'asc');
	// },

	// XgetById(db, id) {
	// 	return db
	// 		.select('*')
	// 		.from(table)
	// 		.where('id', id)
	// 		.first();
	// },

	// XgetCommentsForSession(db, id) {
	// 	return db
	// 		.from('comments AS com')
	// 		.select(
	// 			'com.id',
	// 			'com.rating',
	// 			'com.text',
	// 			'com.date_created',
	// 			'usr.id as users.id',
	// 			'usr.username'
	// 		)
	// 		.where('com.session_id', id)
	// 		.leftJoin('users AS usr', 'com.user_id', 'usr.id')
	// 		.groupBy('com.id', 'usr.id');
	// },

	// XserializeSessionComment(comment) {
	// 	const { user } = comment;
	// 	return {
	// 		id: comment.id,
	// 		user_id: comment.user_id,
	// 		text: xss(comment.text),
	// 		rating: xss(comment.rating),
	// 		session_id: comment.session_id,
	// 		date_created: new Date(comment.date_created),
	// 		user: {
	// 			id: user.id,
	// 			username: user.username,
	// 			fullname: user.fullname,
	// 			date_created: new Date(user.date_created),
	// 			date_modified: new Date(user.date_modified) || null
	// 		}
	// 	};
	// }

	// ****************************************

	getAllSessions(db) {
		return db
			.from(table)
			.select(
				'sessions.*',
				db.raw(`count(DISTINCT comm) AS number_of_comments`),
				db.raw(
					`json_strip_nulls(
				json_build_object(
				  'id', usr.id,
				  'username', usr.username,
				  'fullname', usr.fullname,
				  'date_created', usr.date_created,
				  'date_modified', usr.date_modified
				)
			  ) AS "user"`
				)
			)
			.leftJoin('comments AS comm', 'sessions.id', 'comm.session_id')
			.leftJoin('users AS usr', 'comm.user_id', 'usr.id')
			.orderBy('date', 'asc')
			.orderBy('time_start', 'asc')
			.orderBy('track', 'asc')
			.groupBy('sessions.id', 'usr.id');
	},

	getById(db, id) {
		return sessionService
			.getAllSessions(db)
			.where('sessions.id', id)
			.first();
	},

	getCommentsForSession(db, id) {
		return db
			.from('comments AS comm')
			.select(
				'comm.id',
				'comm.text',
				'comm.rating',
				'comm.user_id',
				'comm.session_id',
				'comm.date_created',
				db.raw(
					`json_strip_nulls(
				row_to_json(
				  (SELECT tmp FROM (
					SELECT
					  usr.id,
					  usr.username,
					  usr.fullname,
					  usr.date_created,
					  usr.date_modified
				  ) tmp)
				)
			  ) AS "user"`
				)
			)
			.where('comm.session_id', id)
			.leftJoin('users AS usr', 'comm.user_id', 'usr.id')
			.groupBy('comm.id', 'usr.id');
	},

	serializeSession(session) {
		const { user } = session;
		return {
			id: session.id,
			track: session.track,
			day: session.day,
			date: session.date,
			time_start: session.time_start,
			time_end: session.time_end,
			location: session.location,
			name: session.name,
			description: session.description,
			background: session.background,
			objective_1: session.objective_1,
			objective_2: session.objective_2,
			objective_3: session.objective_3,
			objective_4: session.objective_4,
			speaker: session.speaker,
			number_of_comments: Number(session.number_of_comments) || 0,
			user: {
				id: user.id,
				username: user.username,
				fullname: user.fullname,
				date_created: new Date(user.date_created),
				date_modified: new Date(user.date_modified) || null
			}
		};
	},

	XXXserializeSessionComment(comment) {
		const { user } = comment;
		return {
			id: comment.id,
			user_id: comment.user_id,
			session_id: comment.session_id,
			text: xss(comment.text),
			rating: xss(comment.rating),
			date_created: new Date(comment.date_created),
			user: {
				id: user.id,
				username: user.username,
				fullname: user.fullname
			}
		};
	},

	serializeSessionComment(comment) {
		const { user } = comment;
		return {
			id: comment.id,
			user_id: comment.user_id,
			text: xss(comment.text),
			rating: xss(comment.rating),
			session_id: comment.session_id,
			date_created: new Date(comment.date_created),
			user: {
				id: user.id,
				username: user.username,
				fullname: user.fullname,
				date_created: new Date(user.date_created),
				date_modified: new Date(user.date_modified) || null
			}
		};
	}
};

module.exports = sessionService;
