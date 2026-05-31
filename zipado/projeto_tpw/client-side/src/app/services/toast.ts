import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  message: string = '';
  type: 'success' | 'danger' = 'success';
  visible: boolean = false;

  confirmVisible: boolean = false;
  confirmTitle: string = '';
  confirmCallback: (() => void) | null = null; // Guarda a função que deve correr se escolher "Sim"

  constructor() {
    // Verifica se há alguma notificação pendente guardada no navegador ao iniciar
    const pendingMsg = localStorage.getItem('pending_toast_msg');
    const pendingType = localStorage.getItem('pending_toast_type');
    if (pendingMsg && pendingType) {
      this.show(pendingMsg, pendingType as 'success' | 'danger');
      localStorage.removeItem('pending_toast_msg');
      localStorage.removeItem('pending_toast_type');
    }
  }

  show(msg: string, type: 'success' | 'danger' = 'success'): void {
    this.message = msg;
    this.type = type;
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  // Novo: Regista uma notificação que persistirá após a página atualizar por completo!
  showPersistent(msg: string, type: 'success' | 'danger' = 'success'): void {
    localStorage.setItem('pending_toast_msg', msg);
    localStorage.setItem('pending_toast_type', type);
  }

  // Abre a caixinha de confirmação com um título e uma ação personalizada
  askConfirmation(title: string, callback: () => void): void {
    this.confirmTitle = title;
    this.confirmCallback = callback;
    this.confirmVisible = true;
  }

  // Executa se clicar em "Sim, Apagar"
  confirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmation();
  }

  // Executa se clicar em "Não, Cancelar"
  closeConfirmation(): void {
    this.confirmVisible = false;
    this.confirmCallback = null;
  }
}
