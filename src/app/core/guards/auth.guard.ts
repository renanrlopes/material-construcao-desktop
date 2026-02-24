import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap, map, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppUser, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {

    const allowedRoles = (route.data['roles'] as UserRole[]) || [];

    return this.afAuth.authState.pipe(
      switchMap(user => {

        if (!user) {
          this.router.navigate(['/']);
          return of(false);
        }

        return this.firestore.collection<AppUser>('usuarios')
          .doc(user.uid)
          .valueChanges()
          .pipe(
            take(1),
            map((userData) => {

              if (!userData) {
                this.router.navigate(['/']);
                return false;
              }

              if (allowedRoles.length === 0) {
                return true; // rota sem restrição
              }

              if (allowedRoles.includes(userData.role)) {
                return true;
              }

              this.router.navigate(['/dashboard']);
              return false;

            })
          );

      })
    );
  }
}