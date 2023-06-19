import lettersImage from "../../resources/letters.png";
import colorLettersImage from "../../resources/color-letters.png";
import Image from "next/image";

type LetterPosition = {
    [key: string]: { left: number, width: number };
}

const letterPosition: LetterPosition = {
    "A": { left: -40, width: 96 },
    "a": { left: -165, width: 60 },
    "B": { left: -275, width: 84 },
    "b": { left: -398, width: 60 },
    "C": { left: -530, width: 84 },
    "c": { left: -665, width: 50 },
    "D": { left: -765, width: 88 },
    "d": { left: -900, width: 60 },
    "E": { left: -1005, width: 80 },
    "e": { left: -1125, width: 68 },
    "F": { left: -1250, width: 80 },
    "f": { left: -1370, width: 66 },
    "G": { left: -1510, width: 96 },
    "g": { left: -1630, width: 64 },
    "H": { left: -1745, width: 93 },
    "h": { left: -1860, width: 66 },
    "I": { left: -2005, width: 50 },
    "i": { left: -2105, width: 33 },
    "J": { left: -2258, width: 73 },
    "j": { left: -2360, width: 50 },
    "K": { left: -2495, width: 80 },
    "k": { left: -2634, width: 54 },
    "L": { left: -2745, width: 70 },
    "l": { left: -2873, width: 30 },
    "M": { left: -2968, width: 114 },
    "m": { left: -3099, width: 80 },
    "N": { left: -3215, width: 84 },
    "n": { left: -3320, width: 70 },
    "O": { left: -3465, width: 98 },
    "o": { left: -3600, width: 50 },
    "P": { left: -3715, width: 78 },
    "p": { left: -3818, width: 66 },
    "Q": { left: -3955, width: 100 },
    "q": { left: -4085, width: 92 },
    "R": { left: -4190, width: 78 },
    "r": { left: -4290, width: 55 },
    "S": { left: -4445, width: 70 },
    "s": { left: -4545, width: 43 },
    "T": { left: -4675, width: 104 },
    "t": { left: -4798, width: 52 },
    "U": { left: -4935, width: 70 },
    "u": { left: -5042, width: 64 },
    "V": { left: -5176, width: 100 },
    "v": { left: -5315, width: 55 },
    "W": { left: -5410, width: 182 },
    "w": { left: -5586, width: 98 },
    "X": { left: -5715, width: 92 },
    "x": { left: -5816, width: 75 },
    "Y": { left: -5967, width: 78 },
    "y": { left: -6070, width: 70 },
    "Z": { left: -6215, width: 81 },
    "z": { left: -6318, width: 60 },
};

type TracingLetterProps = {
    letter: string;
    previousLetter?: string;
    hasColor: boolean;
}

export function TracingLetter({ letter, previousLetter, hasColor }: TracingLetterProps) {
    const position = letterPosition[letter];

    if (position) {
        return (
            <div style={{
                display: "inline-block",
                position: "relative",
                width: position.width,
                height: 180,
                overflow: "hidden"
            }}>
                <Image
                    src={hasColor ? colorLettersImage : lettersImage}
                    height={180}
                    alt={letter}
                    style={{
                        position: "absolute",
                        left: position.left
                    }}
                />
            </div>);
    }

    if (letter === " " || letter === "\t") {
        return (
            <div style={{
                display: "inline-block",
                marginLeft: 17,
                marginRight: 17
            }}></div>);
    }

    let remainingLetterMarginTop;
    switch (letter) {
        case "'":
            if (previousLetter && previousLetter === previousLetter.toUpperCase()) {
                remainingLetterMarginTop = 0
            } else {
                remainingLetterMarginTop = 40;
            }
            break;
        case "-":
            remainingLetterMarginTop = 52;
            break;
        default:
            remainingLetterMarginTop = 63;
    }

    return <div style={{
        display: "inline-block",
        height: 180,
        overflow: "hidden",
        fontSize: 60,
        marginLeft: 5,
        marginRight: 5
    }}>
        <div style={{ marginTop: remainingLetterMarginTop }}>
            {letter}
        </div>
    </div>;
}