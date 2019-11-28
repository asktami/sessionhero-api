const xss = require('xss');
let table = 'sessions';

const sessionService = {
	getAllSessions(db, loginUserId = '') {
		if (loginUserId) {
			return db(
				db('sessions')
					.select(
						'sessions.id as id',
						'sessions.id as session_id', // so that has field with same name as in schedule
						'track',
						'day',
						'date',
						'time_start',
						'time_end',
						'location',
						'name',
						'description',
						'background',
						'objective_1',
						'objective_2',
						'objective_3',
						'objective_4',
						'speaker'
					)
					.as('sessions')
			)
				.leftJoin(
					db('schedule')
						.select(
							'schedule.id as schedule_id',
							'schedule.user_id as user_id',
							'schedule.session_id as schedule_session_id'
						)
						.where('schedule.user_id', loginUserId)
						.as('schedule'),
					'sessions.id',
					'schedule.schedule_session_id'
				)
				.orderBy('date', 'asc')
				.orderBy('time_start', 'asc')
				.orderBy('track', 'asc');
		} else {
			return db
				.from(table)
				.select(
					'sessions.id as id',
					'sessions.id as session_id', // so that has field with same name as in schedule
					'track',
					'day',
					'date',
					'time_start',
					'time_end',
					'location',
					'name',
					'description',
					'background',
					'objective_1',
					'objective_2',
					'objective_3',
					'objective_4',
					'speaker'
				)
				.orderBy('date', 'asc')
				.orderBy('time_start', 'asc')
				.orderBy('track', 'asc');
		}
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
		return {
			id: session.id,
			session_id: session.session_id, // so that has field with same name as in schedule
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
			user_id: session.user_id,
			schedule_id: session.schedule_id
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
