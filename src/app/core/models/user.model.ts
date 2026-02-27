import firebase from 'firebase/compat/app';

export type UserRole = 'ADMIN' | 'ESTOQUISTA' | 'LEITOR';

export interface AppUser {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    employeeCode: string;
    createdAt: firebase.firestore.Timestamp;
    isActive: boolean;
}