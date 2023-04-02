export interface Settings {
    interfaceLang: string,
    columnOrder: Order[],
    fillFormOrder: Order[]
}

export type Order = 'origin' | 'translation'
