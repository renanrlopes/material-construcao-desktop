import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  // Variáveis do seu parceiro
  email: string = '';
  senha: string = '';
  erro: string = '';
  
  // Nossa nova variável para o Modo Escuro
  isDarkMode: boolean = false; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async fazerLogin() {
    this.erro = '';

    try {
      await this.authService.login(this.email, this.senha);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.erro = 'Email ou senha inválidos';
      console.error(error);
    }
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }

  irParaEsqueceuSenha() {
    this.router.navigate(['/forgot-password']);
  }

  // Nossa nova função que inverte o tema
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }
}