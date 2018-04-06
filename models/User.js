// Require mongoose to create the models
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the user schema with several things
const userSchema = new Schema({
	email: { 
		type: String,
		unique: true, 
		required: true,
		match: [/.+@.+\..+/, "Please enter a valid e-mail address"]
	},
	photos: { type: [Schema.Types.ObjectId], ref: "Photo" }
});

// Define a name for the model
const User = mongoose.model("User", userSchema);

// Export the model
module.exports = User;