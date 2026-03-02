export interface RegistroBaixa {
    id?: string;
    inventoryItemId: string;
    inventoryItemName?: string; // Nome do produto no momento da baixa
    batchNumber?: string;       // Lote de onde saiu
    quantity: number;           // Quanto foi retirado
    userId: string;             // ID do funcionário
    userName?: string;          // Nome do funcionário
    date: any;                  // Data da operação (Timestamp)
    reason: string;             // Motivo (Ex: Venda, Quebra, Uso interno)
}