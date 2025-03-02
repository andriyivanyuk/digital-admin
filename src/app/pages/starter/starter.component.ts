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
  ngOnInit(): void {}
}
