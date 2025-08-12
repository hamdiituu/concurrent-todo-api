const request = require('supertest');
const express = require('express');
const todoRoute = require('../src/routes/todoRoute');

const app = express();
app.use(express.json());
app.use('/api/todos', todoRoute);

describe('Todo Route Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/todos', () => {
    test('should return all todos successfully', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Todos fetched successfully');
      expect(Array.isArray(response.body.result)).toBe(true);
      expect(response.body.result.length).toBeGreaterThan(0);
    });

    test('should return todos with correct structure', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      const todo = response.body.result[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('description');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('createdAt');
      expect(todo).toHaveProperty('updatedAt');
    });
  });

  describe('POST /api/todos', () => {
    test('should create a new todo successfully', async () => {
      const newTodo = {
        title: 'Test Todo',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.result.title).toBe(newTodo.title);
      expect(response.body.result.description).toBe(newTodo.description);
      expect(response.body.result.completed).toBe(false);
      expect(response.body.result.id).toBeDefined();
    });

  });

  describe('POST /api/todos/queue', () => {
    test('should add todo to queue successfully', async () => {
      const queuedTodo = {
        title: 'Queued Todo',
        description: 'Queued Description'
      };

      const response = await request(app)
        .post('/api/todos/queue')
        .send(queuedTodo)
        .expect(201);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Todo added to queue');
      expect(response.body.result.title).toBe(queuedTodo.title);
      expect(response.body.result.description).toBe(queuedTodo.description);
      expect(response.body.result.committed).toBe(false);
      expect(response.body.result.id).toBeDefined();
      expect(response.body.result.createdAt).toBeDefined();
    });

    test('should generate unique ID for queued todo', async () => {
      const todo1 = { title: 'First Todo', description: 'First Description' };
      const todo2 = { title: 'Second Todo', description: 'Second Description' };

      const response1 = await request(app)
        .post('/api/todos/queue')
        .send(todo1)
        .expect(201);

      const response2 = await request(app)
        .post('/api/todos/queue')
        .send(todo2)
        .expect(201);

      expect(response1.body.result.id).not.toBe(response2.body.result.id);
    });
  });

  describe('GET /api/todos/queue', () => {
    test('should return all queued todos', async () => {
      await request(app)
        .post('/api/todos/queue')
        .send({ title: 'Test Queued Todo', description: 'Test Description' });

      const response = await request(app)
        .get('/api/todos/queue')
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('fetchedAt');
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Todos queue fetched successfully');
      expect(Array.isArray(response.body.result)).toBe(true);
    });

    test('should return empty array when no queued todos', async () => {
      const response = await request(app)
        .get('/api/todos/queue')
        .expect(200);

      expect(Array.isArray(response.body.result)).toBe(true);
    });
  });

  describe('GET /api/todos/queue/:id', () => {
    test('should return specific queued todo by ID', async () => {
      const queuedResponse = await request(app)
        .post('/api/todos/queue')
        .send({ title: 'Test Todo', description: 'Test Description' });

      const queuedTodoId = queuedResponse.body.result.id;

      const response = await request(app)
        .get(`/api/todos/queue/${queuedTodoId}`)
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Todo queue fetched successfully');
      expect(response.body.result.id).toBe(queuedTodoId);
    });

    test('should return 404 for non-existent queued todo ID', async () => {
      const response = await request(app)
        .get('/api/todos/queue/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Todo queue not found');
    });

    test('should handle invalid ID parameter', async () => {
      const response = await request(app)
        .get('/api/todos/queue/invalid')
        .expect(200);

      expect(response.body.result).toBeUndefined();
    });
  });

  describe('Lock Mechanism Tests', () => {
    test('should handle concurrent requests with lock mechanism', async () => {
      const todo1 = { title: 'Concurrent Todo 1', description: 'Description 1' };
      const todo2 = { title: 'Concurrent Todo 2', description: 'Description 2' };
      const promises = [
        request(app).post('/api/todos').send(todo1),
        request(app).post('/api/todos').send(todo2)
      ];

      const responses = await Promise.all(promises);

      expect(responses[0].status).toBe(201);
      expect(responses[1].status).toBe(201);

      const getResponse = await request(app).get('/api/todos');
      const todos = getResponse.body.result;
      
      const createdTodos = todos.filter(todo => 
        todo.title === todo1.title || todo.title === todo2.title
      );
      
      expect(createdTodos).toHaveLength(2);
    });

    test('should maintain unique IDs with lock mechanism', async () => {
      const todos = [
        { title: 'Todo A', description: 'Description A' },
        { title: 'Todo B', description: 'Description B' },
        { title: 'Todo C', description: 'Description C' }
      ];

      for (const todo of todos) {
        await request(app)
          .post('/api/todos')
          .send(todo)
          .expect(201);
      }

      const getResponse = await request(app).get('/api/todos');
      const allTodos = getResponse.body.result;
      
      const ids = allTodos.map(todo => todo.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('Queue Processing Tests', () => {
    test('should process queued todos in background', async () => {
      const queuedResponse = await request(app)
        .post('/api/todos/queue')
        .send({ title: 'Background Todo', description: 'Background Description' });

      const queuedTodoId = queuedResponse.body.result.id;

      await new Promise(resolve => setTimeout(resolve, 1500));

      const queueResponse = await request(app)
        .get(`/api/todos/queue/${queuedTodoId}`);

      expect(queueResponse.body.result.id).toBe(queuedTodoId);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{"title": "Invalid JSON"')
        .expect(400); 

      expect(response.body).toHaveProperty('message');
    });

  });

  describe('Performance Tests', () => {
    test('should handle multiple rapid requests', async () => {
      const todos = Array.from({ length: 10 }, (_, i) => ({
        title: `Rapid Todo ${i}`,
        description: `Description ${i}`
      }));

      const startTime = Date.now();
      
      const promises = todos.map(todo => 
        request(app).post('/api/todos').send(todo)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      expect(endTime - startTime).toBeLessThan(15000);
    });
  });
});
