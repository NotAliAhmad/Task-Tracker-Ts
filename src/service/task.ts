import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';

export interface Task {
  id?: string;
  title: string;
  description: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Tasks {
  tasks: Task[];
}

export class TaskService {
  constructor() {}

  async QueryBuilder(request: any) {

    let counter: number = 1;
    let conditions: any[] = [];
    // where $1 = $2 and $3 = $4

    const values: any[] = [];
    if (Object.keys(request).length === 0) {
      return { query: '', values };
    }
    for (const [key, value] of Object.entries(request)) {
      values.push(value);
      let query;
      query = key + ' =' + ' $' + counter;
      counter++;
      conditions.push(query);
    }

    let query: string = 'where';
    // Disclaimer: I know using join here with ' and ' is better 
    for (let i = 0; i < conditions.length; i++) {
      query = query + ' ' + conditions[i];
      try {
        if (conditions[i + 1]) {
          query = query + ' and';
        }
      } catch (error) {
        continue;
      }
    }

    return { query, values };
  }

  async CreateTask(title: string, description: string) {
    const newTask: Task = {
      id: uuidv4(),
      title: title,
      description: description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      await pool.query(
        'Insert into tasks(id, title, description, completed, created_at, updated_at) values($1,$2,$3,$4,$5,$6)',
        [
          newTask.id,
          newTask.title,
          newTask.description,
          newTask.completed,
          newTask.createdAt,
          newTask.updatedAt,
        ],
      );
    } catch (error) {
      console.log('Got an error message trying to create task:', error.message);
    }
    return newTask;
  }

  async GetTasks(params: any) {
    const { query, values } = await this.QueryBuilder(params);

    let final_query = 'select * from tasks';
    if (query) {
      final_query += ' ' + query;
    }
    return (await pool.query(final_query, values)).rows;
  }

  async GetTaskByID(id: string) {
    return await pool.query('select * from tasks where id = $1', [id]);
  }

  async UpdateTaskByID(
    id: string,
    title: string,
    description: string,
    completed: boolean,
  ) {
    try {
      await pool.query(
        'update tasks set title = $1,description = $2, completed = $3, updated_at = $4 where id = $5',
        [title, description, completed, new Date(), id],
      );
    } catch (error) {
      console.log(error);
      return false;
    }
    return this.GetTaskByID(id);
  }

  async DeleteTaskByID(id: string) {
    try {
      await pool.query('delete from tasks where id = $1', [id]);
    } catch (error) {
      return false;
    }
    return true;
  }
}
