import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'blogs', 
    pathMatch: 'full' 
  },
  { 
    path: 'blogs', 
    loadComponent: () => import('./components/blog-list/blog-list.component').then(m => m.BlogListComponent)
  },
  { 
    path: 'posts/:slug', 
    loadComponent: () => import('./components/blog-post/blog-post.component').then(m => m.BlogPostComponent)
  },
  { 
    path: 'search', 
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent)
  },
  { 
    path: '**', 
    redirectTo: 'blogs' 
  }
];
