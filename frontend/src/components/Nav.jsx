import { Link } from "react-router-dom";

export function Nav(){
    return <nav>
        <a target="__blank" href="https://www.spaceappschallenge.org/2023/find-a-team/fubica_lovers/">
            <img src="icon.png" />
        </a>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
    </nav>
}