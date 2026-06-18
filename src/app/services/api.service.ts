import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Item {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  orders?: Order[];
}

export interface Order {
  id: number;
  userId: number;
  productName: string;
  amount: number;
  createdAt: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  // ==========================================
  // ITEMS API
  // ==========================================
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}`);
  }

  createItem(item: { name: string; description?: string }): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item);
  }

  updateItem(id: number, item: { name: string; description?: string }): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item);
  }

  deleteItem(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/items/${id}`);
  }

  // ==========================================
  // USERS API
  // ==========================================
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: { username: string; email: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: { username: string; email: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${id}`);
  }

  // ==========================================
  // ORDERS API
  // ==========================================
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(order: { userId: number; productName: string; amount: number }): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  updateOrder(id: number, order: { productName: string; amount: number }): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${id}`, order);
  }

  deleteOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/orders/${id}`);
  }
}
