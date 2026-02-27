import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AppUser, UserRole } from '../../core/models/user.model';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: AppUser[] = [];
  roles: UserRole[] = ['ADMIN', 'ESTOQUISTA', 'LEITOR'];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAllUsers().subscribe(data => {
      // Filtra a lista para exibir apenas quem está com isActive: true
      this.usuarios = data.filter(user => user.isActive !== false);
    });
  }

  alterarRole(uid: string, event: any) {
    const novoRole = event.target.value as UserRole;
    this.authService.updateUserRole(uid, novoRole)
      .then(() => alert('Permissão atualizada!'))
      .catch(err => alert('Erro ao atualizar: ' + err));
  }

  desativar(uid: string) {
    if (confirm('Tem certeza que deseja desativar este funcionário? ele perderá o acesso ao sistema.')) {
      this.authService.updateUserStatus(uid, false)
        .then(() => alert('Funcionário desativado com sucesso!'))
        .catch(err => alert('Erro ao desativar: ' + err));
    }
  }

  novoUser = {
    name: '',
    email: '',
    password: '',
    role: 'LEITOR' as UserRole
  };


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

}