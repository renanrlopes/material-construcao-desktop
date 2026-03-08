import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppUser } from '../../core/models/user.model';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

// ÍCONES REGISTRADOS (Garante que parem os erros de "not provided" no console)
import {
  Search, Plus, LogOut, Edit3, Trash2, Save, X,
} from 'lucide-angular';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrl: './estoque.component.scss',
})
export class EstoqueComponent implements OnInit {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly LogOut = LogOut;
  readonly Edit3 = Edit3;
  readonly Save = Save;
  readonly X = X;


  itensEstoque: any[] = [];
  itensFiltrados: any[] = [];
  usuario: AppUser | null = null;
  isDarkMode: boolean = false;

  // Modais e Edição
  exibirModal: boolean = false;
  exibirModalEdicao: boolean = false;
  itemSelecionado: any = null;
  itemEmEdicao: any = {};

  // Filtros
  filtroNome: string = '';
  filtroLote: string = '';
  filtroTipo: string = '';

  // Ordenação
  ordemCampo: string = 'updatedAt';
  ordemDirecao: 'desc' | 'asc' = 'desc';

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    // 1. Carrega dados do usuário logado e valida permissões
    this.authService.getUserRole().subscribe({
      next: (data) => {
        this.usuario = data as AppUser;
        // Opcional: Você pode disparar uma lógica aqui caso precise 
        // esconder elementos que não dependam apenas do *ngIf.
      },
      error: (err) => console.error('Erro ao carregar perfil:', err)
    });

    // 2. BUSCAR PRODUTOS (RESTAURADO)
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

  abrirModalEdicao(item: any, event: Event) {
    event.stopPropagation();

    // Verifica se o usuário tem permissão antes de abrir o modal
    const podeEditar = this.usuario?.role === 'ADMIN' || this.usuario?.role === 'ESTOQUISTA';

    if (!podeEditar) {
      console.warn('Acesso negado: Usuário sem permissão para editar estoque.');
      return;
    }

    let dataFormatada = '';
    if (item.expirationDate) {
      const d = item.expirationDate.toDate ? item.expirationDate.toDate() : new Date(item.expirationDate);
      dataFormatada = d.toISOString().split('T')[0];
    }

    this.itemEmEdicao = {
      ...item,
      expirationDateInput: dataFormatada
    };
    this.exibirModalEdicao = true;
  }

  fecharModalEdicao() {
    this.exibirModalEdicao = false;
    this.itemEmEdicao = {};
  }

  async salvarAlteracoesLote() {
    if (!this.itemEmEdicao.id) return;

    try {
      // Converte a string do input date de volta para objeto Date
      const dataParaSalvar = this.itemEmEdicao.expirationDateInput ? new Date(this.itemEmEdicao.expirationDateInput) : null;

      await this.firestore.collection('estoque').doc(this.itemEmEdicao.id).update({
        currentQuantity: Number(this.itemEmEdicao.currentQuantity),
        initialQuantity: Number(this.itemEmEdicao.initialQuantity),
        expirationDate: dataParaSalvar,
        updatedAt: new Date(),
        lastEditedBy: this.usuario?.name || 'Sistema' // Auditoria conforme sua modelagem
      });

      this.fecharModalEdicao();
    } catch (error) {
      console.error('Erro ao atualizar lote:', error);
      alert('Erro ao salvar. Verifique o console.');
    }
  }

  // --- FILTROS, ORDENAÇÃO E TEMA ---

  aplicarFiltrosEOrdenacao() {
    let res = [...this.itensEstoque];
    if (this.filtroNome) {
      res = res.filter(i => i.productName.toLowerCase().includes(this.filtroNome.toLowerCase()));
    }
    if (this.filtroLote) {
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

  onLogout() { this.authService.logout(); }
  abrirDetalhes(item: any) { this.itemSelecionado = item; this.exibirModal = true; }
  fecharModal() { this.exibirModal = false; this.itemSelecionado = null; }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }
}