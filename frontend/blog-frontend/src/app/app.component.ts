import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { CreatePostDialogComponent } from './components/create-post-dialog/create-post-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ]
})
export class AppComponent {
  title = 'BlogPost';

  constructor(private dialog: MatDialog, private router: Router) {}

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreatePostDialogComponent, {
      width: '760px',
      maxWidth: '92vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If we're on the blogs route, reload data by navigating to it
        if (this.router.url.startsWith('/blogs') || this.router.url === '/') {
          // Soft navigation to trigger data reload
          this.router.navigateByUrl('/blogs');
        }
      }
    });
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateHome() {
    this.router.navigate(['/']);
  }
}