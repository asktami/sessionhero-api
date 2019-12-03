const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
	// to check that authorization header has the basic token

	const authToken = req.get('Authorization') || '';

	let basicToken;

	if (!authToken.toLowerCase().startsWith('basic ')) {
		return res.status(401).json({ message: 'Missing basic token' });
	} else {
		basicToken = authToken.slice('basic '.length, authToken.length);
	}

	// parse the base64 basic token value out of the header and respond with an error if the username or password aren't present

	const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(
		basicToken
	);

	if (!tokenUserName || !tokenPassword) {
		return res.status(401).json({ message: 'Unauthorized request' });
	}

	// query the database for a user matching this username
	// check if username not found or username found and password is incorrect
	AuthService.getUserWithUserName(req.app.get('db'), tokenUserName)
		.then(user => {
			if (!user) {
				return res.status(401).json({ message: 'Unauthorized request' });
			}
			// add the user object from the database to the request object
			return AuthService.comparePasswords(tokenPassword, user.password).then(
				passwordsMatch => {
					if (!passwordsMatch) {
						return res
							.status(401)
							.json({ message: 'Unauthorized request basic-auth' });
					}
					req.user = user;
					next();
				}
			);
		})
		.catch(next);
}

module.exports = {
	requireAuth
};
