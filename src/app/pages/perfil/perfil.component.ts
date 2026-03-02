import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AppUser } from '../../core/models/user.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  usuario: AppUser | null = null;
  loading: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getUserRole().subscribe({
      next: (data) => {
        this.usuario = data as AppUser;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.loading = false;
      }
    });
  }

  // Atalho para o funcionário resetar a própria senha se desejar
  solicitarReset() {
    if (this.usuario?.email) {
      this.authService.resetPassword(this.usuario.email)
        .then(() => alert('E-mail de redefinição enviado!'))
        .catch(() => alert('Erro ao enviar e-mail.'));
    }
  }
}