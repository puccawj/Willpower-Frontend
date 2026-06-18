import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Order, User } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  users: User[] = [];
  searchQuery = '';
  loading = false;
  errorMessage = '';

  // Modal control
  isModalOpen = false;
  modalTitle = 'Place Order';

  // Form Fields
  orderId: number | null = null;
  userId: number | null = null;
  productName = '';
  amount: number | null = null;

  constructor(private apiService: ApiService) {}

  getUserLabel(userId: number | null): string {
    if (!userId) return '';
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.username} (${user.email})` : `User ID: ${userId}`;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      orders: this.apiService.getOrders(),
      users: this.apiService.getUsers()
    }).subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.users = res.users;

        // Map users to orders for display purposes
        this.orders.forEach(order => {
          if (!order.user) {
            order.user = this.users.find(u => u.id === order.userId);
          }
        });

        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load data for orders', err);
        this.errorMessage = 'Cannot load orders or users records. Please check API.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrders = [...this.orders];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredOrders = this.orders.filter(
        o =>
          o.productName.toLowerCase().includes(q) ||
          o.id.toString() === q ||
          (o.user && o.user.username.toLowerCase().includes(q))
      );
    }
  }

  openAddModal(): void {
    if (this.users.length === 0) {
      alert('Please register at least one User before placing an order.');
      return;
    }
    this.orderId = null;
    this.userId = this.users[0]?.id || null;
    this.productName = '';
    this.amount = null;
    this.modalTitle = 'Place New Order';
    this.isModalOpen = true;
  }

  openEditModal(order: Order): void {
    this.orderId = order.id;
    this.userId = order.userId; // user can't be changed typically, so we just display
    this.productName = order.productName;
    
    const val = typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount);
    this.amount = isNaN(val) ? 0 : val;
    
    this.modalTitle = 'Update Order Info';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveOrder(): void {
    if (!this.userId || !this.productName.trim() || this.amount === null || this.amount <= 0) {
      alert('Please fill out all fields with valid data.');
      return;
    }

    if (this.orderId) {
      // Edit mode: NestJS API updates productName and amount only (no change to user)
      this.apiService.updateOrder(this.orderId, { productName: this.productName, amount: this.amount }).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update order info.');
        }
      });
    } else {
      // Add mode
      this.apiService.createOrder({ userId: this.userId, productName: this.productName, amount: this.amount }).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to place new order.');
        }
      });
    }
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to cancel and delete this order?')) {
      this.apiService.deleteOrder(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete order.');
        }
      });
    }
  }
}
