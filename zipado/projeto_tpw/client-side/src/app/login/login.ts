import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';

  private router = inject(Router);

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    try {
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.is_superuser) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        this.errorMessage = data.error || 'Credenciais inválidas.';
      }
    } catch (error) {
      this.errorMessage = 'Erro de ligação com o servidor.';
    }
  }
}
