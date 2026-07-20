const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const postRoutes = require('./modules/post/post.routes');
const seoRoutes = require('./modules/seo/seo.routes');
const userRoutes = require('./modules/user/user.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const commentRoutes = require('./modules/comment/comment.routes');
const likeRoutes = require('./modules/like/like.routes');
const tagRoutes = require('./modules/tag/tag.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const followRoutes = require('./modules/follow/follow.routes');
const searchRoutes = require('./modules/search/search.routes');
const bookmarkRoutes = require('./modules/bookmarks/bookmark.routes');
const historyRoutes = require('./modules/history/history.routes');
const reportRoutes = require('./modules/reports/report.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const mediaRoutes = require('./modules/media/media.routes');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validate');
const {
  healthCheck,
  readinessCheck,
  metricsHandler,
} = require('./middleware/monitoring');
const logger = require('./config/logger');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: [
                "'self'",
                process.env.CLIENT_URL || 'http://localhost:3000',
              ],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
            },
          }
        : false,
    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
  })
);

app.use(compression());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  })
);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    morgan('dev')(req, res, next);
  } else {
    morgan('combined', {
      skip: (req) => req.url === '/health' || req.url === '/ready',
    })(req, res, next);
  }
});

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(sanitizeInput);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
  })
);

app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/metrics', metricsHandler);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'PixelThread API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', seoRoutes);
app.use('/api/users', userRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', commentRoutes);
app.use('/api', likeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', bookmarkRoutes);
app.use('/api', historyRoutes);
app.use('/api', reportRoutes);
app.use('/api', settingsRoutes);
app.use('/api', mediaRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use(errorHandler);

module.exports = app;
