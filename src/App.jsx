function App() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="page-shell">
      <section className="login-panel" aria-labelledby="site-title">
        <div className="brand-block">
          <span className="brand-tag">Portal de noticias</span>
          <h1 id="site-title">InfoNews</h1>
          <p>
            Acesse sua conta para acompanhar manchetes, alertas e os assuntos
            que importam para voce.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" placeholder="seuemail@exemplo.com" required />
          </label>

          <label className="field">
            <span>Senha</span>
            <input type="password" placeholder="Digite sua senha" required />
          </label>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Lembrar acesso</span>
            </label>
            <a href="/" onClick={(event) => event.preventDefault()}>
              Esqueci a senha
            </a>
          </div>

          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  )
}

export default App
