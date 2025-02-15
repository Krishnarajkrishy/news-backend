const Express = require('express');
const { connectionDb } = require('./DB');
const bodyParser = require("body-parser");
const UserRouter = require('./controllers/UserController');
const cors = require('cors')
require("dotenv").config();

const app = Express();
// DB CONNECTION
connectionDb();

app.use(cors());
app.use(bodyParser.json())

app.use('/user',UserRouter)



app.listen(process.env.PORT, process.env.HOST_NAME, () => {
  console.log("http://localhost:3000 server is started");
});