const Router = require('@koa/router');
const { healthCheck } = require('../controllers/healthController');

const router = new Router();

router.get('/', healthCheck);

module.exports = router;