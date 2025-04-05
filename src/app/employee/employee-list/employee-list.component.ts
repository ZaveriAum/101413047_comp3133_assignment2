import { Component, OnInit } from '@angular/core';
import { EmployeeService, Employee } from '../employee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeAddEditComponent } from '../employee-add-edit/employee-add-edit.component';
import { EmployeeViewComponent } from '../employee-view/employee-view.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeAddEditComponent, EmployeeViewComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  searchQuery: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showViewModal: boolean = false;
  selectedEmployee: Employee | null = null;
  editEmployeeId: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response.data?.getEmployees || [];
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
      },
    });
  }

  searchEmployees(): void {
    if (this.searchQuery.trim()) {
      this.employeeService.searchEmployees(this.searchQuery).subscribe({
        next: (response) => {
          this.employees = response.data?.getEmployeeDesignationOrDepartment || [];
        },
        error: (error) => {
          console.error('Error searching employees:', error);
        },
      });
    } else {
      this.loadEmployees();
    }
  }

  openAddModal(): void {
    this.selectedEmployee = null;
    this.editEmployeeId = null;
    this.showAddModal = true;
  }

  openEditModal(employee: Employee): void {
    this.selectedEmployee = { ...employee };
    this.editEmployeeId = employee.id!;
    this.showEditModal = true;
  }

  openViewModal(employee: Employee): void {
    this.selectedEmployee = { ...employee };
    this.showViewModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showViewModal = false;
    this.selectedEmployee = null;
    this.editEmployeeId = null;
    this.loadEmployees();
  }

  deleteEmployee(employeeId: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: (response) => {
          if (response.data?.deleteEmployee) {
            this.loadEmployees();
            alert('Employee deleted successfully.');
          } else {
            alert('Failed to delete employee.');
          }
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Error deleting employee.');
        },
      });
    }
  }

  logout(): void {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }
}