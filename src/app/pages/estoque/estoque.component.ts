import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EstoqueComponent implements OnInit {
  itensEstoque: any[] = [];
  itensFiltrados: any[] = [];

  // Filtros
  filtroNome: string = '';
  filtroLote: string = '';
  filtroTipo: string = '';

  // Ordenação
  ordemCampo: string = 'updatedAt';
  ordemDirecao: 'desc' | 'asc' = 'desc';

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Unindo Estoque com Produtos para ter os nomes
    const estoque$ = this.firestore.collection('estoque').valueChanges({ idField: 'id' });
    const produtos$ = this.firestore.collection('produtos').valueChanges({ idField: 'id' });

    combineLatest([estoque$, produtos$]).pipe(
      map(([estoque, produtos]: [any[], any[]]) => {
        return estoque.map(item => {
          const produto = produtos.find(p => p.id === item.productId);
          return {
            ...item,
            productName: produto?.name || 'Produto Removido',
            productBrand: produto?.brand || '-',
            productType: produto?.type || '-'
          };
        });
      })
    ).subscribe(dados => {
      this.itensEstoque = dados;
      this.aplicarFiltrosEOrdenacao();
    });
  }

  aplicarFiltrosEOrdenacao() {
    let res = [...this.itensEstoque];

    if (this.filtroNome) {
      res = res.filter(i => i.productName.toLowerCase().includes(this.filtroNome.toLowerCase()));
    }
    if (this.filtroLote) {
      //filtramos por batchNumber
      res = res.filter(i => i.batchNumber.toLowerCase().includes(this.filtroLote.toLowerCase()));
    }

    res.sort((a, b) => {
      let valA = a[this.ordemCampo];
      let valB = b[this.ordemCampo];

      if (valA?.toDate) valA = valA.toDate().getTime();
      if (valB?.toDate) valB = valB.toDate().getTime();

      return this.ordemDirecao === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    this.itensFiltrados = res;
  }

  itemSelecionado: any = null;
  exibirModal: boolean = false;

  abrirDetalhes(item: any) {
    this.itemSelecionado = item;
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.itemSelecionado = null;
  }
}