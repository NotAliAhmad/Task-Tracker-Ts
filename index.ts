import express from 'express';
import { loadEnvFile } from 'node:process';
import { TaskService } from './src/service/task';
loadEnvFile();

const task = new TaskService();

function main() {
  const app = express();
  app.use(express.json());
  const port = process.env.PORT ?? 3000;

  app.get('/health', (req, res) => {
    res.status(200).json({ staus: 'ok' });
  });

  // get tasks by id
  app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const req_task_id = id.split('=').at(-1);

    if (!req_task_id) {
      return res.status(400).json({
        error: 'ID cannot be blank',
      });
    }

    const mytaskID = await task.GetTaskByID(req_task_id);

    if (!mytaskID) {
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    res.status(200).json(mytaskID.rows);
  });

  // get all tasks
  app.get('/tasks', async (req, res) => {
    const tasks = await task.GetTasks(req.query);
    res.status(200).json(tasks);
  });

  // create the task
  app.post('/tasks', async (req, res) => {
    const { title, description } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({
        error: 'Both Title and Description is required',
      });
    } else if (String(title).length > 100) {
      return res.status(400).json({
        error: 'Title cannot be more than 100 chars',
      });
    }

    const t = await task.CreateTask(title, description);
    res.status(201).json(t);
  });

  // update a task
  app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const req_task_id = id.split('=').at(-1);

    if (!req_task_id) {
      return res.status(400).json({
        error: 'ID cannot be blank',
      });
    }

    const updated = await task.UpdateTaskByID(
      req_task_id,
      'new title',
      'new desc',
      false,
    );
    if (!updated) {
      return res.status(404).json({
        error: 'task not found',
      });
    }

    res.status(201).json(updated.rows);
  });

  // delete a task
  app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const req_task_id = id.split('=').at(-1);

    if (!req_task_id) {
      return res.status(400).json({
        error: 'ID cannot be blank',
      });
    }

    const deleted = await task.DeleteTaskByID(req_task_id);
    if (!deleted) {
      return res.status(404).json({
        error: 'task not found',
      });
    }

    res.sendStatus(204);
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

main();
