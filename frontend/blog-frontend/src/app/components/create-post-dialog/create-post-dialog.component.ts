import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-create-post-dialog',
  templateUrl: './create-post-dialog.component.html',
  styleUrls: ['./create-post-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class CreatePostDialogComponent {
  postForm: FormGroup;
  loading = false;
  error = '';
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreatePostDialogComponent>,
    private blogService: BlogService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      date: [new Date().toISOString().slice(0, 10), [Validators.required]],
      slug: ['', [Validators.required, Validators.minLength(3)]],
      imageUrl: [''],
      content: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.postForm.patchValue({ imageUrl: this.previewUrl });
    };
    reader.readAsDataURL(file);
  }

  onTitleChange(): void {
    const title = this.postForm.get('title')?.value;
    if (title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      this.postForm.patchValue({ slug });
    }
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.loading = true;
      this.error = '';

      const postData = this.postForm.value;
      
      this.blogService.createBlogPost(postData).subscribe({
        next: (createdPost) => {
          this.loading = false;
          this.dialogRef.close(createdPost);
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to create post. Please try again.';
          console.error('Error creating post:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}