import { Typography } from "@mui/material";
import { TracingLetter } from "./tracing-letter";

export const TimeForALetterInSeconds = 6;

type TracingSentenceProps = {
    sentence: string;
}

export function TracingSentenceWithOrigin({ sentence }: TracingSentenceProps) {
    return <>
        <Typography fontSize={50}>
            {sentence}
        </Typography>
        <TracingSentence sentence={sentence} />
    </>
};

export function TracingSentence({ sentence }: TracingSentenceProps) {
    return (
        <div>
            {sentence.split(" ").map((w, i) => (
                <div key={i} style={{ display: "inline-block" }}>
                    {w.split("").map((l, j) => <TracingLetter key={j}
                        letter={l}
                        previousLetter={j > 0 ? w.charAt(j - 1) : undefined}
                        hasColor={j % 2 === 0} />)}
                    <TracingLetter letter=" " hasColor={false} />
                </div>))
            }
        </div>
    )
};