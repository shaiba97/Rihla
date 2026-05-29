import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService, BlogPost } from '../../core/services/blog/blog.service';
import { LucideCalendar, LucideArrowRight, LucideArrowLeft, LucideLoaderCircle, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, DatePipe, LucideCalendar, LucideArrowRight, LucideArrowLeft, LucideLoaderCircle, LucideFileText],
  template: `
    <div dir="rtl" class="p-4 md:p-6 max-w-4xl mx-auto">
      <!-- BACK -->
      <a routerLink="/home" class="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors no-underline mb-4">
        <svg lucideArrowRight class="w-4 h-4"></svg>
        <span>العودة إلى الرئيسية</span>
      </a>

      <!-- HEADER -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-1">
          <svg lucideFileText class="w-6 h-6 text-[var(--primary)]"></svg>
          <h1 class="text-xl font-extrabold text-[var(--text-primary)]">المدونة</h1>
        </div>
        <p class="text-sm text-[var(--text-secondary)]">آخر المقالات والتحديثات</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <svg lucideLoaderCircle class="w-8 h-8 text-[var(--primary)] animate-spin"></svg>
        </div>
      } @else if (error()) {
        <div class="text-center py-20">
          <p class="text-[var(--text-secondary)]">تعذر تحميل المقالات</p>
        </div>
      } @else if (posts().length === 0) {
        <div class="text-center py-20">
          <svg lucideFileText class="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4"></svg>
          <p class="text-[var(--text-secondary)]">لا توجد مقالات بعد</p>
        </div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2">
          @for (post of posts(); track post.id) {
            <a [routerLink]="['/blogs/blog', post.slug]"
              class="block bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md hover:border-[var(--primary)]/30 transition-all no-underline group">
              <div class="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
                <svg lucideCalendar class="w-3.5 h-3.5"></svg>
                <span>{{ post.createdAt | date:'d MMM yyyy' }}</span>
                <span class="mx-1.5">·</span>
                <span>{{ post.author.name }}</span>
              </div>
              <h2 class="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--primary)] transition-colors">{{ post.title }}</h2>
              @if (post.excerpt) {
                <p class="text-sm text-[var(--text-secondary)] line-clamp-2">{{ post.excerpt }}</p>
              }
              <div class="flex items-center gap-1 mt-3 text-xs font-semibold text-[var(--primary)]">
                <span>اقرأ المزيد</span>
                <svg lucideArrowLeft class="w-3.5 h-3.5"></svg>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class BlogComponent implements OnInit {
  private blogSvc = inject(BlogService);
  posts = signal<BlogPost[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.blogSvc.getPosts().subscribe({
      next: res => { this.posts.set(res); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }
}
