import { RadialProgress } from "react-daisyui";

const Spinner = () => {
    return (
        <div className="animate-spin m-14 text-primary">
            <RadialProgress value={70} size="2rem" thickness="0.5rem">
            </RadialProgress>
        </div>
    )
}

export default Spinner;