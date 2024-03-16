const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
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
app.use(morgan('dev'));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(cors(corsOptions));
// Static folder
app.use(express.static(path.join(__dirname, 'public')));
// Authentication
const checkAuthMiddleware = (req, res, next) => {
  const authorizationToken = req.cookies.accessToken;
  const authorizationTokenRefresh = req.cookies.refreshToken;
  if (authorizationTokenRefresh) {
    if (authorizationToken) {
      jwt.verify(
        authorizationToken,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, data) => {
          if (err) {
            return res.redirect('/login');
          }
          req.user = {
            email: data.payload.email,
          };
        },
      );
      next();
    } else {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      jwt.verify(
        authorizationTokenRefresh,
        refreshTokenSecret,
        async (err, data) => {
          if (err) {
            return res.redirect('/login');
          } else {
            const email = data.payload.email;
            const dataForAccessToken = {
              email,
            };
            const accessToken = await authMethod.generateToken(
              dataForAccessToken,
              accessTokenSecret,
              accessTokenLife,
            );
            let refreshToken = await authMethod.generateToken(
              dataForAccessToken,
              refreshTokenSecret,
              process.env.REFRESH_TOKEN_LIFE,
            );
            await User.findOneAndUpdate(
              { email },
              { refreshToken: refreshToken },
            );
            res.cookie('accessToken', accessToken, { maxAge: 5 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken);
            req.user = {
              email: data.payload.email,
            };
            next();
          }
        },
      );
    }
  } else {
    next();
  }
};
app.use(checkAuthMiddleware);
// Routes;
routes(app);
// Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
