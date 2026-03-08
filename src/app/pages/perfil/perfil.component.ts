import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AppUser } from '../../core/models/user.model';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  usuario: AppUser | null = null;
  loading: boolean = true;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {

    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    this.authService.getUserRole().subscribe({
      next: (data) => {
        this.usuario = data as AppUser;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.loading = false;
      }
    });
  }

  // Atalho para o funcionário resetar a própria senha se desejar
  solicitarReset() {
    if (this.usuario?.email) {
      this.authService.resetPassword(this.usuario.email)
        .then(() => alert('E-mail de redefinição enviado!'))
        .catch(() => alert('Erro ao enviar e-mail.'));
    }
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