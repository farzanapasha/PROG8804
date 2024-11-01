const Router = require('@koa/router');
const { getTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todosController');

const router = new Router();

router.get('/', getTodos);
router.post('/', createTodo);
router.put('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);

module.exports = router;