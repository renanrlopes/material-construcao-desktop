import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AppUser, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss' 
})
export class DashboardComponent implements OnInit {
  usuario: AppUser | null = null;
  userName: string = '';
  userRole: UserRole | null = null;
  loading: boolean = true;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService, // Injeção do seu colega
    private renderer: Renderer2,      // Suas novas injeções
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    this.authService.getUserRole().subscribe({
      next: (userData: any) => {
        if (userData) {
          this.userName = userData.name;
          this.userRole = userData.role;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
        this.loading = false;
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }
}