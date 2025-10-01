import { RotateLoader } from "react-spinners";
import "./Loader.css";

type LoaderProps = {
    size?: number;
    color?: string;
};

export default function Loader({ size = 8, color = "#646cff" }: LoaderProps) {
    return (
        <div className="loader-container">
            <RotateLoader color={color} size={size} />
        </div>
    );
}
