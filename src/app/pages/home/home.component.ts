import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  email: string = '';
  password: string = '';
  erro: string = ''; // Esta variável controla o pop-up no HTML
  loading: boolean = false;
  hidePassword: boolean = true;
  isDarkMode: boolean = false; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();
  }

  async fazerLogin() {
    // 1. Limpa o erro para permitir que o pop-up "suba" novamente em um novo clique
    this.erro = '';

    // 2. VALIDAÇÃO MANUAL: Se clicar sem preencher, o pop-up aparece aqui
    if (!this.email || !this.password) {
      this.erro = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Trata erros vindos do Firebase
      this.erro = 'E-mail ou senha inválidos.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  // --- Navegação e Tema ---
  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }

  irParaEsqueceuSenha() {
    this.router.navigate(['/forgot-password']);
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

  // Função para o botão "Ok, entendi" do pop-up
  fecharAviso() {
    this.erro = '';
  }

  //Função botão ocultar senha 
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}