// 1. Adicione "HostListener" e "ElementRef" nos imports do @angular/core:
import { Component, OnInit, HostListener, ElementRef, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

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

  private router = inject(Router);
  private elementRef = inject(ElementRef); // 2. Injeta a referência do elemento

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  // 3. NOVO: Fecha o menu automaticamente quando clica em qualquer outro sítio do ecrã!
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
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
