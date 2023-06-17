import lettersImage from "../resources/letters.png";
import Image from "next/image";

type LetterPosition = {
    [key: string]: { left: number, width: number };
}

const letterPosition: LetterPosition = {
    "A": { left: -26, width: 64 },
    "a": { left: -109, width: 40 },
    "B": { left: -184, width: 56 },
    "b": { left: -265, width: 40 },
    "C": { left: -352, width: 56 },
    "c": { left: -438, width: 36 },
    "D": { left: -505, width: 65 },
    "d": { left: -596, width: 40 },
    "E": { left: -666, width: 56 },
    "e": { left: -748, width: 43 },
    "F": { left: -829, width: 56 },
    "f": { left: -906, width: 44 },
    "G": { left: -1000, width: 65 },
    "g": { left: -1079, width: 44 },
    "H": { left: -1154, width: 65 },
    "h": { left: -1232, width: 44 },
    "I": { left: -1325, width: 40 },
    "i": { left: -1395, width: 25 },
    "J": { left: -1495, width: 50 },
    "j": { left: -1562, width: 40 },
    "K": { left: -1651, width: 56 },
    "k": { left: -1742, width: 40 },
    "L": { left: -1817, width: 50 },
    "l": { left: -1900, width: 30 },
    "M": { left: -1966, width: 76 },
    "m": { left: -2052, width: 56 },
    "N": { left: -2130, width: 56 },
    "n": { left: -2200, width: 44 },
    "O": { left: -2297, width: 63 },
    "o": { left: -2385, width: 35 },
    "P": { left: -2460, width: 55 },
    "p": { left: -2528, width: 44 },
    "Q": { left: -2620, width: 67 },
    "q": { left: -2705, width: 64 },
    "R": { left: -2772, width: 56 },
    "r": { left: -2842, width: 40 },
    "S": { left: -2944, width: 50 },
    "s": { left: -3008, width: 33 },
    "T": { left: -3100, width: 67 },
    "t": { left: -3178, width: 38 },
    "U": { left: -3268, width: 50 },
    "u": { left: -3340, width: 44 },
    "V": { left: -3428, width: 68 },
    "v": { left: -3520, width: 40 },
    "W": { left: -3605, width: 116 },
    "w": { left: -3719, width: 70 },
    "X": { left: -3805, width: 60 },
    "x": { left: -3870, width: 50 },
    "Y": { left: -3970, width: 56 },
    "y": { left: -4040, width: 47 },
    "Z": { left: -4138, width: 54 },
    "z": { left: -4205, width: 40 },
};

export function Letter({ letter }: { letter: string }) {
    const position = letterPosition[letter];

    return (
        <div style={{
            display: "inline-block",
            position: "relative",
            width: position.width,
            height: 120,
            overflow: "hidden"
        }}>
            <Image
                src={lettersImage}
                height={120}
                alt={letter}
                style={{
                    position: "absolute",
                    left: position.left
                }}
            />
        </div>
    );
}