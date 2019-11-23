const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');

const sessionService = require('./sessions-service');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const sessionRouter = express.Router();

sessionRouter.route('/').get((req, res, next) => {
	sessionService
		.getAllSessions(req.app.get('db'))
		.then(sessions => {
			res.json(sessions.map(sessionService.serializeSessions));
		})
		.catch(next);
});

// protected endpoint
sessionRouter
	.route('/:sessionId')
	.all(requireAuth)
	.all(checkSessionExists)
	.get((req, res) => {
		res.json(sessionService.serializeSession(res.session));
	});

// protected endpoint
sessionRouter
	.route('/:sessionId/comments/')
	.all(requireAuth)
	.all(checkSessionExists)
	.get((req, res, next) => {
		sessionService
			.getCommentsForSession(req.app.get('db'), req.params.sessionId)
			.then(comments => {
				res.json(comments.map(sessionService.serializeSessionComments));
			})
			.catch(next);
	});

/* async/await syntax for promises */
async function checkSessionExists(req, res, next) {
	try {
		const session = await sessionService.getById(
			req.app.get('db'),
			req.params.sessionId
		);

		if (!session)
			return res.status(404).json({
				error: `Session doesn't exist`
			});

		res.session = session;
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = sessionRouter;
