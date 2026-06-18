import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, Order } from '../../services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  orders: Order[] = [];
  searchQuery = '';
  loading = false;
  errorMessage = '';

  // Modal control
  isModalOpen = false;
  isViewModalOpen = false;
  modalTitle = 'Add User';
  selectedUser: User | null = null;
  selectedUserOrders: Order[] = [];

  // Form Fields
  userId: number | null = null;
  username = '';
  email = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsersAndOrders();
  }

  loadUsersAndOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        
        // Fetch all orders as well so we can display order count and details
        this.apiService.getOrders().subscribe({
          next: (orders) => {
            this.orders = orders;
            // Map orders to users if the api response didn't populate them
            this.users.forEach(u => {
              u.orders = this.orders.filter(o => o.userId === u.id);
            });
            this.applyFilter();
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load orders for users', err);
            this.applyFilter();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.errorMessage = 'Cannot load users. Please check backend connection.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(
        u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toString() === q
      );
    }
  }

  openAddModal(): void {
    this.userId = null;
    this.username = '';
    this.email = '';
    this.modalTitle = 'Register New User';
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.userId = user.id;
    this.username = user.username;
    this.email = user.email;
    this.modalTitle = 'Edit User Settings';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isViewModalOpen = false;
  }

  saveUser(): void {
    if (!this.username.trim() || !this.email.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    if (this.userId) {
      // Edit mode
      this.apiService.updateUser(this.userId, { username: this.username, email: this.email }).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsersAndOrders();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update user. Email might already exist.');
        }
      });
    } else {
      // Add mode
      this.apiService.createUser({ username: this.username, email: this.email }).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsersAndOrders();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to create user. Email might already exist.');
        }
      });
    }
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.selectedUserOrders = this.orders.filter(o => o.userId === user.id);
    this.isViewModalOpen = true;
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This will also delete all of their orders.')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsersAndOrders();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete user.');
        }
      });
    }
  }
}
