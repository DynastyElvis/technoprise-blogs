import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule
  ]
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadBlogPost(slug);
      }
    });
  }

  loadBlogPost(slug: string): void {
    this.loading = true;
    this.error = '';
    
    this.blogService.getBlogPost(slug).subscribe({
      next: (post: BlogPost) => {
        this.post = post;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading blog post:', error);
        this.error = 'Post not found';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}