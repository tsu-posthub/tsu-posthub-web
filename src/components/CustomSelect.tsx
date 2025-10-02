import { useState, useRef, useEffect, type ReactNode } from "react";
import "./CustomSelect.css";

type OptionType = {
    label: string;
    icon?: ReactNode;
};

type CustomSelectProps = {
    options: OptionType[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    className?: string;
};

export default function CustomSelect({ options, defaultValue, onChange, className }: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<OptionType>(
        options.find((opt) => opt.label === defaultValue) || options[0]
    );
    const selectRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setOpen(!open);

    const handleSelect = (opt: OptionType) => {
        setSelected(opt);
        setOpen(false);
        if (onChange) onChange(opt.label);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`custom-select ${open ? "open" : ""} ${className || ""}`} ref={selectRef}>
        <button className="select-trigger" onClick={toggleOpen}>
                {selected.icon && <span className="icon">{selected.icon}</span>}
                {selected.label}
            </button>
            <ul className="select-options">
                {options.map((opt) => (
                    <li key={opt.label} onClick={() => handleSelect(opt)}>
                        {opt.icon && <span className="icon">{opt.icon}</span>}
                        {opt.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
