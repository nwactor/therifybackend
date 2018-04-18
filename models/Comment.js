// Require mongoose to create the models
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the comment schema with a body and user
const commentSchema = new Schema({
	body: { 
		type: String, 
		required: true,
		validate: [
			function(input) {
				return input.trim().length > 0;
			},
			"Comment cannot be blank."
		]
	},
	user: { type: Schema.Types.ObjectId, ref: "User" }
});

// Define a name for the model
const Comment = mongoose.model("Comment", commentSchema);

// Export the model
module.exports = Comment;
