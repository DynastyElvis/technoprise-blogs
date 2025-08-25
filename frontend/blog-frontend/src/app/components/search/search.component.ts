import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlogService, BlogPost, BlogResponse } from '../../services/blog.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    RouterModule
  ]
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  searchResults: BlogPost[] = [];
  totalResults = 0;
  loading = false;
  hasSearched = false;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Auto-focus search input
    setTimeout(() => {
      const searchInput = document.querySelector('input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.performSearch();
    }
  }

  performSearch(): void {
    this.loading = true;
    this.hasSearched = true;
    
    this.blogService.getBlogPosts(1, 50, this.searchTerm.trim()).subscribe({
      next: (response: BlogResponse) => {
        this.searchResults = response.posts;
        this.totalResults = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching blog posts:', error);
        this.searchResults = [];
        this.totalResults = 0;
        this.loading = false;
      }
    });
  }

  viewPost(slug: string): void {
    this.router.navigate(['/posts', slug]);
  }

  goBack(): void {
    this.location.back();
  }
}