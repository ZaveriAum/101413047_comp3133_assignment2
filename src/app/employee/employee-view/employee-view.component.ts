import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../employee.service';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.css',
})
export class EmployeeViewComponent {
  @Input() employee: Employee | null = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}