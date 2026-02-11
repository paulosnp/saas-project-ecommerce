import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, HeaderComponent],
    template: `
    <app-sidebar />
    <app-header />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
    styles: [`
    .main-content {
      margin-left: var(--sidebar-width);
      margin-top: var(--header-height);
      padding: 24px;
      min-height: calc(100vh - var(--header-height));
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
    }
  `]
})
export class LayoutComponent { }
