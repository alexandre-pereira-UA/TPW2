import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

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
  userId: number | null = null; // Guardará o ID numérico
  isSuperuser = false;
  dropdownOpen = false;

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      this.isLoggedIn = true;
      const user = JSON.parse(userJson);
      this.username = user.username;
      this.userId = user.id; // Guarda o ID para a rota de edição!
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
