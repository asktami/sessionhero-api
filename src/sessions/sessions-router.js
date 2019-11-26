const express = require('express');
const path = require('path');
const logger = require('../logger');

const sessionService = require('./sessions-service');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const sessionRouter = express.Router();

// UNprotected endpoint (getAllSessions)
sessionRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		const knexInstance = req.app.get('db');

		// loginUserId will only exist after login
		//in sessions-service IF have loginUserId, use it, otherwise get all schedule records?
		// loginUserId from jwt-auth
		let loginUserId = '';

		if (req.user !== undefined) {
			loginUserId = req.user.id;
		}

		console.log('********************');
		console.log('********************');

		console.log('req.user = ', req.user);
		console.log('sessions-router LOGIN USER ID = ', loginUserId);

		sessionService
			.getAllSessions(knexInstance, loginUserId)
			.then(session => {
				// NOTE: this is the same as:
				// res.json(
				// 	sessions.map(session => sessionService.serializeSession(session))
				res.json(session);
			})
			.catch(next);
	});

// protected endpoint
sessionRouter
	.route('/:id')
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
		res.json(res.session);
		// res.json(sessionService.serializeSession);
	});

// protected endpoint
sessionRouter
	.route('/:id/comments/')
	.all(requireAuth)
	.all(checkSessionExists)
	.get((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');

		sessionService
			.getCommentsForSession(knexInstance, id)
			.then(comments => {
				// res.json(comments.map(comments));
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
		res.status(500).json({ error: error });
		next(error);
	}
}

module.exports = sessionRouter;
