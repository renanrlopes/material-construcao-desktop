import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];

  // Filtros
  filtroNome: string = '';
  filtroTipo: string = '';

  // Ordenação
  ordemCampo: string = 'updatedAt';
  ordemDirecao: 'asc' | 'desc' = 'desc';

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    // Escuta a coleção 'produtos' em tempo real
    this.firestore.collection<Produto>('produtos').valueChanges({ idField: 'id' })
      .subscribe(res => {
        this.produtos = res;
        this.aplicarFiltrosEOrdenacao();
      });
  }

  aplicarFiltrosEOrdenacao() {
    let resultado = [...this.produtos];

    // Filtro por Nome
    if (this.filtroNome) {
      resultado = resultado.filter(p =>
        p.name.toLowerCase().includes(this.filtroNome.toLowerCase())
      );
    }

    // Filtro por Tipo
    if (this.filtroTipo) {
      resultado = resultado.filter(p =>
        p.type.toLowerCase().includes(this.filtroTipo.toLowerCase())
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      let valA = a[this.ordemCampo as keyof Produto];
      let valB = b[this.ordemCampo as keyof Produto];

      // Tratamento para datas (Timestamp do Firebase)
      if (valA?.toDate) valA = valA.toDate().getTime();
      if (valB?.toDate) valB = valB.toDate().getTime();

      if (valA < valB) return this.ordemDirecao === 'asc' ? -1 : 1;
      if (valA > valB) return this.ordemDirecao === 'asc' ? 1 : -1;
      return 0;
    });

    this.produtosFiltrados = resultado;
  }

  produtoSelecionado: Produto | null = null;
  exibirModal: boolean = false;

  // Função para abrir o detalhamento
  abrirDetalhes(produto: Produto) {
    this.produtoSelecionado = produto;
    this.exibirModal = true;
  }

  // Função para fechar
  fecharModal() {
    this.exibirModal = false;
    this.produtoSelecionado = null;
  }
}