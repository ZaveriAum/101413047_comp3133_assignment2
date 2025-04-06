import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

interface GraphQLResponse<T> {
  data?: T;
  errors?: any[];
}

export interface Employee {
  id?: string;
  first_name: string;
  last_name?: string;
  email: string;
  gender: string;
  designation: string;
  salary: number;
  date_of_joining: string;
  department: string;
  employee_photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetEmployeesData {
  getEmployees: Employee[];
}

interface GetEmployeeData {
  getEmployee: Employee;
}

interface GetEmployeeDesignationOrDepartmentData {
  getEmployeeDesignationOrDepartment: Employee[];
}

export type GetEmployeesResponse = GraphQLResponse<GetEmployeesData>;
export type GetEmployeeResponse = GraphQLResponse<GetEmployeeData>;
export type GetEmployeeDesignationOrDepartmentResponse = GraphQLResponse<GetEmployeeDesignationOrDepartmentData>;
export type AddEmployeeResponse = GraphQLResponse<{ addEmployee: Employee }>;
export type UpdateEmployeeResponse = GraphQLResponse<{ updateEmployee: Employee }>;
export type DeleteEmployeeResponse = GraphQLResponse<{ deleteEmployee: boolean }>;

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private graphqlUrl = 'https://comp3133-101413047-assignment1.onrender.com/graphql';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getEmployees(): Observable<GetEmployeesResponse> {
    return this.http.post<GetEmployeesResponse>(
      this.graphqlUrl,
      { query: `query GetEmployees { getEmployees { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }` },
      { headers: this.getAuthHeaders() }
    );
  }

  getEmployee(eid: string): Observable<GetEmployeeResponse> {
    return this.http.post<GetEmployeeResponse>(
      this.graphqlUrl,
      { query: `query GetEmployee($eid: ID!) { getEmployee(eid: $eid) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`, variables: { eid } },
      { headers: this.getAuthHeaders() }
    );
  }

  searchEmployees(query: string): Observable<GetEmployeeDesignationOrDepartmentResponse> {
    return this.http.post<GetEmployeeDesignationOrDepartmentResponse>(
      this.graphqlUrl,
      { query: `query GetEmployeeDesignationOrDepartment($query: String!) { getEmployeeDesignationOrDepartment(query: $query) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`, variables: { query } },
      { headers: this.getAuthHeaders() }
    );
  }

  addEmployee(input: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'employee_photo'>, employee_photo?: File): Observable<AddEmployeeResponse> {
    const formData = new FormData();
    formData.append('query',
      `mutation{ addEmployee(input: {
        first_name: "${input.first_name}"
        last_name: "${input.last_name}"
        email: "${input.email}"
        gender: "${input.gender}"
        designation: "${input.designation}"
        salary: ${input.salary}
        date_of_joining: "${input.date_of_joining}"
        department: "${input.department}"
        employee_photo: null
      }) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`,
    );
    if (employee_photo) {
      formData.append('employee_photo', employee_photo);
    }
    return this.http.post<AddEmployeeResponse>(this.graphqlUrl, formData, { headers: this.getAuthHeaders() });
  }

  updateEmployee(eid: string, input: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'employee_photo'>>, employee_photo?: File): Observable<UpdateEmployeeResponse> {
    const formData = new FormData();
    formData.append('query',
      `mutation{ updateEmployee(eid: "${eid}", input: {
        first_name: "${input.first_name}"
        last_name: "${input.last_name}"
        email: "${input.email}"
        gender: "${input.gender}"
        designation: "${input.designation}"
        salary: ${input.salary}
        date_of_joining: "${input.date_of_joining}"
        department: "${input.department}"
        employee_photo: null
      }) { id first_name last_name email gender designation salary date_of_joining department employee_photo createdAt updatedAt } }`,
    );
    if (employee_photo) {
      formData.append('employee_photo', employee_photo);
    }
    return this.http.post<UpdateEmployeeResponse>(this.graphqlUrl, formData, { headers: this.getAuthHeaders() });
  }

  deleteEmployee(eid: string): Observable<DeleteEmployeeResponse> {
    return this.http.post<DeleteEmployeeResponse>(
      this.graphqlUrl,
      { query: `mutation DeleteEmployee($eid: ID!) { deleteEmployee(eid: $eid) }`, variables: { eid } },
      { headers: this.getAuthHeaders() }
    );
  }
}