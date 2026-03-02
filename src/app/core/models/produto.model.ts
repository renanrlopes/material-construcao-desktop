export interface Produto {
    id?: string;
    brand: string;         // Marca (ex: Decor Colors)
    name: string;          // Nome do produto
    description: string;   // Descrição técnica
    type: string;          // Tipo/Categoria
    createdAt: any;        // Data de cadastro
    updatedAt: any;        // Última edição
    lastEditedBy: string;  // ID de quem editou
    lastEditedByName: string; // Nome de quem editou

    lote?: string;
}