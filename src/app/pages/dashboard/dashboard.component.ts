import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRole: UserRole | null = null;
  loading: boolean = true;
  isDarkMode: boolean = false;

  productCount: number = 0;
  itensEstoque: number = 0;
  monthLowRegistrations: number = 0;
  criticalItems: number = 0;

  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    // 1. Configuração do Tema
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    // 2. Carregar Dados do Usuário Logado
    this.authService.getUserRole().subscribe({
      next: (userData: any) => {
        if (userData) {
          this.userName = userData.name;
          this.userRole = userData.role;

          // Aqui você pode chamar as funções para buscar os números reais do Firebase futuramente
          this.carregarDadosIniciais();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
        this.loading = false;
      }
    });
  }

  // Função para popular os cards (Exemplo com valores iniciais)
  private carregarDadosIniciais() {
    this.productCount = 0;
    this.itensEstoque = 0;
    this.monthLowRegistrations = 0;
    this.criticalItems = 0;
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