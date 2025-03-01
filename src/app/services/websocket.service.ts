import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  public socket: Socket;
  private orderSubject = new Subject<any>();

  readonly tokenStorageService = inject(TokenStorageService);

  constructor() {
    this.socket = io('http://localhost:5500', {
      extraHeaders: {
        Authorization: `Bearer ${this.tokenStorageService.getToken()}`,
      },
    });

    this.socket.on('newOrder', (order) => {
      this.orderSubject.next(order);
    });
  }

  public onNewOrder(): Observable<any> {
    return this.orderSubject.asObservable();
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
