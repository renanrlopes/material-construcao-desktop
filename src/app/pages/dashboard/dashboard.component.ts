import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { EstoqueService, EstoqueComAlerta } from '../../core/services/estoque.service';

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

  productCount: number = 0;
  itensEstoque: number = 0;
  monthLowRegistrations: number = 0;
  criticalItems: number = 0;

  // Alertas detalhados
  produtosCriticos: EstoqueComAlerta[] = [];
  alertasAgrupados: {
    vazio: EstoqueComAlerta[],
    expirado: EstoqueComAlerta[],
    venceBreve: EstoqueComAlerta[],
    baixo: EstoqueComAlerta[]
  } = { vazio: [], expirado: [], venceBreve: [], baixo: [] };

  exibirModal: boolean = false;
  exibirModalAgrupado: boolean = false;

  constructor(
    private authService: AuthService,
    private estoqueService: EstoqueService,
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
          this.userName = userData.name;
          this.userRole = userData.role;
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

    // Carregar alertas com lógica completa
    this.estoqueService.getItensCriticos().subscribe(lista => {
      this.produtosCriticos = lista;
      this.criticalItems = lista.length;
    });

    // Carregar alertas agrupados
    this.estoqueService.getItensCriticosAgrupados().subscribe(agrupados => {
      this.alertasAgrupados = agrupados;
    });
  }

  // Retorna cor do card de alertas baseado na quantidade
  getAlertCardColor(): string {
    return this.criticalItems > 0 ? 'alert-danger' : 'alert-success';
  }

  // Retorna ícone/emoji baseado no tipo de alerta
  getAlertIcon(status: string): string {
    switch (status) {
      case 'vazio':
        return '📦';
      case 'expirado':
        return '❌';
      case 'vence-breve':
        return '⏰';
      case 'baixo':
        return '⚠️';
      default:
        return '✅';
    }
  }

  // Retorna descrição do alerta
  getAlertDescription(status: string): string {
    switch (status) {
      case 'vazio':
        return 'Estoque vazio';
      case 'expirado':
        return 'Produto expirado';
      case 'vence-breve':
        return 'Vence em breve (até 30 dias)';
      case 'baixo':
        return 'Estoque baixo (20% ou menos)';
      default:
        return 'Sem alertas';
    }
  }

  abrirModalAlertas() {
    if (this.criticalItems > 0) {
      this.exibirModalAgrupado = true;
    }
  }

  fecharModal() {
    this.exibirModalAgrupado = false;
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