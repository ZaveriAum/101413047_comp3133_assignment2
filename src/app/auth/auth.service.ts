import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SignupResponse {
  data:{
    signup: {
      accessToken: string;
    };
  }
}

interface LoginResponse {
  data:{
    login: {
      accessToken: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private graphqlUrl = 'https://comp3133-101413047-assignment1.onrender.com/graphql';

  constructor(private http: HttpClient) {}

  signup(signupInput: any): Observable<SignupResponse> {
    const graphqlQuery = {
      query: `
        mutation Signup($input: SignupInput!) {
          signup(input: $input) {
            accessToken
          }
        }
      `,
      variables: {
        input: signupInput,
      },
    };
    return this.http.post<SignupResponse>(this.graphqlUrl, graphqlQuery);
  }

  login(loginInput: any): Observable<LoginResponse> {
    const graphqlQuery = {
      query: `
        query Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `,
      variables: {
        input: loginInput,
      },
    };
    return this.http.post<LoginResponse>(this.graphqlUrl, graphqlQuery);
  }

  storeToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  clearToken(): void {
    localStorage.removeItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}