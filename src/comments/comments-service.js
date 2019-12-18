const xss = require('xss');
let table = 'comments';

const commentService = {
	// whenever get comment,
	// join comment record with (created by) user record
	getById(knex, id) {
		return knex
			.from(`comments as comm`)
			.select(
				'comm.id',
				'comm.comment',
				'comm.rating',
				'comm.date_created',
				'comm.date_modified',
				'comm.session_id',
				knex.raw(
					`row_to_json(
				  (SELECT tmp FROM (
					SELECT
					  usr.id,
					  usr.username,
					  usr.fullname,
					  usr.date_created,
					  usr.date_modified
				  ) tmp)
				) AS "user"`
				)
			)
			.leftJoin('users AS usr', 'comm.user_id', 'usr.id')
			.where('comm.id', id)
			.first();
	},

	// after insert, return comments record joined to users record
	// with all fields from comments and users tables
	insertComment(knex, newComment) {
		return knex
			.insert(newComment)
			.into(table)
			.returning('*')
			.then(([comment]) => comment)
			.then(comment => commentService.getById(knex, comment.id));
	},

	deleteComment(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},
	updateComment(knex, id, newCommentData) {
		return knex(table)
			.where({ id })
			.update(newCommentData);
	},

	serializeComment(comment) {
		const { user } = comment;
		return {
			id: comment.id,
			user_id: user.id,
			comment: xss(comment.comment),
			rating: xss(comment.rating),
			session_id: comment.session_id,
			date_created: comment.date_created,
			date_modified: comment.date_modified,
			fullname: user.fullname
		};
	}
};

module.exports = commentService;
