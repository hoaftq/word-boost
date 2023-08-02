import { Typography } from "@mui/material";
import { TracingLetter } from "./tracing-letter";

export const TimeForALetterInSeconds = 6;

type WritingSentenceProps = {
    sentence: string;
}

export function WritingSentenceWithOrigin({ sentence }: WritingSentenceProps) {
    return <>
        <Typography fontSize={50}>
            {sentence}
        </Typography>
        <WritingSentence sentence={sentence} />
    </>
};

export function WritingSentence({ sentence }: WritingSentenceProps) {
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