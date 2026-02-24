import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  //  LOGIN
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  //  CADASTRO
  async cadastrar(name: string, email: string, password: string) {
    const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);

    if (cred.user) {
      await this.firestore.collection('usuarios').doc(cred.user.uid).set({
        name: name,
        email: email,
        role: 'LEITOR', // padrão
        criadoEm: new Date(),
        ativo: true
      });
    }

    return cred;
  }
  //  LOGOUT
  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  //  Verificar se está logado
  getAuthState() {
    return this.afAuth.authState;
  }

  getUserRole() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of(null);

        return this.firestore.collection('usuarios')
          .doc(user.uid)
          .valueChanges();
      })
    );
  }
}