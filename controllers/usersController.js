const db = require("../models");

module.exports = {
	// get: function(req, res) {
	// 	db.User.findOne({email: req.body.email})
	// 		.then(foundUser => res.json(foundUser))
	// 		.catch(err => res.status(422).json(err));
	// },
	login: function(req, res) {
		db.User
			.insertOne(req.body)
			.then(result => {
				if(result.acknowledged) { //the user was new
					db.User.findById(result.id)
						.then(newUser => res.json(newUser))
						.catch(err => res.status(422).json(err));
				} else { //find and return the user
					db.User.findOne({email: req.body.email})
						.then(foundUser => res.json(foundUser))
						.catch(err => res.status(422).json(err));
				}
			}).catch(err => res.status(422).json(err));
	},
	getPhotos: function(req, res) {

	}
};