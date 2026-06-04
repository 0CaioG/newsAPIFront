import { useState } from "react"
import LoginPage from "./Pages/LoginPage"
import RegisterPage from "./Pages/RegisterPages"
import NewsPage from "./Pages/NewPage"

export default function App() {
    const [usuario, setUsuario] = useState(null)
    const [tela, setTela] = useState("login")

    if (usuario) {
        return <NewsPage usuario={usuario} onLogout={() => { setUsuario(null); setTela("login") }} />
    }

    if (tela === "cadastro") {
        return <RegisterPage onCadastro={(u) => { setUsuario(u) }} onVoltar={() => setTela("login")} />
    }

    return <LoginPage onLogin={setUsuario} onCadastro={() => setTela("cadastro")} />
}