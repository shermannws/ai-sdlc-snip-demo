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

const API = 'http://localhost:3000';

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
