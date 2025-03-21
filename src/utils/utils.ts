// src/utils/Utils.ts

export function getSum(data: { [key: string]: number }[], key: string): number {
    return data.reduce((sum, item) => sum + (item[key] || 0), 0);
}

export function getAGG(
    data: { [key: string]: number }[],
    key: string,
    KeySum: string
): number {
    const sumS = getSum(data, KeySum);
    const sum = getSum(data, key);
    return sumS !== 0 ? sum / sumS : 0; // Verhindert Division durch 0
}
