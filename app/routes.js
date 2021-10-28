module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      let produce = [{name:'apples',season:'october'}, {name:'cauliflower',season:'october'}, {name:'pumpkin',season:'october'}, {name:'tangerines',season:'november'}, {name:'beets',season:'november'}, {name:'brussels sprouts',season:'november'}, {name:'broccoli',season:'december'}, {name:'grapefruit',season:'december'}, {name:'pomegranate',season:'december'}, {name:'kale',season:'january'}, {name:'lemons',season:'january'}, {name:'parsnips',season:'january'}, {name:'leeks',season:'february'},, {name:'rutabagas',season:'february'},, {name:'cabbage',season:'february'}, {name:'artichokes',season:'march'}, {name:'mushroom',season:'march'},{name:'pineapple',season:'march'}, {name:'asparagus',season:'april'}, {name:'radishes',season:'april'},{name:'spring peas',season:'april'}, {name:'apricots',season:'may'}, {name:'mango',season:'may'}, {name:'swiss chard',season:'may'}, {name:'blueberries',season:'june'}, {name:'corn',season:'june'}, {name:'cantaloupe',season:'june'}, {name:'blackberries',season:'july'},{name:'peppers',season:'july'},{name:'raspberries',season:'july'}, {name:'kiwi',season:'august'},{name:'lettuce',season:'august'},{name:'okra',season:'august'}, {name:'acorn squash',season:'september'},{name:'persimmons',season:'september'},{name:'sweet potato',season:'september'},]
      const d = new Date();
      let month = d.getMonth();
      console.log(month)
      switch(month){
        case 1:
          month = 'january'
          break;
        case 2:
          month = 'february'
          break;
        case 3:
          month = 'march'
          break;
        case 4:
          month = 'april'
          break;
        case 5:
          month = 'may'
          break; 
        case 6:
          month = 'june'
          break;
        case 7:
          month = 'july'
          break;
        case 8:
          month = 'august'
          break;
        case 9:
          month = 'september'
          break;
        case 10:
          month = 'october'
          break;
        case 11:
          month = 'november'
          break;
        case 12:
          month = "december"  
      }
      console.log(month)
      let inSeasonProduce = produce.filter(el => el.season === month)
      console.log(inSeasonProduce)
        db.collection('produce').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            produce: result,
            inRightNow: inSeasonProduce
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/save', (req, res) => {
      db.collection('produce').save({name: req.body.name, season: req.body.season}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.send({})
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/save', (req, res) => {
      db.collection('produce').findOneAndDelete({name: req.body.name, season: req.body.season}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
