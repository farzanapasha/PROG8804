const Router = require('@koa/router');
const { login, logout } = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = new Router();

router.post('/login', login);
router.post('/logout', auth, logout);  // Protected route, requires authentication

module.exports = router;
