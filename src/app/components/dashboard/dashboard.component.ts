import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, User, Order, Item } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  usersCount = 0;
  ordersCount = 0;
  totalOrderAmount = 0;
  itemsCount = 0;

  recentOrders: Order[] = [];
  recentUsers: User[] = [];
  loading = true;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.apiService.getUsers(),
      orders: this.apiService.getOrders(),
      items: this.apiService.getItems()
    }).subscribe({
      next: (res) => {
        this.usersCount = res.users.length;
        this.ordersCount = res.orders.length;
        this.itemsCount = res.items.length;

        // Calculate total order amount
        this.totalOrderAmount = res.orders.reduce((acc, order) => {
          // Convert potential Decimal string/object to float
          const val = typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);

        // Sort to get recent ones
        this.recentOrders = [...res.orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Add user info to orders if missing
        this.recentOrders.forEach(order => {
          if (!order.user) {
            order.user = res.users.find(u => u.id === order.userId);
          }
        });

        this.recentUsers = [...res.users]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.errorMessage = 'Cannot load dashboard data. Please make sure the NestJS backend API is running.';
        this.loading = false;
      }
    });
  }
}
