import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Link {
  code: string;
  url: string;
  shortUrl: string;
  hits: number;
  createdAt: string;
}

// Same-origin by default so the bundled app works wherever it is deployed
// (e.g. Railway). Only the standalone Angular dev server (port 4200) needs to
// reach the separate backend on port 3000.
const API =
  typeof window !== 'undefined' && window.location.port === '4200'
    ? 'http://localhost:3000'
    : '';

@Injectable({ providedIn: 'root' })
export class LinkService {
  private http = inject(HttpClient);

  shorten(url: string): Observable<Link> {
    return this.http.post<Link>(`${API}/api/links`, { url });
  }

  getAll(): Observable<Link[]> {
    return this.http.get<Link[]>(`${API}/api/links`);
  }
}
