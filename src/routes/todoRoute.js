const express = require('express');
const router = express.Router();

let isLocked = false;

const lock = () => {
  isLocked = true;
};

const unlock = () => {
  isLocked = false;
};

const todoQueue = [];

const processQueue = async () => {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (todoQueue.filter((todo) => todo.committed === false).length > 0) {
      const todo = todoQueue.filter((todo) => todo.committed === false)[0];
      try {
        const savedTodo = await saveTodo(todo.title, todo.description);
        todo.committed = true;
        todo.updatedAt = new Date();
        todo.refId = savedTodo.id;
      } catch (error) {
        todo.error = error.message;
        todo.tryCount = todo.tryCount ? todo.tryCount + 1 : 1;
      }
    }
  }
};

const todos = [
  {
    id: 1,
    title: 'Buy groceries',
    description: 'Buy groceries from the store',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    title: 'Buy shoes',
    description: 'Buy shoes from the store',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

router.get('/', (req, res) => {
  res.json({
    result: todos,
    message: 'Todos fetched successfully',
    status: 'success'
  });
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  try {
    const savedTodo = await saveTodo(title, description);
    res.status(201).json({
      result: savedTodo,
      message: 'Todo created successfully',
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 'error'
    });
  }
});

router.post('/queue', async (req, res) => {
  const { title, description } = req.body;
  const todo = { id: Date.now(), title, description, committed: false, createdAt: new Date() };
  todoQueue.push(todo);
  res.status(201).json({
    result: todo,
    message: 'Todo added to queue',
    status: 'success'
  });
});

router.get('/queue', (req, res) => {
  res.json({
    result: todoQueue,
    message: 'Todos queue fetched successfully',
    status: 'success',
    fetchedAt: new Date()
  });
});

router.get('/queue/:id', async (req, res) => {
  const { id } = req.params;
  const todo = todoQueue.find((todo) => todo.id === parseInt(id));

  if (!todo) {
    res.status(404).json({
      message: 'Todo queue not found',
      status: 'error'
    });
    return;
  }
  res.json({
    result: todo,
    message: 'Todo queue fetched successfully',
    status: 'success'
  });
});

const saveTodo = async (title, description) => {
  throw new Error('Todo db error');
  if (isLocked) {
    throw new Error('Todo is locked, please try again later');
  }
  lock();
  const id = todos.length + 1;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const todo = {
    id,
    title,
    description,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  todos.push(todo);
  unlock();
  return todo;
};

processQueue();

module.exports = router;
