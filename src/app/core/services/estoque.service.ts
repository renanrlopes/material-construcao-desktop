import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface EstoqueComAlerta {
  id: string;
  productName: string;
  batchNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  expirationDate?: Date;
  isEmpty: boolean;
  isLow: boolean;
  isExpired: boolean;
  expiresSoon: boolean;
  alertStatus: 'vazio' | 'baixo' | 'expirado' | 'vence-breve' | 'ok';
}

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

  // Conta baixas realizadas 
  getContagemBaixasMes(): Observable<number> {
    return this.firestore.collection('registro_baixas').valueChanges().pipe(
      map(actions => actions.length)
    );
  }

  // Verifica se um item está vazio
  private verificarSeVazio(currentQuantity: number): boolean {
    return currentQuantity <= 0;
  }

  // Verifica se um item tem baixo estoque (20% ou menos da quantidade inicial)
  private verificarSeBaixo(currentQuantity: number, initialQuantity: number): boolean {
    const isEmpty = this.verificarSeVazio(currentQuantity);
    if (isEmpty) return false;
    const limiteMinimo = Math.ceil(initialQuantity * 0.2);
    return currentQuantity <= limiteMinimo;
  }

  // Verifica se um item já expirou
  private verificarSeExpirado(expirationDate: any): boolean {
    if (!expirationDate) return false;
    const dataExpiracao = this.converterParaDate(expirationDate);
    return dataExpiracao < new Date();
  }

  // Verifica se um item vai expirar em breve (até 30 dias)
  private verificarSeVaiExpirarEmBreve(expirationDate: any): boolean {
    if (!expirationDate) return false;
    const dataExpiracao = this.converterParaDate(expirationDate);
    const hoje = new Date();
    const diferenca = this.calcularDiasAte(dataExpiracao, hoje);
    return diferenca >= 0 && diferenca <= 30;
  }

  // Converte Timestamp do Firestore para Date
  private converterParaDate(data: any): Date {
    if (data instanceof Date) return data;
    if (data?.toDate) return data.toDate(); // Firestore Timestamp
    return new Date(data);
  }

  // Calcula diferença em dias entre duas datas
  private calcularDiasAte(dataFutura: Date, dataAtual: Date = new Date()): number {
    const diferenca = dataFutura.getTime() - dataAtual.getTime();
    return Math.floor(diferenca / (1000 * 60 * 60 * 24));
  }

  // Determina o status do alerta baseado nas condições
  private determinarStatusAlerta(item: any): 'vazio' | 'baixo' | 'expirado' | 'vence-breve' | 'ok' {
    if (this.verificarSeVazio(item.currentQuantity)) return 'vazio';
    if (this.verificarSeExpirado(item.expirationDate)) return 'expirado';
    if (this.verificarSeVaiExpirarEmBreve(item.expirationDate)) return 'vence-breve';
    if (this.verificarSeBaixo(item.currentQuantity, item.initialQuantity)) return 'baixo';
    return 'ok';
  }

  // Busca todos os itens do estoque com status de alertas
  getItensCriticos(): Observable<EstoqueComAlerta[]> {
    return this.firestore.collection('estoque').valueChanges({ idField: 'id' }).pipe(
      map((items: any[]) => {
        return items
          .map(item => ({
            id: item.id,
            productName: item.productName || 'Produto sem nome',
            batchNumber: item.batchNumber || '',
            initialQuantity: item.initialQuantity || 0,
            currentQuantity: item.currentQuantity || 0,
            expirationDate: item.expirationDate ? this.converterParaDate(item.expirationDate) : undefined,
            isEmpty: this.verificarSeVazio(item.currentQuantity),
            isLow: this.verificarSeBaixo(item.currentQuantity, item.initialQuantity),
            isExpired: this.verificarSeExpirado(item.expirationDate),
            expiresSoon: this.verificarSeVaiExpirarEmBreve(item.expirationDate),
            alertStatus: this.determinarStatusAlerta(item)
          } as EstoqueComAlerta))
          // Filtra apenas itens com alertas
          .filter(item => item.alertStatus !== 'ok');
      })
    );
  }

  // Conta total de itens com alertas
  getAlertCount(): Observable<number> {
    return this.getItensCriticos().pipe(
      map(items => items.length)
    );
  }

  // Agrupa itens por tipo de alerta para exibição melhorada
  getItensCriticosAgrupados(): Observable<{
    vazio: EstoqueComAlerta[],
    expirado: EstoqueComAlerta[],
    venceBreve: EstoqueComAlerta[],
    baixo: EstoqueComAlerta[]
  }> {
    return this.getItensCriticos().pipe(
      map(items => ({
        vazio: items.filter(i => i.alertStatus === 'vazio'),
        expirado: items.filter(i => i.alertStatus === 'expirado'),
        venceBreve: items.filter(i => i.alertStatus === 'vence-breve'),
        baixo: items.filter(i => i.alertStatus === 'baixo')
      }))
    );
  }
}