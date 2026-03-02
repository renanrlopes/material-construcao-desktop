import { Component, OnInit } from '@angular/core'; 
import { AuthService } from '../../core/services/auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'] 
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';

  // Variáveis que controlam o aparecimento do aviso no seu HTML
  isDarkMode: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
      this.isDarkMode = true;
    }
  }

  // --- LÓGICA ATUALIZADA: SAI O ALERT(), ENTRA O AVISO NO HTML ---
  async enviarEmail() {
    // Limpa avisos anteriores antes de começar
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Por favor, digite seu e-mail.'; // Substitui alert
      return;
    }

    this.loading = true;

    try {
      // 1. Verifica se o funcionário existe no banco conforme a modelagem
      const existe = await this.authService.verificarEmailExiste(this.email.trim());

      if (existe) {
        // 2. Se existe, dispara o processo de passwordReset
        await this.authService.resetPassword(this.email.trim());
        this.successMessage = 'Link de recuperação enviado com sucesso!';
        
        // Redireciona após 3 segundos para o usuário conseguir ler o aviso
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      } else {
        // 3. Erro de e-mail não encontrado na tabela de funcionários
        this.errorMessage = 'Este e-mail não está cadastrado no sistema de funcionários.';
      }
    } catch (error) {
      console.error('Erro ao processar recuperação:', error);
      this.errorMessage = 'Ocorreu um erro técnico. Tente novamente mais tarde.';
    } finally {
      this.loading = false;
    }
  }

  voltarLogin() {
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  // Função para limpar o aviso (usada no botão "Ok" ou fechar)
  fecharAviso() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}