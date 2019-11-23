const xss = require('xss');
let table = 'comments';

const commentService = {
	getById(db, id) {
		return db
			.from('comments AS comments')
			.select(
				'comments.id',
				'comments.rating',
				'comments.text',
				'comments.date_created',
				'comments.sessionId',
				'comments.userId',
				db.raw(
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
			.leftJoin('users AS usr', 'comments.userId', 'usr.id')
			.where('comments.id', id)
			.first();
	},

	insertComment(db, newComment) {
		return db
			.insert(newComment)
			.into('comments')
			.returning('*')
			.then(([comment]) => comment)
			.then(comment => commentService.getById(db, comment.id));
	},
	deleteComment(knex, id) {
		return knex(table)
			.where({ id })
			.delete();
	},
	updateComment(knex, id, commentToUpdate) {
		return knex(table)
			.where({ id })
			.update(commentToUpdate);
	},
	serializeComment(comment) {
		return {
			id: comment.id,
			rating: comment.rating,
			text: xss(comment.text),
			sessionId: comment.sessionId,
			date_created: comment.date_created,
			date_modified: comment.date_modified,
			user: comment.user || {}
		};
	}
};

module.exports = commentService;
