import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { DxToolbarModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, DxToolbarModule, DxButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'Family Expenses';
}
