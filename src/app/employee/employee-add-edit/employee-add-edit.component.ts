import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, Employee, AddEmployeeResponse, UpdateEmployeeResponse } from '../employee.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-add-edit.component.html',
  styleUrl: './employee-add-edit.component.css',
})
export class EmployeeAddEditComponent implements OnInit, OnChanges {
  @Input() isEditMode: boolean = false;
  @Input() employee: Employee | null = null;
  @Input() employeeId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() employeeSaved = new EventEmitter<void>();

  employeeForm: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {
    this.employeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      date_of_joining: ['', Validators.required],
      department: ['', Validators.required],
      employee_photo: [null],
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && changes['employee'].currentValue) {
      this.initializeForm();
    } else if (!this.isEditMode) {
      this.employeeForm.reset();
      this.previewUrl = null;
      this.selectedFile = null;
    }
  }

  private initializeForm(): void {
    if (this.isEditMode && this.employee) {
      this.employeeForm.patchValue({
        first_name: this.employee.first_name,
        last_name: this.employee.last_name,
        email: this.employee.email,
        gender: this.employee.gender,
        designation: this.employee.designation,
        salary: this.employee.salary,
        date_of_joining: this.employee.date_of_joining,
        department: this.employee.department,
      });
      this.previewUrl = this.employee.employee_photo || null;
    } else {
      this.employeeForm.reset();
      this.previewUrl = null;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] || null;
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string | ArrayBuffer | null;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.previewUrl = this.isEditMode && this.employee?.employee_photo ? this.employee.employee_photo : null;
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formData = new FormData();
      formData.append('operations', JSON.stringify({
        query: this.isEditMode
          ? `mutation UpdateEmployee($eid: ID!, $input: UpdateEmployeeInput!) { updateEmployee(eid: $eid, input: $input) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`
          : `mutation AddEmployee($input: AddEmployeeInput!) { addEmployee(input: $input) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`,
        variables: {
          eid: this.employeeId,
          input: this.employeeForm.value,
        },
      }));
      if (this.selectedFile) {
        formData.append('employee_photo', this.selectedFile);
      }

      let apiCall: Observable<AddEmployeeResponse | UpdateEmployeeResponse>;
      if (this.isEditMode) {
        apiCall = this.employeeService.updateEmployee(this.employeeId!, this.employeeForm.value, this.selectedFile ? this.selectedFile : undefined);
      } else {
        apiCall = this.employeeService.addEmployee(this.employeeForm.value, this.selectedFile ? this.selectedFile : undefined);
      }

      apiCall.subscribe({
        next: (response: AddEmployeeResponse | UpdateEmployeeResponse) => {
          this.employeeSaved.emit();
          this.employeeForm.reset();
          this.previewUrl = null;
          this.selectedFile = null;
          alert(this.isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
        },
        error: (error: any) => {
          this.errorMessage = error.error.errors?.[0]?.message || error.message || (this.isEditMode ? 'Failed to update employee.' : 'Failed to add employee.');
          console.error('Error:', error);
        },
      });
    } else {
      this.errorMessage = 'Please fill out all required fields correctly.';
    }
  }

  onClose(): void {
    this.close.emit();
  }
}