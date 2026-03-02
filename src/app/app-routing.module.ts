import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoleGuard } from './core/guards/auth.guard';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ProdutosComponent } from './pages/produtos/produtos.component';
import { EstoqueComponent } from './pages/estoque/estoque.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] } // Restrição de nível Admin
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'produtos',
    component: ProdutosComponent,
    canActivate: [RoleGuard]
  },
  {
    path: 'estoque',    
    component: EstoqueComponent,
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }