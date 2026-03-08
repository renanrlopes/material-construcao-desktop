import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RegistroBaixa } from '../../core/models/registro-baixa.model';
import { AppUser } from '../../core/models/user.model';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registros-baixas',
  templateUrl: './registros-baixas.component.html',
  styleUrl: './registros-baixas.component.scss'
})
export class RegistrosBaixasComponent implements OnInit {
  usuario: AppUser | null = null;
  isDarkMode: boolean = false;


  baixas: RegistroBaixa[] = [];
  baixasFiltradas: RegistroBaixa[] = [];

  // Filtros conforme o diagrama
  filtroUsuario: string = '';
  filtroData: string = '';

  // Ordenação
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
    // Escuta a coleção 'registro_baixas' (mesmo nome usado no mobile)
    this.firestore.collection<RegistroBaixa>('registro_baixas', ref =>
      ref.orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' }).subscribe(res => {
      this.baixas = res;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    let res = [...this.baixas];

    if (this.filtroUsuario) {
      res = res.filter(b => b.userName?.toLowerCase().includes(this.filtroUsuario.toLowerCase()));
    }

    if (this.filtroData) {
      res = res.filter(b => {
        const dataBaixa = b.date?.toDate();
        if (!dataBaixa) return false;

        // Usa fuso local em vez de UTC
        const ano = dataBaixa.getFullYear();
        const mes = String(dataBaixa.getMonth() + 1).padStart(2, '0');
        const dia = String(dataBaixa.getDate()).padStart(2, '0');
        const dataFormatada = `${ano}-${mes}-${dia}`;

        return dataFormatada === this.filtroData;
      });
    }

    // Ordenação por data
    res.sort((a, b) => {
      const dateA = a.date?.toDate().getTime();
      const dateB = b.date?.toDate().getTime();
      return this.ordemDirecao === 'desc' ? dateB - dateA : dateA - dateB;
    });

    this.baixasFiltradas = res;
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