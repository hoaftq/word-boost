import { Typography } from "@mui/material";
import { TracingLetter } from "./tracing-letter";
import { ForwardedRef, forwardRef } from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const TimeForALetterInSeconds = 6;

type WritingSentenceProps = {
    sentence: string;
    focused?: boolean;
}

export const WritingSentenceWithOrigin = forwardRef(function WritingSentenceWithOrigin(
    { sentence, focused }: WritingSentenceProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    return <div ref={ref}>
        {focused && <PlayArrowIcon htmlColor="white"
            sx={{
                backgroundColor: "red",
                width: 50,
                height: 40,
                marginRight: 2
            }} />}
        <Typography fontSize={50} component={"span"} color={focused ? "error" : "black"}>
            {sentence}
        </Typography>
        <WritingSentence sentence={sentence} />
    </div>
});

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