const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
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
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});
app.use(errorHandler);

module.exports = app;
