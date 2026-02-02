import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { DxToolbarModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink, DxToolbarModule, DxButtonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  title = signal('Admin Panel');
}