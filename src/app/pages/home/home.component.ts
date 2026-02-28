import { Component, OnInit } from '@angular/core'; // 1. Adicionado o OnInit
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit { // 2. Adicionado implements OnInit

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

  // 3. Lê o caderninho do navegador quando a tela de login carrega
  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    if (temaSalvo === 'dark') {
      this.isDarkMode = true; // Se estiver dark lá, liga o modo escuro aqui
    }
  }

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

  // 4. Inverte o tema E salva a escolha no navegador
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    
    // Salva a nova escolha no caderninho
    if (this.isDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }
}