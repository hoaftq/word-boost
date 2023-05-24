export function getRandomArray<T>(arr: T[], numberOfItems: number): T[] {
    const indexs = arr.map((_, i) => i);
    const randomIndexes: number[] = [];
    for (let i = 0; i < numberOfItems && indexs.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * indexs.length);
        randomIndexes.push(indexs[randomIndex]);

        indexs.splice(randomIndex, 1);
    }

    return randomIndexes.map(i => arr[i]);
}

export function shuffleArray<T>(arr: T[]): T[] {
    return getRandomArray(arr, arr.length);
}