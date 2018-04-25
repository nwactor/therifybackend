// Require mongoose to create the models
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the photo schema with several things
const photoSchema = new Schema({
	image: { data: Buffer, type: String, required: true },
	// thumbnail: { data: Buffer, type: String, required: true },
	fileType: { type: String, required: true },
	location: { type: String, required: true },
	date: { type: String },
	user: { type: Schema.Types.ObjectId, ref: "User" },
	title: String,
	description: String,
	comments: { type: [Schema.Types.ObjectId], ref: "Comment" },
	rating: Number,
	verified: { type: Boolean, default: false }
});

// Define a name for the model
const Photo = mongoose.model("Photo", photoSchema);

// Export the model
module.exports = Photo;