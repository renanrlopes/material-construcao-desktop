import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async cadastrar() {

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.cadastrar(
        this.name,
        this.email,
        this.password
      );

      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      this.errorMessage = this.tratarErro(error.code);
    } finally {
      this.loading = false;
    }
  }

  private tratarErro(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/weak-password':
        return 'Senha deve ter pelo menos 6 caracteres.';
      default:
        return 'Erro ao cadastrar. Tente novamente.';
    }
  }
}