var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
//var User = mongoose.model('User');
//var User = mongoose.model('users', UserSchema);

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  
  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.get("/posts/:post", function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

router.put("/posts/:post/upvote", auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

router.post("/posts/:post/comments", auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;
  //comment.setAuthor(req.payload.username);
  
  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

router.get('/posts/:post/comments/:comment', function(req, res) {
  res.json(req.comment);
});

router.put("/posts/:post/comments/:comment/upvote", auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});

/*
router.post('/register', function(req, res, next){
	console.log("in index js register");
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
	console.log("in index js register past first check");
	//var user = mongoose.model('users', UserSchema);
  var user = new User();
	console.log("in index js register init user");
  user.username = req.body.username;
	console.log("about to set password");
  user.setPassword(req.body.password);
	console.log("password set");
	
  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});
*/

router.post('/register', function(req, res, next){
	console.log("in index js register");
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
	console.log("in index js register past first check");
	//var user = mongoose.model('users', UserSchema);
	req.body.action = "register";
  passport.authenticate('local', function(err, user, info){
	  console.log("passport authenticate");
	  console.log(user);
    if(err){ return next(err); }

    if(user){
      user.save(function (err){
		if(err){ return next(err); }

			return res.json({token: user.generateJWT()})
		});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
	
  
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
	console.log("login funcion");
	console.log("req" + req);
	console.log("res" + res);
	console.log("next" + next);
	req.body.action = "login";
  passport.authenticate('local', function(err, user, info){
	  console.log("passport authenticate");
	  console.log(user);
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});
