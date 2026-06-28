import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService, BlogPost } from '../../core/services/blog/blog.service';
import { LucideCalendar, LucideArrowRight, LucideLoaderCircle, LucideUser, LucideFileText } from '@lucide/angular';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, DatePipe, LucideCalendar, LucideArrowRight, LucideLoaderCircle, LucideUser, LucideFileText],
  template: `
    <div dir="rtl" class="p-4 md:p-6 max-w-3xl mx-auto">
      <!-- BACK -->
      <a routerLink="/blogs" class="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors no-underline mb-4">
        <svg lucideArrowRight class="w-4 h-4"></svg>
        <span>العودة إلى المدونة</span>
      </a>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <svg lucideLoaderCircle class="w-8 h-8 text-[var(--primary)] animate-spin"></svg>
        </div>
      } @else if (error() || !post()) {
        <div class="text-center py-20">
          <svg lucideFileText class="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4"></svg>
          <p class="text-[var(--text-secondary)]">المقال غير موجود</p>
          <a routerLink="/blogs" class="inline-block mt-4 text-sm font-semibold text-[var(--primary)]">العودة إلى المدونة</a>
        </div>
      } @else {
        <article>
          <div class="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
            <svg lucideCalendar class="w-3.5 h-3.5"></svg>
            <span>{{ post()!.createdAt | date:'d MMM yyyy' }}</span>
            <span class="mx-1.5">·</span>
            <svg lucideUser class="w-3.5 h-3.5"></svg>
            <span>{{ post()!.author.name }}</span>
          </div>
          @if (post()!.coverImage) {
            <img [src]="getFileUrl(post()!.coverImage!)" alt="" class="w-full h-56 object-cover rounded-xl mb-4">
          }
          <h1 class="text-2xl font-extrabold text-[var(--text-primary)] mb-4">{{ post()!.title }}</h1>
          @if (post()!.excerpt) {
            <p class="text-[var(--text-secondary)] mb-6">{{ post()!.excerpt }}</p>
          }
          <div class="prose prose-sm max-w-none text-[var(--text-primary)] [&_h1]:text-xl [&_h1]:font-extrabold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pr-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:text-[var(--primary)] [&_a]:underline [&_blockquote]:border-r-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:bg-[var(--bg-base)] [&_blockquote]:rounded-lg [&_blockquote]:text-[var(--text-secondary)] [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full" [innerHTML]="post()!.content"></div>
        </article>
      }
    </div>
  `,
})
export class BlogDetailComponent implements OnInit {
  private blogSvc = inject(BlogService);
  private route = inject(ActivatedRoute);
  post = signal<BlogPost | null>(null);
  loading = signal(true);
  error = signal(false);

  getFileUrl(path: string): string {
    if (!path || path.startsWith('http')) return path;
    return `${environment.fileUrl}${path}`;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.error.set(true); this.loading.set(false); return; }
    this.blogSvc.getPost(slug).subscribe({
      next: res => { this.post.set(res); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
