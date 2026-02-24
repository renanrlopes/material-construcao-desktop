import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

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
    const allowedRoles = route.data['roles'] as Array<string> || [];

    return this.afAuth.authState.pipe(
      switchMap(user => {

        if (!user) {
          this.router.navigate(['/']);
          return of(false);
        }

        return this.firestore.collection('usuarios')
          .doc(user.uid)
          .valueChanges()
          .pipe(
            map((data: any) => {

              if (!data) {
                this.router.navigate(['/']);
                return false;
              }

              if (allowedRoles.includes(data.role)) {
                return true;
              } else {
                this.router.navigate(['/dashboard']);
                return false;
              }

            })
          );

      })
    );
  }
}