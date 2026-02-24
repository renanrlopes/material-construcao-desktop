import firebase from 'firebase/compat/app';

export type UserRole = 'ADMIN' | 'ESTOQUISTA' | 'LEITOR';

export interface AppUser {
    name: string;
    email: string;
    role: UserRole;
    employeeCode: number;
    createdAt: firebase.firestore.Timestamp;
    isActive: boolean;
}