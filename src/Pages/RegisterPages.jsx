import { useState } from "react"
import { cadastrar } from "../Services/api"

export default function RegisterPage({ onCadastro, onVoltar }) {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("")
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErro("")
        if (senha !== confirmacaoSenha) {
            setErro("As senhas não coincidem")
            return
        }
        setLoading(true)
        try {
            const usuario = await cadastrar(email, senha, confirmacaoSenha)
            onCadastro(usuario)
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="page-shell">
            <section className="login-panel" aria-labelledby="register-title">
                <div className="brand-block">
                    <span className="brand-tag">Portal de noticias</span>
                    <h1 id="register-title">InfoNews</h1>
                    <p>Crie sua conta e comece a acompanhar as notícias que importam para você.</p>
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
                                placeholder="Mínimo 6 caracteres"
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

                    <label className="field">
                        <span>Confirmar Senha</span>
                        <div className="input-wrapper">
                            <input
                                type={mostrarConfirmacao ? "text" : "password"}
                                placeholder="Repita a senha"
                                required
                                value={confirmacaoSenha}
                                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                            />
                            <button type="button" className="toggle-senha"
                                    onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}>
                                {mostrarConfirmacao ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </label>

                    {erro && <p className="erro-msg">{erro}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>

                    <p className="link-cadastro">
                        Já tem conta?{" "}
                        <a href="/" onClick={(e) => { e.preventDefault(); onVoltar() }}>
                            Entrar
                        </a>
                    </p>
                </form>
            </section>
        </main>
    )
}