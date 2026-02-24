import { Timestamp } from '@angular/fire/firestore';

export type UserRole = 'ADMIN' | 'ESTOQUISTA' | 'LEITOR';

export interface AppUser {
    name: string;
    email: string;
    role: UserRole;
    criadoEm: Timestamp;
    ativo: boolean;
}