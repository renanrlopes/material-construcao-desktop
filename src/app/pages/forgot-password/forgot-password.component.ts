import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service'; // Ajuste o caminho se necessário
import { Router } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

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
}