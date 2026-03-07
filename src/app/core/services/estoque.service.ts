import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {

  constructor(private firestore: AngularFirestore) { }

  // Conta total de produtos cadastrados
  getContagemProdutos(): Observable<number> {
    return this.firestore.collection('produtos').valueChanges().pipe(
      map(actions => actions.length)
    );
  }

  // Conta total de lotes/itens no estoque
  getContagemEstoque(): Observable<number> {
    return this.firestore.collection('estoque').valueChanges().pipe(
      map(actions => actions.length)
    );
  }

  // Conta baixas realizadas (exemplo: filtrando as do mês atual)
  getContagemBaixasMes(): Observable<number> {
    // Aqui você pode adicionar um filtro de data se desejar
    return this.firestore.collection('registro_baixas').valueChanges().pipe(
      map(actions => actions.length)
    );
  }

  // Busca itens com quantidade crítica 
  getItensCriticos(): Observable<any[]> {
    return this.firestore.collection('estoque', ref =>
      ref.where('currentQuantity', '<', 5)
    ).valueChanges({ idField: 'id' }); 
  }
}