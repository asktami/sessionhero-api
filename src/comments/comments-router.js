const express = require('express');
const path = require('path');
const logger = require('../logger');
const commentService = require('./comments-service');
const { getCommentValidationError } = require('./comment-validator');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const commentRouter = express.Router();
const jsonBodyParser = express.json();

// all endpoints are protected
// requireAuth is how we capture loggedId userId = req.user.id

// get the user_id from the authorization header

// post/save comment
commentRouter.route('/').post(requireAuth, jsonBodyParser, (req, res, next) => {
	const { session_id, comment, rating } = req.body;
	const newComment = { session_id, comment, rating };

	const knexInstance = req.app.get('db');

	for (const [key, value] of Object.entries(newComment))
		if (value == null) {
			logger.error({
				message: `${key} is required`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});

			return res.status(400).json({
				message: `Missing '${key}' in request body`
			});
		}

	const error = getCommentValidationError(newComment);
	if (error) {
		logger.error({
			message: `POST Validation Error`,
			request: `${req.originalUrl}`,
			method: `${req.method}`,
			ip: `${req.ip}`
		});
		return res.status(400).send(error);
	}

	// req.user is set in middleware/basic-auth
	// this is the login user_id used to post comments
	newComment.user_id = req.user.id; // from jwt-auth

	commentService
		.insertComment(knexInstance, newComment)
		.then(comment => {
			logger.info({
				message: `Comment with id ${comment.id} created.`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});

			res
				.status(201)
				.location(path.posix.join(req.originalUrl, `/${comment.id}`))
				.json(commentService.serializeComment(comment));
		})
		.catch(next);
});

// get comment to be updated/deleted
commentRouter
	.route('/:id')
	.all(requireAuth)
	.all(checkCommentExists)
	.get((req, res) => {
		res.json(commentService.serializeComment(res.comment));
	})
	.delete((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');
		commentService
			.deleteComment(knexInstance, id)
			.then(numRowsAffected => {
				logger.info({
					message: `Comment with id ${id} deleted.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});

				// need to send back message instead of .end()
				res.status(204).json({
					message: true
				});
			})
			.catch(next);
	})
	.patch(jsonBodyParser, (req, res, next) => {
		const knexInstance = req.app.get('db');
		const { id } = req.params;
		const { comment, rating } = req.body;
		const commentToUpdate = { comment, rating };

		const numberOfValues = Object.values(commentToUpdate).filter(Boolean)
			.length;
		if (numberOfValues === 0) {
			logger.error({
				message: `Invalid update without required fields: comment and rating`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});
			return res.status(400).json({
				message: `Update must contain comment and rating`
			});
		}

		const error = getCommentValidationError(commentToUpdate);
		if (error) {
			logger.error({
				message: `PATCH Validation Error`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});
			return res.status(400).send(error);
		}

		commentService
			.updateComment(knexInstance, id, commentToUpdate)
			.then(numRowsAffected => {
				res.status(204).end();
			})
			.catch(next);
	});

/* async/await syntax for promises */
async function checkCommentExists(req, res, next) {
	const { id } = req.params;
	try {
		const comment = await commentService.getById(
			req.app.get('db'),
			req.params.id
		);

		if (!comment) {
			logger.error({
				message: `Comment with id ${id} not found.`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});

			return res.status(404).json({
				message: `Comment Not Found`
			});
		}

		res.comment = comment;
		next();
	} catch (error) {
		next(error);
	}
}
module.exports = commentRouter;
