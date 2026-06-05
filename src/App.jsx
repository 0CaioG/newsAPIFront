import { useState } from "react"
import LoginPage from "./Pages/LoginPage"
import RegisterPage from "./Pages/RegisterPages"
import NewsPage from "./Pages/NewPage"

const CHAVE_USUARIO = "usuarioLogado"

export default function App() {
    const [usuario, setUsuario] = useState(() => {
        try {
            const salvo = localStorage.getItem(CHAVE_USUARIO)
            return salvo ? JSON.parse(salvo) : null
        } catch {
            return null
        }
    })
    const [tela, setTela] = useState("login")

    const handleLogin = (u) => {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
        setUsuario(u)
    }

    const handleLogout = () => {
        localStorage.removeItem(CHAVE_USUARIO)
        setUsuario(null)
        setTela("login")
    }

    if (usuario) {
        return <NewsPage usuario={usuario} onLogout={handleLogout} />
    }

    if (tela === "cadastro") {
        return <RegisterPage onCadastro={handleLogin} onVoltar={() => setTela("login")} />
    }

    return <LoginPage onLogin={handleLogin} onCadastro={() => setTela("cadastro")} />
}