const router = require("express").Router();
const usersController = require('../../controllers/usersController');

// "/user/login"
router.route("/login")
  .post(usersController.login)

router.route("/setUsername")
  .post(usersController.setUsername)

// "/user/photos"
router.route("/photos")
	.get(usersController.getPhotos);

module.exports = router;