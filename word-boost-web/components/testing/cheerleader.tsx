import { useEffect, useState } from "react";

export type CheerleaderStatus = "not_started" | "doing" | "correct" | "wrong" | "success";

const sand1 = "⏳";
const sand2 = "⌛";

export function Cheerleader({ status }: { status: CheerleaderStatus }) {
    const [sandValue, setSandValue] = useState(sand1);

    useEffect(() => {
        if (status !== "doing") {
            return;
        }

        const timerId = setInterval(() => {
            setSandValue((sv) => sv === sand1 ? sand2 : sand1)
        }, 1000)

        return () => {
            clearInterval(timerId);
        };
    }, [status]);


    let emoji = "";
    switch (status) {
        case "doing":
            emoji = sandValue;
            break;
        case "correct":
            emoji = "😃";
            break;
        case "wrong":
            emoji = "😢";
            break;
        case "success":
            emoji = "🎉";
            break;
    }
    return (
        <span style={{ fontSize: 50 }}>{emoji}</span>
    )
}