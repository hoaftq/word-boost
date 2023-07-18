import { CombinedSentence } from "@wb/components/testing/fill-blank-test";
import { Word } from "@wb/components/main";

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

export function combineSentences(words: Word[]) {
    const sentences = words.flatMap(w => w.sentences.map(s => ({
        sentence: s,
        word: w
    })));

    const combineSentenceMap = new Map<string, CombinedSentence>();
    for (const s of sentences) {
        if (combineSentenceMap.has(s.sentence.value)) {
            combineSentenceMap.get(s.sentence.value)?.words.push(s.word);
        } else {
            combineSentenceMap.set(s.sentence.value, {
                sentence: s.sentence,
                words: [s.word]
            })
        }
    }

    return Array.from(combineSentenceMap.values());
}