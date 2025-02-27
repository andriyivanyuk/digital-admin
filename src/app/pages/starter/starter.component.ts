import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { WebSocketService } from 'src/app/services/websocket.service';
@Component({
  selector: 'app-starter',
  imports: [MaterialModule],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  readonly webSocketService = inject(WebSocketService);

  ngOnInit(): void {
    // this.webSocketService.socket.on('newOrder', (order) => {
    //   console.log('🔔 ОТРИМАНО ЗАМОВЛЕННЯ (без Observable):', order);
    // });
    this.webSocketService.onNewOrder().subscribe((order) => {
      console.log('🔔 ОТРИМАНО WS-ПОДІЮ через Subject:', order);
    });
  }
}
