import { Component, OnInit, HostListener, ElementRef, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { ToastService } from './services/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'client-side';
  isLoggedIn = false;
  username = '';
  userId: number | null = null;
  isSuperuser = false;
  dropdownOpen = false;

  isLightTheme = false;

  private router = inject(Router);
  private elementRef = inject(ElementRef);

  public toastService = inject(ToastService);


  ngOnInit(): void {
    this.checkLoginStatus();
    this.checkThemeStatus();
  }

  checkThemeStatus(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
        document.body.classList.add('light-theme');
    } else {
      this.isLightTheme = false;
      document.body.classList.remove('light-theme');
    }
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    if (this.isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }


  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      this.isLoggedIn = true;
      const user = JSON.parse(userJson);
      this.username = user.username;
      this.userId = user.id;
      this.isSuperuser = user.is_superuser;
    } else {
      this.isLoggedIn = false;
      this.username = '';
      this.userId = null;
      this.isSuperuser = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.username = '';
    this.userId = null;
    this.isSuperuser = false;
    this.dropdownOpen = false;
    window.location.href = '/';
  }
}
