import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LinkService, Link } from './link.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private svc = inject(LinkService);

  inputUrl = '';
  submitting = signal(false);
  createdLink = signal<Link | null>(null);
  formError = signal('');
  links = signal<Link[]>([]);
  loadError = signal('');

  ngOnInit(): void {
    this.loadLinks();
  }

  get urlValid(): boolean {
    try {
      const u = new URL(this.inputUrl);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  submit(): void {
    if (!this.urlValid) return;
    this.submitting.set(true);
    this.formError.set('');
    this.createdLink.set(null);
    this.svc.shorten(this.inputUrl).subscribe({
      next: (link) => {
        this.createdLink.set(link);
        this.inputUrl = '';
        this.submitting.set(false);
        this.loadLinks();
      },
      error: (err: HttpErrorResponse) => {
        this.formError.set(err.error?.error ?? err.message ?? 'Network error');
        this.submitting.set(false);
      }
    });
  }

  private loadLinks(): void {
    this.svc.getAll().subscribe({
      next: (all) => this.links.set(all),
      error: () => this.loadError.set('Could not load links.')
    });
  }
}
