const API = "http://localhost:8080"

export async function login(email, senha) {
    const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha, confirmacaoSenha: senha }),
    })
    if (!res.ok) throw new Error("E-mail ou senha incorretos")
    return res.json()
}

export async function cadastrar(email, senha, confirmacaoSenha) {
    const res = await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha, confirmacaoSenha }),
    })
    if (!res.ok) throw new Error("Erro ao cadastrar. Verifique os dados.")
    return res.json()
}

export async function buscarNoticias(query, language, usuarioId) {
    const res = await fetch(`${API}/news/buscar?q=${encodeURIComponent(query)}&language=${language}`, {
        headers: { usuarioId },
    })
    if (!res.ok) throw new Error("Erro ao buscar notícias")
    return res.json()
}