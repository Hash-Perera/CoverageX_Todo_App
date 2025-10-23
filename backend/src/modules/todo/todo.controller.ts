import { Controller, Get } from '@nestjs/common';

@Controller('todo')
export class TodoController {
  @Get('all')
  async getTodos() {
    return ['Todo 1', 'Todo 2', 'Todo 3'];
  }
}
