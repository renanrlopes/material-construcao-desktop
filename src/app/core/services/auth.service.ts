import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ControleConfig } from '../models/config.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AppUser, UserRole } from '../models/user.model';

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

  // RECUPERAR SENHA
  resetPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  // Adicione este método no auth.service.ts
  async verificarEmailExiste(email: string): Promise<boolean> {
    const snapshot = await this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).get().toPromise();
    return !snapshot?.empty;
  }

  //  CADASTRO
  async cadastrar(name: string, email: string, password: string) {
    const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);
    if (!cred.user) return;
    const uid = cred.user.uid;

    await this.firestore.firestore.runTransaction(async (transaction) => {
      const counterRef = this.firestore.collection('config').doc('employeeCounter').ref;
      const counterSnap = await transaction.get(counterRef);

      if (!counterSnap.exists) throw new Error('Documento employeeCounter não existe.');

      const ultimo = (counterSnap.data() as any).ultimoCodigo || 0;
      const proximo = ultimo + 1;

      transaction.update(counterRef, { ultimoCodigo: proximo });

      transaction.set(this.firestore.collection('usuarios').doc(uid).ref, {
        name,
        email,
        role: 'LEITOR',
        employeeCode: this.formatarCodigo(proximo), // Salvando como String formatada
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
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

  // LISTAR TODOS OS USUÁRIOS
  getAllUsers() {
    return this.firestore
      .collection<AppUser>('usuarios', ref => ref.orderBy('name'))
      .valueChanges({ idField: 'uid' }); // O 'uid' aqui deve ser igual ao nome na interface
  }

  // ATUALIZAR ROLE (NÍVEL DE ACESSO)
  updateUserRole(uid: string, newRole: UserRole) {
    return this.firestore.collection('usuarios').doc(uid).update({ role: newRole });
  }

  // EXCLUIR USUÁRIO
  // exclui o documento no Firestore. 
  updateUserStatus(uid: string, status: boolean) {
    return this.firestore.collection('usuarios').doc(uid).update({
      isActive: status
    });
  }

  async cadastrarComRole(name: string, email: string, password: string, role: UserRole) {
    const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);
    if (!cred.user) return;
    const uid = cred.user.uid;

    await this.firestore.firestore.runTransaction(async (transaction) => {
      const counterRef = this.firestore.collection('config').doc('employeeCounter').ref;
      const counterSnap = await transaction.get(counterRef);

      if (!counterSnap.exists) throw new Error('Contador não existe.');

      const ultimo = (counterSnap.data() as any).ultimoCodigo || 0;
      const proximo = ultimo + 1;

      transaction.update(counterRef, { ultimoCodigo: proximo });

      transaction.set(this.firestore.collection('usuarios').doc(uid).ref, {
        name,
        email,
        role,
        employeeCode: this.formatarCodigo(proximo), // Sincronizado com Flutter
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
    });
  }

  private formatarCodigo(proximo: number): string {
    return `AO${proximo.toString().padStart(4, '0')}`;
  }
}