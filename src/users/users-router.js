const express = require('express');
const path = require('path');
const userService = require('./users-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.post('/', jsonBodyParser, (req, res, next) => {
	const { username, password, fullname } = req.body;

	for (const field of ['username', 'password', 'fullname']) {
		if (!req.body[field])
			return res.status(400).json({
				error: `Missing '${field}' in request body`
			});
	}

	const usernameError = userService.validateUsername(username);
	if (usernameError) return res.status(400).json({ error: usernameError });

	const passwordError = userService.validatePassword(password);
	if (passwordError) return res.status(400).json({ error: passwordError });

	userService
		.hasUserWithUserName(req.app.get('db'), username)
		.then(hasUserWithUserName => {
			if (hasUserWithUserName)
				return res.status(400).json({ error: `Username already taken` });

			return userService.hashPassword(password).then(hashedPassword => {
				const newUser = {
					username,
					password: hashedPassword,
					fullname,
					date_created: 'now()'
				};

				return userService.insertUser(req.app.get('db'), newUser).then(user => {
					res
						.status(201)
						.location(path.posix.join(req.originalUrl, `/${user.id}`))
						.json(userService.serializeUser(user));
				});
			});
		})
		.catch(next);
});

module.exports = userRouter;
