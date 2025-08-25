import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
}

export interface BlogResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:8080/api';
  private storageKey = 'blog_posts';

  constructor(private http: HttpClient) { }

  getBlogPosts(page: number = 1, limit: number = 6, search?: string): Observable<BlogResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<BlogResponse>(`${this.apiUrl}/posts`, { params }).pipe(
      // Merge any locally stored fields (e.g., imageUrl) into API results by slug
      map((resp) => {
        const stored = this.getStoredPosts();
        const mergedPosts = resp.posts.map(p => {
          const local = stored.find(s => s.slug === p.slug);
          return local && local.imageUrl && !p.imageUrl ? { ...p, imageUrl: local.imageUrl } : p;
        });
        return { ...resp, posts: mergedPosts } as BlogResponse;
      }),
      catchError(() => {
        const allPosts: BlogPost[] = this.getStoredPosts();
        const startIndex = (page - 1) * limit;
        const paged = allPosts.slice(startIndex, startIndex + limit);
        return of({
          posts: paged,
          total: allPosts.length,
          page,
          totalPages: Math.ceil(allPosts.length / limit),
          hasNext: startIndex + limit < allPosts.length,
          hasPrevious: page > 1
        });
      })
    );
  }

  getBlogPost(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/posts/${slug}`).pipe(
      // Merge with locally stored data (e.g., imageUrl)
      map((post) => {
        const stored = this.getStoredPosts().find(p => p.slug === slug);
        return stored && stored.imageUrl && !post.imageUrl 
          ? { ...post, imageUrl: stored.imageUrl } 
          : post;
      }),
      catchError(() => {
        const found = this.getStoredPosts().find(p => p.slug === slug);
        return of(found as BlogPost);
      })
    );
  }

  createBlogPost(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.apiUrl}/posts`, post).pipe(
      // Ensure imageUrl is preserved if backend omits it
      map((created) => {
        const withImage = (created.imageUrl || post.imageUrl)
          ? { ...created, imageUrl: created.imageUrl || post.imageUrl }
          : created;
        // Store/merge locally so lists can pick up imageUrl immediately
        const existing = this.getStoredPosts();
        const updated = [withImage as BlogPost, ...existing.filter(e => e.slug !== withImage.slug)];
        this.saveStoredPosts(updated);
        return withImage as BlogPost;
      }),
      catchError(() => {
        const existing = this.getStoredPosts();
        const newPost: BlogPost = {
          id: existing.length + 1,
          title: post.title || 'Untitled',
          date: new Date().toISOString().slice(0, 10),
          slug: (post.slug || (post.title || 'untitled').toLowerCase().replace(/\s+/g, '-')) + '-' + (MOCK_POSTS.length + 1),
          content: post.content || '',
          excerpt: post.excerpt || (post.content ? String(post.content).slice(0, 160) : ''),
          imageUrl: post.imageUrl
        };
        const updated = [newPost, ...existing];
        this.saveStoredPosts(updated);
        return of(newPost);
      })
    );
  }

  private getStoredPosts(): BlogPost[] {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try { return JSON.parse(raw) as BlogPost[]; } catch { /* fallthrough */ }
    }
    // seed with mock data once
    this.saveStoredPosts(MOCK_POSTS);
    return MOCK_POSTS;
  }

  private saveStoredPosts(posts: BlogPost[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(posts));
  }
}

// Temporary mock data used when backend is not available
const MOCK_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Welcome to the Blog',
    date: '2025-01-01',
    slug: 'welcome-to-the-blog',
    content: 'This is a placeholder post so you can see the UI working.',
    excerpt: 'This is a placeholder post so you can see the UI working.'
  },
  {
    id: 2,
    title: 'Second Post',
    date: '2025-02-15',
    slug: 'second-post',
    content: 'Another example post served from in-memory data when the API is down.',
    excerpt: 'Another example post served from in-memory data when the API is down.'
  },
  {
    id: 3,
    title: 'Angular Standalone Components',
    date: '2025-03-10',
    slug: 'angular-standalone-components',
    content: 'Your app uses standalone components and lazy routes.',
    excerpt: 'Your app uses standalone components and lazy routes.'
  }
];