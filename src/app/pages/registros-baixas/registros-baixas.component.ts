import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RegistroBaixa } from '../../core/models/registro-baixa.model';

@Component({
  selector: 'app-registros-baixas',
  templateUrl: './registros-baixas.component.html',
  styleUrl: './registros-baixas.component.scss'
})
export class RegistrosBaixasComponent implements OnInit {
  baixas: RegistroBaixa[] = [];
  baixasFiltradas: RegistroBaixa[] = [];

  // Filtros conforme o diagrama
  filtroUsuario: string = '';
  filtroData: string = '';

  // Ordenação
  ordemDirecao: 'asc' | 'desc' = 'desc';

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
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
        const dataBaixa = b.date?.toDate().toISOString().split('T')[0];
        return dataBaixa === this.filtroData;
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
}