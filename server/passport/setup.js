const bcrypt = require("bcryptjs");
const User = require("../../models/Users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
    console.log('serialize user')
    done(null, user.id);
})

passport.deserializeUser((id,done) => {
    console.log('deserialize user')
    User.findById(id, (err, user) => {
        done(err, user);
    })
})

passport.use(
    new LocalStrategy({ usernameField: "email"}, (email, password, done) => {
        // Match User
        User.findOne({email:email})
        .then(user => {
            if (!user){
                console.log('--- CREATING A NEW USER ---' )
                const newUser = new User({email, password})
            // hash password before saving in db
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if (err) throw err;
                        newUser.password = hash
                        newUser
                        .save()
                        .then(user => {
                            return done(null, user);
                        })
                        .catch(err => {
                            return done(null, false, {message:err})
                        })
                    })
                })
            }
            else{
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch){
                        console.log('--- USER FOUND ---')
                        return done(null, user);
                    }
                    else{
                        console.log('--- WRONG PASSWORD ---')
                        return done(null, false, {message: "Wrong Password"})
                    }
                })
            }
        })
        .catch(err => {
            return done(null, false, {message: err})
        })
    })
)

module.exports = passport