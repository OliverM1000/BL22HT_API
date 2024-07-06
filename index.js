const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');

const users = require('./routes/users');
const sampleFrames = require('./routes/sampleFrames');
const samplePlates = require('./routes/samplePlates');
const samples = require('./routes/samples');
const scanSetups = require('./routes/scanSetups');
const home = require('./routes/home');
const auth = require('./routes/auth');
const create = require('./routes/create');
const xasData = require('./routes/xasData');

if (!config.get('jwtPrivateKey')) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined!");
  process.exit(1);
}
if (!config.get('mongoDbKey')) {
  console.log("FATAL ERROR: mongoDbKey is not defined!");
  process.exit(1);
}


const express = require("express");
const cors = require('cors');
const app = express();
app.use(cors());

//mongoose.connect('mongodb://192.168.1.205/BL22HT')

const mongoDbKey = config.get('mongoDbKey')
mongoose.connect(`mongodb+srv://${mongoDbKey}@bl22ht-db.8ffubyh.mongodb.net/?retryWrites=true&w=majority&appName=BL22HT-DB`)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB.'));

app.use(express.json({limit: '10Mb'}));
app.use(helmet());

app.use('/api/users/', users);
app.use('/api/sampleFrames/', sampleFrames);
app.use('/api/samplePlates/', samplePlates);
app.use('/api/samples/', samples);
app.use('/api/scanSetups/', scanSetups);
app.use('/api/auth', auth);
app.use('/api/create', create);
app.use('/api/xasData', xasData);
app.use('/', home);


if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  debug('Morgan enabled ...');
}


const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`started on port ${port}`));
