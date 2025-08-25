import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { BlogService, BlogPost, BlogResponse } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class BlogListComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  totalPosts = 0;
  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  loading = false;

  constructor(
    private blogService: BlogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBlogPosts();
  }

  loadBlogPosts(): void {
    this.loading = true;
    this.blogService.getBlogPosts(this.currentPage, this.pageSize).subscribe({
      next: (response: BlogResponse) => {
        // Newest first (by id desc as a proxy for create order)
        this.blogPosts = [...response.posts].sort((a, b) => (b.id || 0) - (a.id || 0));
        this.totalPosts = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBlogPosts();
  }

  viewPost(slug: string): void {
    this.router.navigate(['/posts', slug]);
  }
}