import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService, BlogPost } from '../../../../core/services/blog/blog.service';
import {
  LucideCalendar,
  LucideArrowLeft,
  LucideLoaderCircle,
  LucideFileText,
  LucideUser,
} from '@lucide/angular';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-blog-carousel',
  imports: [
    RouterLink,
    DatePipe,
    LucideCalendar,
    LucideArrowLeft,
    LucideLoaderCircle,
    LucideFileText,
    LucideUser,
  ],
  templateUrl: './blog-carousel.component.html',
})
export class BlogCarouselComponent implements OnInit {
  private blogSvc = inject(BlogService);
  private router = inject(Router);

  posts = signal<BlogPost[]>([]);
  loading = signal(true);
  error = signal(false);

  getFileUrl(path: string): string {
    if (!path || path.startsWith('http')) return path;
    return `${environment.fileUrl}${path}`;
  }

  ngOnInit(): void {
    this.blogSvc.getPosts().subscribe({
      next: res => {
        this.posts.set(res.slice(0, 3));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  goToPost(slug: string): void {
    this.router.navigate(['/blogs/blog', slug]);
  }
}
