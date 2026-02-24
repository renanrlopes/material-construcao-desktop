import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ControleConfig } from '../models/config.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import firebase from 'firebase/compat/app';

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

    if (!cred.user) return;

    const uid = cred.user.uid;

    await this.firestore.firestore.runTransaction(async (transaction) => {

      const counterRef = this.firestore
        .collection<ControleConfig>('config')
        .doc('employeeCounter').ref;

      const counterSnap = await transaction.get(counterRef);

      if (!counterSnap.exists) {
        throw new Error('Documento employeeCounter não existe.');
      }

      const counterData = counterSnap.data() as ControleConfig;

      const novoCodigo = counterData.ultimoCodigo + 1;

      // Atualiza contador
      transaction.update(counterRef, {
        ultimoCodigo: novoCodigo
      });

      // Cria usuário
      transaction.set(
        this.firestore.collection('usuarios').doc(uid).ref,
        {
          name: name,
          email: email,
          role: 'LEITOR',
          employeeCode: novoCodigo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isActive: true
        }
      );

    });

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