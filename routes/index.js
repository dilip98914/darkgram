var express = require("express");
var router = express.Router();
const userSchema=require('../models/user');
const passport = require("passport");
const localStrategy = require("passport-local");
const usersRouter=require('../models/user');
const postSchema = require('../models/post');
const upload=require('./multer')
const { asyncMiddleware } = require('middleware-async')
const uploadImage = require('../cloudinary');

passport.use(new localStrategy(usersRouter.authenticate()));

async function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        const user=await userSchema.findOne({username:req.session.passport.user})
        res.locals.globalObj={
            username:req.session.passport.user,
            profile:user.picture
        }
        return next()
    }
    return  res.redirect('/login')
}
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
        console.log('aaaaaa')
        return `${seconds}s`
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h`
    }
    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d`;
    }
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
}

// GET

router.get("/", function (req, res) {
    if(req.isAuthenticated()){
        return res.redirect('/feed')
    }
    return res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/feed')
    }
    return res.render("login", { footer: false });
});

router.get("/feed", asyncMiddleware(isLoggedIn),async function (req, res) {
    let user=await userSchema.findOne({username:req.session.passport.user})
                            .populate('posts')
    const posts=await postSchema.find({}).populate('user')
    return res.render("feed", { footer: true,user,posts,formatRelativeTime });
});

router.get("/profile/:username", asyncMiddleware(isLoggedIn),async function (req, res) {
    const user=await userSchema.findOne({username:req.params.username})
    .populate('posts')
    .populate('saved')
    return res.render("profile", { footer: true, user,me:user.username==req.session.passport.user});
});

router.get("/upload",asyncMiddleware(isLoggedIn), function (req, res) {
    return res.render("upload", { footer: true });
});

router.get("/edit",asyncMiddleware(isLoggedIn), async function (req, res) {
    const currUser = await userSchema.findOne({ username: req.session.passport.user })
    return res.render("edit", { footer: false, currUser });
});

router.get("/search", asyncMiddleware(isLoggedIn), async function (req, res) {
    return res.render("search", { footer: true });
});

router.get("/search/:user", asyncMiddleware(isLoggedIn), async function (req, res) {
    const searchTerm=`^${req.params.user}`;
    const regex=new RegExp(searchTerm);
    const users=await userSchema.find({username:{$regex:regex}})
    return res.json(users);
});

router.get("/messages", asyncMiddleware(isLoggedIn), async function (req, res) {
    const currUser = await userSchema.findOne({ username: req.session.passport.user })
    return res.render("messages", { footer: false, currUser });
});

router.get("/notifications", asyncMiddleware(isLoggedIn), async function (req, res) {
    const currUser = await userSchema.findOne({ username: req.session.passport.user })
    return res.render("notifications", { footer: false, currUser });
});


router.get("/comments/:postid", asyncMiddleware(isLoggedIn), async function (req, res) {
    const post = await postSchema.findOne({ _id: req.params.postid }).populate('user')
    const user = await userSchema.findOne({ username: req.session.passport.user })
    return res.render("comments", { footer: false, post, user, formatRelativeTime });
});

router.get("/like/:postid", async  function (req, res) {
    const post= await postSchema.findOne({_id:req.params.postid})
    const user = await userSchema.findOne({ username: req.session.passport.user })
    if(post.like.indexOf(user._id)==-1){
        post.like.push(user._id)
    }else{
        post.like.splice(post.like.indexOf(user._id),1)
    }
    await post.save();
    return res.json(post);
});

router.post("/comment/:postid", async function (req, res) {
    const post = await postSchema.findOne({ _id: req.params.postid })
    const user = await userSchema.findOne({ username: req.session.passport.user })
    post.comments.push({value:req.body.data,user:user._id,date:new Date()})
    await post.save();
    return res.json(post);
});

router.get("/logout",  function (req, res) {
    req.logout((err)=>{
        return res.redirect('/login')
    })
});

router.get("/bookmark/:postid",async function (req, res) {
    const post = await postSchema.findOne({ _id: req.params.postid })
    const user = await userSchema.findOne({ username: req.session.passport.user })
    if(user.saved.indexOf(post._id)==-1){
        user.saved.push(post._id)
    }else{
        user.saved.splice(user.saved.indexOf(post._id),1)
    }
    await user.save()
    return res.redirect('/feed');
});

//POST

router.post("/login", passport.authenticate('local',{
    successRedirect:'/feed',
    failureRedirect:'/login'
}) , async function (req, res) {
})

router.post("/register",async function (req, res) {
    const user = new userSchema({
        username:req.body.username,
        email: req.body.email,
        name:req.body.name
    });
    const newUser= await userSchema.register(user,req.body.password);
    passport.authenticate('local')(req,res,()=>{
        return res.redirect('/profile')
    })
});

router.post("/post", asyncMiddleware(isLoggedIn), upload.single('image'),async function (req, res) {
    try{
        const user = await userSchema.findOne({ username: req.session.passport.user })
        const imageUploaded = await uploadImage(req.file.path, {
            public_id: 'magic'
        })
        console.error('xxxxxxxx',imageUploaded,req.file.path)
        if (req.body.category == 'post') {
            const post=await postSchema.create({
                user: user._id,
                caption: req.body.caption,
                picture: imageUploaded.url
            })
            user.posts.push(post._id);
        } else if (req.body.category == 'story') {

        }
        const ss=await user.save()
        // console.log('xxxxxxxx',ss)
        res.redirect('/feed')
    }catch(err){
        console.error(err);
        return res.send('internal server error')
    }
})

router.post("/upload", asyncMiddleware(isLoggedIn),upload.single('image'), async function (req, res) {
    const user=await userSchema.findOne({
        username:req.session.passport.user
    })
    const imageUploaded = await uploadImage(req.file.path, {
        public_id: 'magic'
    })
    user.picture = imageUploaded.url;
    await user.save()
    res.redirect('/edit')
});
router.post("/update", asyncMiddleware(isLoggedIn), async function (req, res) {
    const user=await userSchema.findOneAndUpdate({
        username:req.session.passport.user
    },{
        username:req.body.username,
        name:req.body.name,
        bio:req.body.bio
    },{
        new:true
    })

    req.login(user,(err)=>{
        if(err) throw err;
        res.redirect(`/profile/${req.body.username}`)
    })
})

module.exports = router;
