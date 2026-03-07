import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AppUser, UserRole } from '../../core/models/user.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  // Dados dos usuários na tabela
  usuarios: AppUser[] = [];
  usuariosFiltrados: AppUser[] = [];
  termoBusca: string = '';

  // Controle de UI e Sidebar
  loading: boolean = true; // Necessário para o *ngIf no HTML
  userName: string = '';
  userRole: UserRole | null = null;
  isDarkMode: boolean = false;

  roles: UserRole[] = ['ADMIN', 'ESTOQUISTA', 'LEITOR'];

  novoUser = {
    name: '',
    email: '',
    password: '',
    role: 'LEITOR' as UserRole
  };

  constructor(
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    // 1. Configuração inicial do tema
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    // 2. Carrega dados do usuário logado para a Sidebar
    this.authService.getUserRole().subscribe({
      next: (userData: any) => {
        if (userData) {
          this.userName = userData.name;
          this.userRole = userData.role;
        }
      }
    });

    // 3. Carrega a lista de todos os usuários
    this.authService.getAllUsers().subscribe(data => {
      this.usuarios = data.filter(user => user.isActive !== false);
      this.usuariosFiltrados = [...this.usuarios];
      this.loading = false; // Libera a tela após carregar
      this.filtrarUsuarios();
    });
  }

  // Lógica de busca corrigida (Usa || para filtrar por vários campos)
  filtrarUsuarios() {
    const termo = this.termoBusca.toLowerCase().trim();

    if (!termo) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(user =>
      user.name.toLowerCase().includes(termo) ||
      user.email.toLowerCase().includes(termo))
  }

  alterarRole(uid: string, event: any) {
    const novoRole = event.target.value as UserRole;
    this.authService.updateUserRole(uid, novoRole)
      .then(() => alert('Permissão atualizada!'))
      .catch(err => alert('Erro ao atualizar: ' + err));
  }

  desativar(uid: string) {
    if (confirm('Tem certeza que deseja desativar este funcionário?')) {
      this.authService.updateUserStatus(uid, false)
        .then(() => alert('Funcionário desativado com sucesso!'))
        .catch(err => alert('Erro ao desativar: ' + err));
    }
  }

  async adicionarUsuario() {
    const { name, email, password, role } = this.novoUser;

    if (!name || !email || !password) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      await this.authService.cadastrarComRole(name, email, password, role);
      alert('Funcionário cadastrado com sucesso!');
      this.novoUser = { name: '', email: '', password: '', role: 'LEITOR' };
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar funcionário. Verifique se o e-mail já existe.');
    }
  }

  // Controle de Tema Global
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

  onLogout() {
    this.authService.logout();
  }
}