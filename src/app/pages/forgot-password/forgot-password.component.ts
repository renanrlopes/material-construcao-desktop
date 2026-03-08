import { Component, OnInit, Renderer2, Inject } from '@angular/core'; // Adicionado Renderer2 e Inject
import { DOCUMENT } from '@angular/common'; // Adicionado DOCUMENT
import { AuthService } from '../../core/services/auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'] 
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';

  isDarkMode: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2, // Injetado para manipular o body global
    @Inject(DOCUMENT) private document: Document // Injetado para acesso ao documento
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme(); // Garante que o tema inicie correto ao abrir a tela
  }

  async enviarEmail() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Por favor, digite seu e-mail.'; 
      return;
    }

    this.loading = true;

    try {
      // Verifica se o funcionário existe conforme a modelagem de dados
      const existe = await this.authService.verificarEmailExiste(this.email.trim());

      if (existe) {
        await this.authService.resetPassword(this.email.trim());
        this.successMessage = 'Link de recuperação enviado com sucesso!';
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      } else {
        this.errorMessage = 'Este e-mail não está cadastrado no sistema de funcionários.';
      }
    } catch (error) {
      console.error('Erro ao processar recuperação:', error);
      this.errorMessage = 'Ocorreu um erro técnico. Tente novamente mais tarde.';
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

  voltarLogin() {
    this.router.navigate(['/']);
  }
}