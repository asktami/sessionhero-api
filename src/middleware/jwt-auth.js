const AuthService = require('../auth/auth-service');

// NOTE the jwt token has the logged in user's user_id and username and is used to find the logged in user (via their username), then get their user record from the database

function requireAuth(req, res, next) {
	const authToken = req.get('Authorization') || '';

	let bearerToken;

	if (authToken.toLowerCase().startsWith('none')) {
		// to handle when hit sessionListPage before login
		next();
	} else {
		if (!authToken.toLowerCase().startsWith('bearer ')) {
			return res.status(401).json({ message: 'Missing bearer token' });
		} else {
			bearerToken = authToken.slice(7, authToken.length);
		}

		try {
			const payload = AuthService.verifyJwt(bearerToken);

			AuthService.getUserWithUserName(req.app.get('db'), payload.sub)
				.then(user => {
					if (!user)
						return res.status(401).json({ message: 'Unauthorized request' });

					// NOTE: successfully found logged in user is added to req object
					// this means we can get the logged in user's id from req.user.id

					req.user = user;

					/*
				// NOTE here (for demoUser) req.user =
				{
					"id":1,
					"username":"demoUser",
					"password":"$2a$12$otAlCQST//.2BWkPLhDC4.dCTapcHh6iC7.LLIeRRtAgP/MR.B5CK","fullname":"Demo User","date_created":"2019-11-25T23:44:42.683Z","date_modified":null
				}
				*/

					next();
				})
				.catch(err => {
					// console.error(err);
					next(err);
				});
		} catch (error) {
			res.status(401).json({ message: error + '(Unauthorized request)' });
		}
	}
}

module.exports = {
	requireAuth
};
