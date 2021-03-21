const express = require('express');
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const fetch = require("node-fetch");
require('dotenv').config()
const passport = require("./server/passport/setup")

const PORT = process.env.PORT || 8080;
// Sets up the Express App
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var corsOptions = {
  origin: `http://localhost:${PORT}`
};
app.use(cors(corsOptions));

app.use(express.static('assets'));
const htmlRouter = require('./assets/Routes/htmlRoutes.js');
const apiRouter = require('./assets/Routes/APIRoutes.js');
const db = require("./models").db;

db.mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology:true
}).then(() => console.log(`Successfully connect to MongoDB 👍`))
.catch(err => {
  console.error("Connection error", err);
  process.exit();
});;

// Express Session
app.use(
  session({
    secret: "very secret this is",
    resave:false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.MONGODB_URI})
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Invoke routes
apiRouter(app);
htmlRouter(app);
// app.use("/api/auth", auth);
// app.get("/api/goodMorning", (req, res) => res.send("Good morning"));


// Syncing our sequelize models and then starting our Express app
app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`));

function updateItemPrices() {
  const itemInterval = setInterval(function() {
    console.log('Fetching Item Prices')
    let requests = [fetch('http://localhost:8080/api/updateItemPrices').catch(err => console.log(err))]
    // Promise.all waits until all jobs are resolved
      Promise.all(requests)
      .then(console.log('Item Price Data Updated Successfully'))
      .catch(err => console.log(err))

  }, 60000);
}
updateItemPrices();

