import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { Task } from '../../interfaces/task.interface';
import { TodoService } from '../../services/todo.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AsyncPipe, DatePipe],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate(
          '500ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px) scale(0.9)' }),
        animate(
          '400ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateX(0) scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({
            opacity: 0,
            transform: 'translateX(30px) scale(0.9)',
          })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('600ms ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('countBadge', [
      transition('* => *', [
        style({ transform: 'scale(1.3)' }),
        animate('200ms ease-out', style({ transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class Todo implements OnInit, OnDestroy {
  taskForm: FormGroup;
  tasks$: Observable<Task[]>;
  private destroy$ = new Subject<void>();
  taskCount = 0;

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService,
    private toastr: ToastrService
  ) {
    this.taskForm = this.createTaskForm();
    this.tasks$ = this.todoService.getTasks();
  }

  ngOnInit(): void {
    this.loadTasks();
    this.subscribeToTaskCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Creates and initializes the task form with validation rules
   * Following Single Responsibility Principle
   */
  private createTaskForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  /**
   * Subscribe to task count changes for badge animation
   */
  private subscribeToTaskCount(): void {
    this.tasks$.pipe(takeUntil(this.destroy$)).subscribe((tasks) => {
      this.taskCount = tasks.length;
    });
  }

  /**
   * Loads existing tasks from the service
   */
  private loadTasks(): void {
    this.todoService
      .loadTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.toastr.error('Failed to load tasks', 'Error', {
            progressBar: true,
          });
        },
      });
  }

  /**
   * Handles form submission to add a new task
   */
  onSubmit(): void {
    if (this.taskForm.valid) {
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title: this.taskForm.value.title.trim(),
        description: this.taskForm.value.description.trim(),
        completed: false,
      };

      this.todoService
        .addTask(newTask)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(
              '<i class="bi bi-check-circle-fill me-2"></i>Task added successfully!',
              'Success',
              {
                progressBar: true,
                timeOut: 3000,
                enableHtml: true,
              }
            );
            this.taskForm.reset();
            this.markFormAsPristine();
          },
          error: (error) => {
            console.error('Error adding task:', error);
            this.toastr.error(
              '<i class="bi bi-x-circle-fill me-2"></i>Failed to add task. Please try again.',
              'Error',
              { enableHtml: true }
            );
          },
        });
    } else {
      this.markFormAsTouched();
      this.toastr.warning(
        '<i class="bi bi-exclamation-triangle-fill me-2"></i>Please fill in all required fields correctly',
        'Validation Error',
        { enableHtml: true }
      );
    }
  }

  /**
   * Marks a task as completed and removes it from the list
   * @param taskId - The unique identifier of the task to complete
   */
  completeTask(taskId: string): void {
    this.todoService
      .completeTask(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(
            '<i class="bi bi-trophy-fill me-2"></i>Task completed! Well done!',
            'Completed',
            {
              progressBar: true,
              timeOut: 3000,
              enableHtml: true,
              positionClass: 'toast-top-right',
            }
          );
        },
        error: (error) => {
          console.error('Error completing task:', error);
          this.toastr.error(
            '<i class="bi bi-x-circle-fill me-2"></i>Failed to complete task. Please try again.',
            'Error',
            { enableHtml: true }
          );
        },
      });
  }

  /**
   * Checks if a form field is invalid and has been touched or dirty
   * @param fieldName - The name of the form field to validate
   * @returns boolean indicating if the field should show error state
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gets validation error message for a field
   * @param fieldName - The name of the form field
   * @returns Error message string
   */
  getErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }

  /**
   * TrackBy function for ngFor optimization
   * @param index - The index of the item
   * @param task - The task object
   * @returns The unique task ID
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  /**
   * Marks all form controls as touched to show validation errors
   */
  private markFormAsTouched(): void {
    Object.keys(this.taskForm.controls).forEach((key) => {
      this.taskForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Resets form state to pristine and untouched
   */
  private markFormAsPristine(): void {
    this.taskForm.markAsPristine();
    this.taskForm.markAsUntouched();
  }
}
