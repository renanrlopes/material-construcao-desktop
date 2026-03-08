import { Component, OnInit, Renderer2, Inject } from '@angular/core'; // Injetado Renderer2 e Inject
import { DOCUMENT } from '@angular/common'; // Injetado DOCUMENT para acesso global
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  hidePassword: boolean = true;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2, // Permite manipular classes no body
    @Inject(DOCUMENT) private document: Document // Permite acessar o body da página
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme(); // Garante que o tema inicie correto ao abrir a tela
  }

  // Lógica de cadastro mantida conforme sua modelagem
  async cadastrar() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.cadastrar(this.name.trim(), this.email.trim(), this.password);
      this.successMessage = 'Cadastro realizado com sucesso! Faça login.';
      setTimeout(() => this.router.navigate(['/']), 1500);
    } catch (error: any) {
      this.errorMessage = 'Erro ao cadastrar. Tente novamente.';
    } finally {
      this.loading = false;
    }
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

  fecharAviso() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToLogin() {
    this.router.navigate(['/']);
  }

  //Função botão ocultar senha 
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}