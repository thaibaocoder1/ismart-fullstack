const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const authMethod = require('./auth/AuthController');
const routes = require('./routes');
const User = require('./app/models/User');
const dotenv = require('dotenv');
dotenv.config();
// Start app
const app = express();
// Connect database
db.connect();
// Setup cors
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
// Environment variables
const port = process.env.PORT || 3000;
// Middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
app.use(morgan('dev'));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(methodOverride('_method'));
// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Authentication
// const checkAuthMiddleware = (req, res, next) => {
//   const authorizationHeader = req.headers.authorization;
//   let accessToken;
//   if (authorizationHeader) {
//     accessToken = authorizationHeader.split(' ')[1];
//   }
//   const refreshToken = req.headers.token;
//   if (refreshToken) {
//     if (accessToken) {
//       jwt.verify(
//         accessToken,
//         process.env.ACCESS_TOKEN_SECRET,
//         async (err, data) => {
//           if (err) {
//             const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
//             const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
//             const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
//             jwt.verify(refreshToken, refreshTokenSecret, async (err, data) => {
//               if (err) {
//                 const email = data.payload.email;
//                 const dataForAccessToken = {
//                   email,
//                 };
//                 const accessToken = await authMethod.generateToken(
//                   dataForAccessToken,
//                   accessTokenSecret,
//                   accessTokenLife,
//                 );
//                 let refreshToken = await authMethod.generateToken(
//                   dataForAccessToken,
//                   refreshTokenSecret,
//                   process.env.REFRESH_TOKEN_LIFE,
//                 );
//                 await User.findOneAndUpdate(
//                   { email },
//                   { refreshToken: refreshToken },
//                 );
//                 res.cookie('accessToken', accessToken, {
//                   maxAge: 10 * 60 * 1000,
//                 });
//                 res.cookie('refreshToken', refreshToken);
//                 req.user = {
//                   email: data.payload.email,
//                 };
//               } else {
//                 req.user = {
//                   email: data.payload.email,
//                 };
//               }
//             });
//             next();
//           }
//         },
//       );
//     }
//   } else {
//     next();
//   }
// };
// app.use(checkAuthMiddleware);
// Routes;
routes(app);
// Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
