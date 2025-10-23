import { Injectable } from '@angular/core';
import { Task } from '../interfaces/task.interface';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly MAX_TASKS = 5;
  private readonly STORAGE_KEY = 'todo_tasks';
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor() {
    this.initializeTasks();
  }

  private initializeTasks(): void {
    const storedTasks = this.loadFromStorage();
    this.tasksSubject.next(storedTasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  loadTasks(): Observable<Task[]> {
    const tasks = this.loadFromStorage();
    return of(tasks).pipe(
      delay(200), // Simulate API call
      tap((tasks) => this.tasksSubject.next(tasks))
    );
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    const newTask: Task = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date(),
    };

    const currentTasks = this.tasksSubject.value;
    const updatedTasks = [newTask, ...currentTasks].slice(0, this.MAX_TASKS);

    return of(newTask).pipe(
      delay(300), // Simulate API call
      tap(() => {
        this.tasksSubject.next(updatedTasks);
        this.saveToStorage(updatedTasks);
      })
    );
  }

  completeTask(taskId: string): Observable<boolean> {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.filter((task) => task.id !== taskId);

    return of(true).pipe(
      delay(200), // Simulate API call
      tap(() => {
        this.tasksSubject.next(updatedTasks);
        this.saveToStorage(updatedTasks);
      })
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tasks = JSON.parse(stored);
        // Convert date strings back to Date objects
        return tasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
    }
    return [];
  }

  private saveToStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
    }
  }

  clearAllTasks(): Observable<boolean> {
    return of(true).pipe(
      delay(200),
      tap(() => {
        this.tasksSubject.next([]);
        this.saveToStorage([]);
      })
    );
  }
}
