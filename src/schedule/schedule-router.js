const express = require('express');
const path = require('path');
const logger = require('../logger');

const scheduleService = require('./schedule-service');

// for protected endpoints
const { requireAuth } = require('../middleware/jwt-auth');

const scheduleRouter = express.Router();
const jsonBodyParser = express.json();

// all endpoints are protected

scheduleRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		// get all schedule records for loginUserId

		// here we will ALWAYS have the loginUserId because the client makes this request with the Auhorization Header containing the AuthToken used by jwt-auth to find the logged in user's user record

		const loginUserId = req.user.id; // from jwt-auth
		const knexInstance = req.app.get('db');

		scheduleService
			.getSchedule(knexInstance, loginUserId)
			.then(schedule => {
				if (!schedule) {
					logger.error({
						message: `Schedule with for loginUserId ${loginUserId} not found.`,
						request: `${req.originalUrl}`,
						method: `${req.method}`,
						ip: `${req.ip}`
					});
					return res.status(404).json({
						message: `Schedule with for loginUserId ${loginUserId} not found.`
					});
				}
				res.json(schedule.map(scheduleService.serializeSchedule));
			})
			.catch(next);
	});

scheduleRouter
	.route('/:id') // either session_id for post OR schedule_id for delete
	.all(requireAuth)
	.delete((req, res, next) => {
		const { id } = req.params;
		const knexInstance = req.app.get('db');

		scheduleService
			.deleteSchedule(knexInstance, id)
			.then(numRowsAffected => {
				logger.info({
					message: `Schedule with id ${id} deleted.`,
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
	.post(requireAuth, jsonBodyParser, (req, res, next) => {
		const { id } = req.params;
		const newScheduleItem = { session_id: id };
		const knexInstance = req.app.get('db');

		for (const field of ['id']) {
			if (!req.params[field]) {
				logger.error({
					message: `${field} is required`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});
				return res.status(400).send({
					message: `'${field}' is required`
				});
			}
		}

		// from jwt-auth
		// req.user is set in middleware/basic-auth
		// this is the login user id
		newScheduleItem.user_id = req.user.id;
		let loginUserId = req.user.id;

		scheduleService
			.insertScheduleIfNotExists(knexInstance, newScheduleItem, loginUserId, id)
			.then(schedule => {
				logger.info({
					message: `Session_id ${schedule.session_id} added to schedule.`,
					request: `${req.originalUrl}`,
					method: `${req.method}`,
					ip: `${req.ip}`
				});
				res
					.status(201)
					.location(path.posix.join(req.originalUrl))
					.json(scheduleService.serializeSchedule(schedule));
			})
			.catch(next);
	});

module.exports = scheduleRouter;
