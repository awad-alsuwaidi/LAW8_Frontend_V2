import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ToastQueueService {

  private queue: any[] = [];
  private isShowing = false;

  constructor(private messageService: MessageService) {}

  enqueue(notification: any) {
    this.queue.push(notification);

    if (!this.isShowing) {
      this.showNext();
    }
  }

  private showNext() {

    if (!this.queue.length) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;

    const notification = this.queue.shift();

    this.messageService.add({
      key: 'notification',
      severity: 'info',
      summary: notification.lable,
      detail: notification.message || notification.description,
      life: 3000,
      closable: true,
      data: notification
    });

    setTimeout(() => {
      this.isShowing = false;
      this.showNext();
    }, 3000);
  }
}