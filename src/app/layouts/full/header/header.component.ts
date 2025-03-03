import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
  OnInit,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { AuthService } from 'src/app/pages/authentication/services/auth.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/pages/authentication/models/user';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  providers: [AuthService],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  readonly tokenStorage = inject(TokenStorageService);

  user: User;

  public logout() {
    this.tokenStorage.clearToken();
    this.router.navigate(['/authentication/login']);
  }

  ngOnInit(): void {
    this.user = this.tokenStorage.getUserSession();
  }
}
