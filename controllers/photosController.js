// Requires the models to be used in the controllers
const db = require("../models");

// Exports the following functions
module.exports = {
  // Adds the photo to the db using the user's email address
  add: function(req, res) {
    db.User.findOne({email: req.body.email})
      .then(user => {
        // Creates the photo object to be sent to the db
        console.log("Creating a photo object before pushing it to DB");
        var photo = {
          image: req.body.image,
          fileType: req.body.fileType,
          location: req.body.location,
          user: user.id,
          title: req.body.title,
          description: req.body.description,
          verified: req.body.verified
        };
        // Adds the photo to the db 
        db.Photo.create(photo)
          .then(createdPhoto => {
            // Once completed, log the following message
            console.log('Photo in the DB!');
            // Updates the user in the db with the ID of the image created 
            db.User
              .findOneAndUpdate({email:req.body.email},{$push:{photos: createdPhoto.id}})
              .then(updatedUser => res.json(updatedUser))
              .catch(err => {console.log(err)});
          })
      });
  },
  
  // Removes the photo (not being used at the moment)
  remove: function(req, res) {
    db.Photo.findOne({id:req.body.id}).then(photo =>{
      photo.remove();
    }).then(photo => { // just in case it doesn't cascade delete...
      photo.comments.forEach(comment => {
        db.Comment.findOne({id:comment.id}).then(comment=> {
          comment.remove();
        }).catch(err => {
          console.log(err);
        });
      });
      //send the deleted photo back in case the client wants to do something with it
      res.json(photo);
    }).catch(err => {
      console.log(err);
    });
  },
  
  // Get the photo with the comments to display the detailed screen
  getWithComments: function(req, res) {

    // Preps the object to send to the front-end
    let photoWithComments = {
      user: '',
      photo: null,
      comments: []
    };

    // Finds the photo based on the ID sent in the URL
    db.Photo.findOne({_id: req.params.id})
      .then(photo =>{
        // Sets the received photo to the response object 
        photoWithComments.photo = photo;

        // get all of the photo's comments
        db.User.findOne({_id: photo.user}).then(user => {
          photoWithComments.user = user.email;
          
          // Recursive function call to create an array of all the comments for that pic
          getAllComments(photo.comments, 0, photoWithComments, res);
        })
      }).catch(err => {
        console.log(err);
      });
  },
  
  // Function to show images in a given location
  findByLocation: function(req, res) {
    if(req.body.location === ' ') {
      console.log("Received request for photos with no location given, returning empty array");
      res.json([]);
    } else {
      // process.stdout.write("Given location: ");
      // console.log(req.body.location);
      
      // Finds all photos in the db
      db.Photo.find().then(photos => {
        var results = [];
        var requestLocation = parseLocation(req.body.location);
        
        // Calls a function to determine proximity for each photo in the db
        photos.forEach(photo => {
          // If the photo in the db is within the range of the requested location, push it into an array
          if(global_dist(requestLocation, parseLocation(photo.location), req.body.range)) {
            results.push(photo);
          }
        });
        
        res.json(results); // Return the photos found in the range
      }).catch(err => {
        res.json(err);
      });
    }
  },
  

  findByLocationAndDate: function(req, res) { //THIS FUNCTION WILL NOT BE INCLUDED IN APP PROTOTYPE
    this.findByLocation(req, res);
  },
  
  // Function to add comments to a picture
  addComment: function(req, res) {
    // get the email ID of the user who made the comment
    db.User.findOne({email: req.body.email})
      .then(user => {

        // Prep the comment object to send to the db
        var comment = {
          body: req.body.body,
          user: user.id
        };
        
        // create the comment in the db
        db.Comment.create(comment)
          .then(newComment => {
            // add the comment to the photo
            db.Photo.findOneAndUpdate(
              { _id: req.body.photoID },
              { $push: {comments: newComment.id} },
              { new: true } // it returns the updated photo, instead of its original state
            ).then(photoWithAddedComment => {
              res.json(newComment);
            }).catch(err => {
              console.log(err);
            })
          });
      });
    
  },
  
  // Removes comment (not implemented yet) 
  removeComment: function(req, res) {
    db.Comment.findOne({id: req.body.id})
      .then(comment => {
        comment.remove(); // should cascade delete from its photo's comment list
      });
  }
};

//helper function that recursively fills an array with the comments of a given photo.
//takes an array of the comment ids, the index of the current comment in that array,
//the object that holds the array to be filled with the comment objects, 
//and the response to be sent back to the server
function getAllComments(ids, index, photoWithComments, res){
  
  if(index === ids.length){
    // Send the response once all comments have been added to the array
    res.json(photoWithComments);

  } else{
    // Find the comments based on the ID found in the array
    db.Comment.findOne({_id: ids[index]})
    .then(comment =>{
      // Create and object to send to the front end
      var commentWithUserName = {
        "_id": comment._id,
        "body": comment.body,
        "user": comment.user,
        "userName": ''
      }

      // Find the user's email address based on the ID
      db.User.findOne({_id: comment.user}).then(user => {
        commentWithUserName["userName"] = user.email;

        // Push the comment object to the array to send to the front-end
        photoWithComments.comments.push(commentWithUserName);

        getAllComments(ids, index + 1, photoWithComments, res); // Recursive call to go through all the comments
      })
    });
  }
}

// Function to parse thhe location string to extract the lat and long
function parseLocation(locationString) {
  var location = locationString.split(" ");
  // console.log("Parsed location: " + location);
  var lat = parseFloat(location[0]);
  var long = parseFloat(location[1]);
  
  //check to make sure lat and long are valid
  return [lat, long];
}

// Function to calculate if a given location is within a given range
function global_dist(pos1, pos2, range){
  var st_long = pos1[1];
  var st_lat = pos1[0];
  var f_long = pos2[1];
  var f_lat = pos2[0];

  // Function to convert degrees into radians
  function degrees_to_radians(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
  }
  
  const earth_rad = 6371;
  let ch_lat = Math.abs(f_lat - st_lat);
  ch_lat = degrees_to_radians(ch_lat);
  let ch_long = Math.abs(f_long- st_long);
  ch_long = degrees_to_radians(ch_long);
  
  const a = Math.pow(Math.sin(ch_lat/2),2) + 
  (Math.cos(st_lat)*Math.cos(f_lat)*Math.pow(Math.sin(ch_long/2),2));

  const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  const ans = earth_rad * c;

  // If the distance is within the given range, return true; else, return false
  if (ans <= range){
    return true;
  } else {
    return false;
  }
}
