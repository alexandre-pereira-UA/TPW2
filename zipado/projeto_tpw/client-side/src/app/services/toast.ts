import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message: string = '';
  type: 'success' | 'danger' = 'success'; // Verde (sucesso) ou Vermelho (erro)
  visible: boolean = false;

  show(msg: string, type: 'success' | 'danger' = 'success'): void {
    this.message = msg;
    this.type = type;
    this.visible = true;

    // Esconde a notificação de forma automática após 3 segundos
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}
