import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registo.html',
  styleUrl: './registo.css'
})
export class Registo {
  username = '';
  first_name = '';
  last_name = '';
  email = '';
  password = '';
  errorMessage = '';

  private router = inject(Router);

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    try {
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/registo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        this.errorMessage = data.error || 'Erro ao criar conta.';
      }
    } catch (error) {
      this.errorMessage = 'Erro de ligação com o servidor.';
    }
  }
}
