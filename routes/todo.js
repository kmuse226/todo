const express = require('express');
const router = express.Router();

const todoController = require('../controller/todo');

router.put('/:id', todoController.submitTodo);

router.put('/:id1/todo/:id2', todoController.checkTodo);

router.delete('/:id1/todo/:id2', todoController.deleteTodo);

module.exports = router;