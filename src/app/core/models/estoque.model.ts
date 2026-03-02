export interface Estoque {
    id?: string;
    batchNumber: string;      // Substitui 'lote'
    createdAt: any;           // Data de criação do registro
    currentQuantity: number;  // Quantidade atual em estoque
    initialQuantity: number;  // Quantidade original de entrada
    expirationDate?: any;     // Data de validade
    productId: string;        // ID de referência do produto
    productName: string;      // Nome do produto
    lastEditedBy: string;     // UID de quem editou
    lastEditedByName: string; // Nome de quem editou
    updatedAt: any;           // Última atualização

    productBrand?: string;
    productType?: string;
}