const Router = require('@koa/router');
const { login, logout, getCurrentUser } = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = new Router();

router.post('/login', login);
router.post('/logout', auth, logout);
router.get('/me', auth, getCurrentUser);

module.exports = router;
