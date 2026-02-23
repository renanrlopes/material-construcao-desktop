import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) { }

  //  LOGIN
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  //  CADASTRO
  cadastrar(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  //  LOGOUT
  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  //  Verificar se está logado
  isLoggedIn() {
    return this.afAuth.authState;
  }
}