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
      this.usuarios = data as AppUser[];
    });
  }

  alterarRole(uid: string, event: any) {
    const novoRole = event.target.value as UserRole;
    this.authService.updateUserRole(uid, novoRole)
      .then(() => alert('Permissão atualizada!'))
      .catch(err => alert('Erro ao atualizar: ' + err));
  }

  deletar(uid: string) {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      this.authService.deleteUser(uid);
    }
  }
}