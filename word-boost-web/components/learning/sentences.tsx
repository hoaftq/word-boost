import { Paper } from "@mui/material";
import { Word } from "../word-list";
import { SentenceTypography2 } from "./sentence-typography";
import { CombinedSentence } from "../testing/fill-blank-test";

export function Sentences({ words }: { words: Word[] }) {
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

    const combinedSentences = Array.from(combineSentenceMap.values());

    return (
        <Paper elevation={3}
            sx={{
                padding: 1
            }}>
            {combinedSentences.map((s, i) => <SentenceTypography2 key={s.sentence.value}
                combinedSentence={s}
                variant="h4"
                component="div"
                color="primary"
                fontSize={50}
                fontWeight="bold"
                sx={{
                    marginX: 1,
                    marginY: 3
                }} />)}
        </Paper>
    );
}