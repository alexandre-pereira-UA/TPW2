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
  confirmCallback: (() => void) | null = null;

  constructor() {
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

  showPersistent(msg: string, type: 'success' | 'danger' = 'success'): void {
    localStorage.setItem('pending_toast_msg', msg);
    localStorage.setItem('pending_toast_type', type);
  }

  askConfirmation(title: string, callback: () => void): void {
    this.confirmTitle = title;
    this.confirmCallback = callback;
    this.confirmVisible = true;
  }

  confirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmation();
  }

  closeConfirmation(): void {
    this.confirmVisible = false;
    this.confirmCallback = null;
  }
}
