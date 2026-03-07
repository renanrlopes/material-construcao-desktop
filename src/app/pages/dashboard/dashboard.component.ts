import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { EstoqueService } from '../../core/services/estoque.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRole: UserRole | null = null;
  loading: boolean = true;
  isDarkMode: boolean = false;

  productCount: number = 0; // Total de produtos cadastrados
  itensEstoque: number = 0; // Total de lotes/itens no estoque
  monthLowRegistrations: number = 0; // Total de baixas realizadas no mês
  criticalItems: number = 0; // Total de itens com quantidade crítica (menos de 5 unidades)
  produtosCriticos: any[] = []; // Guarda a lista de produtos críticos para mostrar os nomes no HTML

  exibirModal: boolean = false; // Controla a exibição do modal de itens críticos

  constructor(
    private authService: AuthService,
    private estoqueService: EstoqueService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    // 1. Configuração do Tema
    const temaSalvo = localStorage.getItem('theme');
    this.isDarkMode = temaSalvo === 'dark';
    this.applyTheme();

    // 2. Carregar Dados do Usuário e Iniciar Monitoramento do Estoque
    this.authService.getUserRole().subscribe({
      next: (userData: any) => {
        if (userData) {
          this.userName = userData.name;
          this.userRole = userData.role;

          // Só iniciamos a escuta do banco quando o usuário está validado
          this.carregarDadosReais();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário', err);
        this.loading = false;
      }
    });
  }

  private carregarDadosReais() {
    this.estoqueService.getContagemProdutos().subscribe(total => {
      this.productCount = total;
    });

    this.estoqueService.getContagemEstoque().subscribe(total => {
      this.itensEstoque = total;
    });

    this.estoqueService.getContagemBaixasMes().subscribe(total => {
      this.monthLowRegistrations = total;
    });

    this.estoqueService.getItensCriticos().subscribe(lista => {
      this.produtosCriticos = lista;      // Guarda a lista para mostrar os nomes no HTML
      this.criticalItems = lista.length; // Continua atualizando o número no card
    });
  }

  abrirModalAlertas() {
    if (this.criticalItems > 0) {
      this.exibirModal = true;
    }
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