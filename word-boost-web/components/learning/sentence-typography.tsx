import { Typography, TypographyProps } from "@mui/material";
import { Word } from "../word-list";
import styles from "../../styles/SentenceTypography.module.css";
import { CombinedSentence } from "../testing/fill-blank-test";

type SentenceTypographyProps = TypographyProps<'div', { component: 'div' }> & {
    word: Word;
    sentenceIndex: number;
}

export function SentenceTypography({ word, sentenceIndex, ...typographyProps }: SentenceTypographyProps) {
    const combinedSentence: CombinedSentence = {
        sentence: word.sentences[sentenceIndex],
        words: [word]
    };

    return <CombinedSentenceTypography combinedSentence={combinedSentence} {...typographyProps} />
}

type CombinedSentenceTypographyProps = TypographyProps<'div', { component: 'div' }> & {
    combinedSentence: CombinedSentence;
}

export function CombinedSentenceTypography({ combinedSentence, ...typographyProps }: CombinedSentenceTypographyProps) {

    const highlightWord = () => {
        const wordsWithPipe = combinedSentence.words.map(w => w.value).join("|");
        const wordRegex = new RegExp(`(\\w*(${wordsWithPipe})\\w*|\\w+)`, "gi");

        const sentence = combinedSentence.sentence.value;
        return sentence.replace(wordRegex, (match, group: string) => {
            const exactWordRegex = new RegExp(`(${wordsWithPipe})`, "gi");
            const styledExactWord = group.replace(exactWordRegex, (m, g) => `<span class="${styles['exact-word']}">${g}</span>`)
            return `<span class="${styles.word}">${styledExactWord}</span>`
        });
    }

    return (
        <Typography {...typographyProps} dangerouslySetInnerHTML={{ __html: highlightWord() }} />
    );
}