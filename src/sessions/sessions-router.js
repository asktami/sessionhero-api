const express = require('express');
const path = require('path');
const logger = require('../logger');

const sessionService = require('./sessions-service');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const sessionRouter = express.Router();

// UNprotected endpoint (getAllSessions)
sessionRouter.route('/').get((req, res, next) => {
	const knexInstance = req.app.get('db');
	sessionService
		.getAllSessions(knexInstance)
		.then(sessions => {
			// NOTE: this is the same as:
			// res.json(
			// 	sessions.map(session => sessionService.serializeSession(session))
			res.json(sessions.map(sessionService.serializeSession));
		})
		.catch(next);
});

// protected endpoint
sessionRouter
	.route('/:sessionId')
	.all(requireAuth)
	.all(checkSessionExists)
	.all((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');
		sessionService
			.getById(knexInstance, id)
			.then(session => {
				res.session = session;
				next();
			})
			.catch(next);
	})
	.get((req, res) => {
		res.json(sessionService.serializeSession(res.session));
	});

// protected endpoint
sessionRouter
	.route('/:sessionId/comments/')
	.all(requireAuth)
	.all(checkSessionExists)
	.get((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');

		sessionService
			.getCommentsForSession(knexInstance, id)
			.then(comments => {
				res.json(comments.map(sessionService.serializeSessionComments));
			})
			.catch(next);
	});

async function checkSessionExists(req, res, next) {
	const { id } = req.params;
	const knexInstance = req.app.get('db');
	try {
		const session = await sessionService.getById(knexInstance, id);

		if (!session) {
			logger.error({
				message: `Session with id ${id} not found.`,
				request: `${req.originalUrl}`,
				method: `${req.method}`,
				ip: `${req.ip}`
			});

			return res.status(404).json({
				error: `Session doesn't exist`
			});
		}

		res.session = session;
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = sessionRouter;
