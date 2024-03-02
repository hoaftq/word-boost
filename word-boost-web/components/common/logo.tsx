import Image from "next/image";
import logo from "../../resources/logo.svg";
import { CSSProperties } from "react";

export function Logo({ full, style }: { full: boolean, style?: CSSProperties }) {
    return (
        <div style={{ ...style, width: full ? 138 : 34, height: 44, overflow: "hidden" }}>
            <Image src={logo} alt={""} width={120} style={{ objectFit: "fill", marginTop: -15, marginLeft: -2 }} />
        </div>
    );
}