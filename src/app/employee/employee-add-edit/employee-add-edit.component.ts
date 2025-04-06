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
    if (this.employeeForm.invalid) return;
  
    const formValue = this.employeeForm.value;
  
    const input = {
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      email: formValue.email,
      gender: formValue.gender,
      designation: formValue.designation,
      salary: Number(formValue.salary),
      date_of_joining: formValue.date_of_joining,
      department: formValue.department,
    };
  
    let apiCall: Observable<AddEmployeeResponse | UpdateEmployeeResponse>;
  
    if (this.isEditMode && this.employeeId) {
      apiCall = this.employeeService.updateEmployee(this.employeeId, input, this.selectedFile || undefined);
    } else {
      apiCall = this.employeeService.addEmployee(input, this.selectedFile || undefined);
    }
  
    apiCall.subscribe({
      next: () => {
        this.employeeSaved.emit();
        this.close.emit();
      },
      error: (error) => {
        console.error('Error saving employee:', error);
        this.errorMessage = 'Failed to save employee. Please try again.';
      }
    });
  }
  

  onClose(): void {
    this.close.emit();
  }
}