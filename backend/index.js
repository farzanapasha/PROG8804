const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('./middlewares/bodyParser');
const cors = require('./middlewares/cors');

const app = new Koa();
const port = process.env.PORT || 3004;
const router = new Router();

app.use(bodyParser());
app.use(cors());

router.use('/api', todosRoutes.routes(), todosRoutes.allowedMethods());
router.use('/healthz', healthRoutes.routes(), healthRoutes.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());


app.listen(port, () => {
    console.log(`Server started on port ${port}...`);
});


startServer();