import { Component, OnInit } from '@angular/core'; // 1. Adicionado o OnInit aqui
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit { // 2. Adicionado o implements OnInit
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Variável do tema
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // 3. O Angular roda isso sozinho quando a tela abre
  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
      this.isDarkMode = true; // Se o "caderninho" diz que é dark, já inicia dark
    }
  }

  async cadastrar() {

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }

    if (this.name.trim().length < 3) {
      this.errorMessage = 'Nome deve ter pelo menos 3 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.cadastrar(
        this.name.trim(),
        this.email.trim(),
        this.password
      );

      this.successMessage = 'Cadastro realizado com sucesso! Faça login.';

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);

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

  goToLogin() {
    this.router.navigate(['/']);
  }

  // 4. Atualizamos o botão para salvar a escolha
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    
    // Salva a nova escolha no navegador
    if (this.isDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }
  
}