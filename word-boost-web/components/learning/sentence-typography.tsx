import { Typography, TypographyProps } from "@mui/material";
import { Word } from "../word-list";
import styles from "../../styles/SentenceTypography.module.css";
import { CombinedSentence } from "../testing/fill-blank-test";

type SentenceTypographyProps = TypographyProps<'div', { component: 'div' }> & {
    word: Word;
    sentenceIndex: number;
}

export function SentenceTypography({ word, sentenceIndex, ...typographyProps }: SentenceTypographyProps) {

    const highlightWord = () => {
        const wordRegex = new RegExp(`(\\w*${word.value}\\w*|\\w+)`, "gi");
        const sentence = word.sentences[sentenceIndex].value;
        return sentence.replace(wordRegex, (match, group: string) => {
            const exactWordRegex = new RegExp(`(${word.value})`, "gi");
            const styledExactWord = group.replace(exactWordRegex, (m, g) => `<span class="${styles['exact-word']}">${g}</span>`)
            return `<span class="${styles.word}">${styledExactWord}</span>`
        });
    }

    return (
        <Typography {...typographyProps} dangerouslySetInnerHTML={{ __html: highlightWord() }} />
    );
}

type SentenceTypography2Props = TypographyProps<'div', { component: 'div' }> & {
    combinedSentence: CombinedSentence;
}

export function SentenceTypography2({ combinedSentence, ...typographyProps }: SentenceTypography2Props) {

    const highlightWord = () => {
        const x = combinedSentence.words.map(w => w.value).join("|");

        const wordRegex = new RegExp(`(\\w*(${x})\\w*|\\w+)`, "gi");
        const sentence = combinedSentence.sentence.value;
        return sentence.replace(wordRegex, (match, group: string) => {
            const exactWordRegex = new RegExp(`(${x})`, "gi");
            const styledExactWord = group.replace(exactWordRegex, (m, g) => `<span class="${styles['exact-word']}">${g}</span>`)
            return `<span class="${styles.word}">${styledExactWord}</span>`
        });
    }

    return (
        <Typography {...typographyProps} dangerouslySetInnerHTML={{ __html: highlightWord() }} />
    );
}