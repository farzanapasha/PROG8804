const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('./middlewares/bodyParser');
const cors = require('./middlewares/cors');
const todosRoutes = require('./routes/todos');
const healthRoutes = require('./routes/health');

const app = new Koa();
const router = new Router();

app.use(bodyParser);
app.use(cors);

router.use('/api', todosRoutes.routes(), todosRoutes.allowedMethods());
router.use('/healthz', healthRoutes.routes(), healthRoutes.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

module.exports = app;