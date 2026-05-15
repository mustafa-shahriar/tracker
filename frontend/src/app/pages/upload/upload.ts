import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Category } from '../../app.types';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [Navbar, ReactiveFormsModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload implements OnInit {
  trackerUrl = signal<string>('');
  private http = inject(HttpClient);
  private router = inject(Router);
  error = signal<string>('');
  copied = signal<boolean>(false);
  categories: { value: Category; label: string }[] = [
    { value: 'movie', label: 'Movie' },
    { value: 'series', label: 'Series' },
    { value: 'anime', label: 'Anime' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'game', label: 'Game' },
    { value: 'software', label: 'Software' },
    { value: 'music', label: 'Music' },
    { value: 'book', label: 'Book' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'audiobook', label: 'Audiobook' },
    { value: 'course', label: 'Course' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'other', label: 'Other' },
  ];

  file: File | null = null;
  cover: File | null = null;

  uploadForm = new FormGroup({
    title: new FormControl<string | null>(''),
    description: new FormControl<string | null>(''),
    category: new FormControl<Category>('other', Validators.required),
    languages: new FormControl<string[]>([]),
    subtitles: new FormControl<string[]>([]),
  });

  ngOnInit(): void {
    this.http.get<{ passKey: string }>('/torrent/tracker_url').subscribe({
      next: (res) => {
        console.log(res);
        this.trackerUrl.set(`${Environment.baseUrl}/tracker/${res.passKey}/announce`);
      },
      error: (_) => this.error.set('failed to connect to server'),
    });
  }

  addLanguage(value: string) {
    const lang = value.trim();
    if (!lang) return;

    const current = this.uploadForm.value.languages ?? [];
    if (current.includes(lang)) return;

    this.uploadForm.patchValue({
      languages: [...current, lang],
    });
  }

  removeLanguage(lang: string) {
    const current = this.uploadForm.value.languages ?? [];

    this.uploadForm.patchValue({
      languages: current.filter((l) => l !== lang),
    });
  }

  addSubtitle(value: string) {
    const sub = value.trim();
    if (!sub) return;

    const current = this.uploadForm.value.subtitles ?? [];
    if (current.includes(sub)) return;

    this.uploadForm.patchValue({
      subtitles: [...current, sub],
    });
  }

  removeSubtitle(sub: string) {
    const current = this.uploadForm.value.subtitles ?? [];

    this.uploadForm.patchValue({
      subtitles: current.filter((s) => s !== sub),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.file = files[0];
    }
  }

  onCoverSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.cover = files[0];
    }
  }

  onSubmit() {
    if (!this.file) {
      this.setError('Torrent file is required');
      return;
    }

    if (this.uploadForm.invalid) {
      this.setError('Please fill required fields');
      return;
    }

    const value = this.uploadForm.value;
    const formData = new FormData();

    if (value.title) formData.append('title', value.title);
    if (value.description) formData.append('description', value.description);
    if (value.category) formData.append('category', value.category);

    formData.append('languages', JSON.stringify(value.languages ?? []));
    formData.append('subtitles', JSON.stringify(value.subtitles ?? []));

    formData.append('file', this.file);
    console.log(typeof this.file);

    if (this.cover) {
      formData.append('cover', this.cover);
    }
    console.log(formData);
    this.uploadTorrent(formData);
  }

  uploadTorrent(formData: FormData) {
    this.http.post<{ message: string; torrentId: number }>('/torrent', formData).subscribe({
      next: (res) => {
        console.log(res);
        this.router.navigate(['torrent', res.torrentId]);
      },
      error: (err) => this.setError(err.message),
    });
  }

  copyTracker() {
    navigator.clipboard.writeText(this.trackerUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
  setError(err: string) {
    this.error.set(err);
    setTimeout(() => this.error.set(''), 2000);
  }
}
