const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('./middlewares/bodyParser');
const cors = require('./middlewares/cors');
const auth = require('./middlewares/auth');
const todosRoutes = require('./routes/todos');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const { errorHandler } = require('./middlewares/errorHandler');

const app = new Koa();
const router = new Router();

app.use(errorHandler);
app.use(bodyParser);
app.use(cors);

// Public routes
router.use('/api/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/healthz', healthRoutes.routes(), healthRoutes.allowedMethods());

// Protected routes
router.use('/api/todos', auth, todosRoutes.routes(), todosRoutes.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());


module.exports = app;