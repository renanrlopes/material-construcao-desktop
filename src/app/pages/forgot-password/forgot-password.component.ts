import { Component, OnInit } from '@angular/core'; // 1. Adicionado OnInit
import { AuthService } from '../../core/services/auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'] 
})
export class ForgotPasswordComponent implements OnInit { // 2. Adicionado implements OnInit
  email: string = '';

  // --- VARIÁVEIS ADICIONADAS APENAS PARA O HTML/CSS NÃO DAR ERRO ---
  isDarkMode: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // --- LÓGICA DO MODO ESCURO (Lê o localStorage) ---
  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
      this.isDarkMode = true;
    }
  }

  // --- LÓGICA DO SEU COLEGA (INTACTA!) ---
  async enviarEmail() {
    if (!this.email) {
      alert('Por favor, digite seu e-mail.');
      return;
    }

    try {
      // 1. Verifica se o funcionário existe no banco de dados (Firestore)
      const existe = await this.authService.verificarEmailExiste(this.email);

      if (existe) {
        // 2. Se existe, envia o e-mail de recuperação
        await this.authService.resetPassword(this.email);
        alert('Link de recuperação enviado para o e-mail informado!');
        this.router.navigate(['/']);
      } else {
        // 3. Se não existe, avisa o usuário
        alert('Este e-mail não está cadastrado no sistema de funcionários.');
      }
    } catch (error) {
      console.error('Erro ao processar recuperação:', error);
      alert('Ocorreu um erro técnico. Tente novamente mais tarde.');
    }
  }

  // Botão "Voltar para o login"
  voltarLogin() {
    this.router.navigate(['/']);
  }

  // Botão de trocar o tema
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }
}