import { useState } from "react"
import { login } from "../Services/api"

export default function LoginPage({ onLogin, onCadastro }) {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro("")
        setLoading(true)
        try {
            const usuario = await login(email, senha)
            onLogin(usuario)
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page-shell">
            <section className="login-panel" aria-labelledby="site-title">
                <div className="brand-block">
                    <span className="brand-tag">Portal de noticias</span>
                    <h1 id="site-title">InfoNews</h1>
                    <p>Acesse sua conta para acompanhar manchetes, alertas e os assuntos que importam para voce.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>E-mail</span>
                        <input type="email" placeholder="seuemail@exemplo.com" required
                               value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>

                    <label className="field">
                        <span>Senha</span>
                        <div className="input-wrapper">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Digite sua senha"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                            <button type="button" className="toggle-senha"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}>
                                {mostrarSenha ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </label>

                    {erro && <p className="erro-msg">{erro}</p>}

                    <div className="form-row">
                        <label className="checkbox">
                            <input type="checkbox" />
                            <span>Lembrar acesso</span>
                        </label>
                        <a href="/" onClick={(e) => e.preventDefault()}>Esqueci a senha</a>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <p className="link-cadastro">
                        Não tem conta?{" "}
                        <a href="/" onClick={(e) => { e.preventDefault(); onCadastro() }}>
                            Cadastre-se
                        </a>
                    </p>
                </form>
            </section>
        </main>
    )
}