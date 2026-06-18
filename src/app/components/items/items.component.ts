import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Item } from '../../services/api.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  searchQuery = '';
  loading = false;
  errorMessage = '';

  // Modal controls
  isModalOpen = false;
  modalTitle = 'Create Item';

  // Form Fields
  itemId: number | null = null;
  name = '';
  description = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    this.apiService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load items', err);
        this.errorMessage = 'Cannot load items list from backend API.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.items];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredItems = this.items.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          i.id.toString() === q
      );
    }
  }

  openAddModal(): void {
    this.itemId = null;
    this.name = '';
    this.description = '';
    this.modalTitle = 'Create New System Item';
    this.isModalOpen = true;
  }

  openEditModal(item: Item): void {
    this.itemId = item.id;
    this.name = item.name;
    this.description = item.description || '';
    this.modalTitle = 'Modify Item Configuration';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveItem(): void {
    if (!this.name.trim()) {
      alert('Item name is required.');
      return;
    }

    if (this.itemId) {
      // Edit mode
      this.apiService.updateItem(this.itemId, { name: this.name, description: this.description }).subscribe({
        next: () => {
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update item information.');
        }
      });
    } else {
      // Add mode
      this.apiService.createItem({ name: this.name, description: this.description }).subscribe({
        next: () => {
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to register new item.');
        }
      });
    }
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.apiService.deleteItem(id).subscribe({
        next: () => {
          this.loadItems();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete item.');
        }
      });
    }
  }
}
