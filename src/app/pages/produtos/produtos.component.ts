import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Produto } from '../../core/models/produto.model';
import { AuthService } from '../../core/services/auth.service';
import { DOCUMENT } from '@angular/common';
import { AppUser, UserRole } from '../../core/models/user.model';
import { Search } from 'lucide-angular';
@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})

export class ProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  userName: string = '';
  userRole: UserRole | null = null;
  usuario: AppUser | null = null; // Objeto que o HTML usa para o *ngIf
  loading: boolean = true;
  isDarkMode: boolean = false;
  readonly Search = Search;

  filtroNome: string = '';
  filtroTipo: string = '';
  ordemCampo: string = 'updatedAt';
  ordemDirecao: 'asc' | 'desc' = 'desc';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    this.authService.getUserRole().subscribe({
      next: (userData: any) => {
        if (userData) {
          this.usuario = userData;
          this.userName = userData.name;
          this.userRole = userData.role;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
        this.loading = false;
      }
    });

    // Carrega os produtos
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

  onLogout() {
    this.authService.logout();
  }

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