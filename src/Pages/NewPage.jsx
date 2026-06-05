import { useState, useEffect } from "react"
import {
    buscarNoticias, buscarFontes, buscarDestaques,
    listarFavoritos, adicionarFavorito, removerFavorito,
    listarMonitoramento, adicionarMonitoramento, removerMonitoramento, buscarFeedMonitoramento,
    listarHistorico, limparHistorico, atualizarSenha, excluirConta,
    registrarClique, obterHistoricoNoticias, limparHistoricoNoticias,
} from "../Services/api"
import { Search, Star, Clock, User, TrendingUp, Bell } from "lucide-react"

const MENU_ITEMS = [
    { id: "destaques",      label: "Destaques",      icon: <TrendingUp size={18} /> },
    { id: "busca",          label: "Busca",          icon: <Search size={18} /> },
    { id: "favoritos",      label: "Favoritos",      icon: <Star size={18} /> },
    { id: "monitoramento",  label: "Monitoramento",  icon: <Bell size={18} /> },
    { id: "historico",      label: "Histórico",      icon: <Clock size={18} /> },
    { id: "perfil",         label: "Perfil",         icon: <User size={18} /> },
]

const CATEGORIAS = [
    { id: "noticias",       label: "Geral" },
    { id: "tecnologia",     label: "Tecnologia" },
    { id: "economia",       label: "Negócios" },
    { id: "esportes",       label: "Esportes" },
    { id: "entretenimento", label: "Entretenimento" },
    { id: "saude",          label: "Saúde" },
    { id: "ciencia",        label: "Ciência" },
]

function Sidebar({ aba, setAba, usuario, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h2 className="sidebar-title">InfoNews</h2>
            </div>

            <nav className="sidebar-nav">
                {MENU_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${aba === item.id ? "active" : ""}`}
                        onClick={() => setAba(item.id)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <span className="sidebar-email">{usuario.email}</span>
                <button className="logout-btn" onClick={onLogout}>Sair</button>
            </div>
        </aside>
    )
}

const LIMITE_DESTAQUES = 9
const LIMITE_FEED = 3

function CardList({ artigos, onClique }) {
    return (
        <div className="cards-grid">
            {artigos.map((article, i) => (
                <a key={i} href={article.url} target="_blank"
                   rel="noopener noreferrer" className="news-card"
                   onClick={() => onClique && onClique(article)}>
                    <div className="card-source">{article.source?.name}</div>
                    <h2 className="card-title">{article.title}</h2>
                    <p className="card-desc">{article.description}</p>
                    <span className="card-date">
                        {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("pt-BR")
                            : ""}
                    </span>
                </a>
            ))}
        </div>
    )
}

function DestaquesTab({ usuario }) {
    const [categoria, setCategoria] = useState("noticias")
    const [noticias, setNoticias] = useState([])
    const [feed, setFeed] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")
    const [expandidoDestaques, setExpandidoDestaques] = useState(false)
    const [expandidosFeed, setExpandidosFeed] = useState(new Set())

    const carregarDestaques = async (q) => {
        setLoading(true)
        setErro("")
        setExpandidoDestaques(false)
        try {
            const idioma = localStorage.getItem("idiomaDestaques") || "pt"
            const data = await buscarDestaques(idioma, q)
            setNoticias(data.articles || [])
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDestaques(categoria)
        const t = setTimeout(() => {
            buscarFeedMonitoramento(usuario.id)
                .then(data => setFeed(data))
                .catch(() => {})
        }, 800)
        return () => clearTimeout(t)
    }, [])

    const trocarCategoria = (q) => {
        setCategoria(q)
        carregarDestaques(q)
    }

    const toggleFeed = (id) => {
        setExpandidosFeed(prev => {
            const novo = new Set(prev)
            novo.has(id) ? novo.delete(id) : novo.add(id)
            return novo
        })
    }

    const noticiasMostradas = expandidoDestaques ? noticias : noticias.slice(0, LIMITE_DESTAQUES)

    return (
        <>
            <section className="search-section">
                <h2 className="section-title">Notícias em alta</h2>
                <div className="category-tabs">
                    {CATEGORIAS.map(c => (
                        <button
                            key={c.id}
                            className={`category-btn ${categoria === c.id ? "active" : ""}`}
                            onClick={() => trocarCategoria(c.id)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="results-section">
                {erro && (
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                        <p className="erro-msg" style={{ margin: 0 }}>{erro}</p>
                        <button className="ver-mais-btn" style={{ margin: 0 }}
                                onClick={() => carregarDestaques(categoria)}>
                            Tentar novamente
                        </button>
                    </div>
                )}
                {loading && <p className="hint">Carregando destaques...</p>}
                {!loading && noticias.length === 0 && !erro && (
                    <p className="hint">Nenhum destaque encontrado.</p>
                )}

                <CardList artigos={noticiasMostradas} onClique={registrarClique} />

                {noticias.length > LIMITE_DESTAQUES && (
                    <button className="ver-mais-btn" onClick={() => setExpandidoDestaques(e => !e)}>
                        {expandidoDestaques ? "Ver menos" : `Ver mais (${noticias.length - LIMITE_DESTAQUES} notícias)`}
                    </button>
                )}

                {feed.length > 0 && (
                    <div className="monitor-feed">
                        <h2 className="section-title" style={{ marginTop: "40px" }}>Meu monitoramento</h2>
                        {feed.map(item => {
                            const expandido = expandidosFeed.has(item.monitoramentoId)
                            const artigosMostrados = expandido
                                ? item.artigos
                                : item.artigos.slice(0, LIMITE_FEED)
                            return (
                                <div key={item.monitoramentoId} className="feed-section">
                                    <h3 className="feed-section-title">
                                        <Bell size={14} />
                                        {item.nome}
                                        <span className="feed-tipo">{item.tipo === "TEMA" ? "Tema" : "Fonte"}</span>
                                    </h3>
                                    {item.artigos.length === 0 ? (
                                        <p className="hint" style={{ margin: "8px 0" }}>Nenhuma notícia encontrada.</p>
                                    ) : (
                                        <>
                                            <CardList artigos={artigosMostrados} onClique={registrarClique} />
                                            {item.artigos.length > LIMITE_FEED && (
                                                <button className="ver-mais-btn" onClick={() => toggleFeed(item.monitoramentoId)}>
                                                    {expandido ? "Ver menos" : `Ver mais (${item.artigos.length - LIMITE_FEED} notícias)`}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </>
    )
}

function BuscaTab({ usuario }) {
    const [query, setQuery] = useState("")
    const [idioma, setIdioma] = useState(localStorage.getItem("idiomaBusca") || "pt")
    const [fonteSelecionada, setFonteSelecionada] = useState("")
    const [fontes, setFontes] = useState([])
    const [noticias, setNoticias] = useState([])
    const [favoritosMap, setFavoritosMap] = useState({})
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")
    const [buscado, setBuscado] = useState(false)

    useEffect(() => {
        buscarFontes().then(data => setFontes(data.sources || [])).catch(() => {})
        listarFavoritos(usuario.id).then(data => {
            const map = {}
            data.forEach(f => { map[f.url] = f.id })
            setFavoritosMap(map)
        }).catch(() => {})
    }, [])

    const realizarBusca = async (termoDeBusca, idiomaEscolhido, fonteId) => {
        if (!termoDeBusca.trim()) return
        setErro("")
        setLoading(true)
        setBuscado(true)
        try {
            const data = await buscarNoticias(termoDeBusca, idiomaEscolhido, fonteId, usuario.id)
            setNoticias(data.articles || [])
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    const buscarForm = (e) => {
        e.preventDefault()
        realizarBusca(query, idioma, fonteSelecionada)
    }

    const trocarIdioma = (e) => {
        const novoIdioma = e.target.value
        setIdioma(novoIdioma)
        if (query.trim()) realizarBusca(query, novoIdioma, fonteSelecionada)
    }

    const trocarFonte = (e) => {
        const novaFonte = e.target.value
        setFonteSelecionada(novaFonte)
        if (query.trim()) realizarBusca(query, idioma, novaFonte)
    }

    const toggleFavorito = async (e, artigo) => {
        e.preventDefault()
        e.stopPropagation()
        const url = artigo.url
        if (favoritosMap[url]) {
            await removerFavorito(favoritosMap[url], usuario.id)
            const novo = { ...favoritosMap }
            delete novo[url]
            setFavoritosMap(novo)
        } else {
            const salvo = await adicionarFavorito(artigo, usuario.id)
            setFavoritosMap({ ...favoritosMap, [url]: salvo.id })
        }
    }

    return (
        <>
            <section className="search-section">
                <form className="search-form" onSubmit={buscarForm}>
                    <input
                        type="text"
                        placeholder="Busque por assunto, ex: tecnologia, política..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input"
                    />
                    <div className="search-filters">
                        <select value={idioma} onChange={trocarIdioma} className="filter-select">
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                            <option value="es">Espanhol</option>
                            <option value="fr">Francês</option>
                            <option value="de">Alemão</option>
                            <option value="it">Italiano</option>
                            <option value="nl">Holandês</option>
                            <option value="ru">Russo</option>
                            <option value="zh">Chinês</option>
                            <option value="ar">Árabe</option>
                        </select>

                        <select value={fonteSelecionada} onChange={trocarFonte} className="filter-select">
                            <option value="">Todas as fontes</option>
                            {fontes.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>

                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="results-section">
                {erro && <p className="erro-msg">{erro}</p>}
                {!buscado && !loading && (
                    <p className="hint">Digite um assunto acima para buscar notícias.</p>
                )}
                {buscado && !loading && noticias.length === 0 && !erro && (
                    <p className="hint">Nenhuma notícia encontrada para "{query}".</p>
                )}
                <div className="cards-grid">
                    {noticias.map((article, i) => (
                        <a key={i} href={article.url} target="_blank"
                           rel="noopener noreferrer" className="news-card"
                           onClick={() => registrarClique(article)}>
                            <div className="card-header">
                                <div className="card-source">{article.source?.name}</div>
                                <button
                                    className={`card-fav-btn ${favoritosMap[article.url] ? "fav-active" : ""}`}
                                    onClick={(e) => toggleFavorito(e, article)}
                                    title={favoritosMap[article.url] ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <Star size={15} fill={favoritosMap[article.url] ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <h2 className="card-title">{article.title}</h2>
                            <p className="card-desc">{article.description}</p>
                            <span className="card-date">
                                {article.publishedAt
                                    ? new Date(article.publishedAt).toLocaleDateString("pt-BR")
                                    : ""}
                            </span>
                        </a>
                    ))}
                </div>
            </section>
        </>
    )
}

function FavoritosTab({ usuario }) {
    const [favoritos, setFavoritos] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        listarFavoritos(usuario.id)
            .then(data => setFavoritos(data))
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleRemover = async (id) => {
        try {
            await removerFavorito(id, usuario.id)
            setFavoritos(favoritos.filter(f => f.id !== id))
        } catch (err) {
            setErro(err.message)
        }
    }

    if (loading) return <p className="hint">Carregando favoritos...</p>

    return (
        <section className="results-section" style={{ paddingTop: "32px" }}>
            <h2 className="section-title">Seus Favoritos</h2>
            {erro && <p className="erro-msg">{erro}</p>}
            {favoritos.length === 0 && (
                <p className="hint">Nenhuma notícia favoritada ainda. Salve notícias na aba Busca!</p>
            )}
            <div className="cards-grid">
                {favoritos.map(f => (
                    <div key={f.id} className="news-card">
                        <div className="card-header">
                            <div className="card-source">{f.fonteNome}</div>
                            <button
                                className="card-fav-btn fav-active"
                                onClick={() => handleRemover(f.id)}
                                title="Remover dos favoritos"
                            >
                                <Star size={15} fill="currentColor" />
                            </button>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="card-title-link"
                           onClick={() => registrarClique(f)}>
                            <h2 className="card-title">{f.titulo}</h2>
                        </a>
                        <p className="card-desc">{f.descricao}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

function MonitoramentoTab({ usuario }) {
    const [itens, setItens] = useState([])
    const [tipo, setTipo] = useState("TEMA")
    const [nome, setNome] = useState("")
    const [valor, setValor] = useState("")
    const [fontes, setFontes] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        listarMonitoramento(usuario.id)
            .then(data => setItens(data))
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false))
        buscarFontes().then(data => setFontes(data.sources || [])).catch(() => {})
    }, [])

    const handleAdicionar = async (e) => {
        e.preventDefault()
        if (!nome.trim() || !valor.trim()) return
        try {
            const novo = await adicionarMonitoramento({ nome, valor, tipo }, usuario.id)
            setItens([...itens, novo])
            setNome("")
            setValor("")
        } catch (err) {
            setErro(err.message)
        }
    }

    const handleRemover = async (id) => {
        try {
            await removerMonitoramento(id, usuario.id)
            setItens(itens.filter(i => i.id !== id))
        } catch (err) {
            setErro(err.message)
        }
    }

    const handleTipoChange = (e) => {
        setTipo(e.target.value)
        setValor("")
    }

    return (
        <section className="results-section" style={{ paddingTop: "32px" }}>
            <h2 className="section-title">Monitoramento</h2>
            <p className="monitor-desc">
                Adicione temas ou fontes para monitorar. As notícias aparecem na aba Destaques.
            </p>

            {erro && <p className="erro-msg">{erro}</p>}

            <form className="monitor-form" onSubmit={handleAdicionar}>
                <select value={tipo} onChange={handleTipoChange} className="filter-select">
                    <option value="TEMA">Tema</option>
                    <option value="FONTE">Fonte</option>
                </select>

                <input
                    type="text"
                    placeholder="Nome de exibição (ex: Tecnologia)"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="search-input"
                />

                {tipo === "TEMA" ? (
                    <input
                        type="text"
                        placeholder="Termo de busca (ex: inteligência artificial)"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="search-input"
                    />
                ) : (
                    <select
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="filter-select"
                        style={{ flex: 1 }}
                    >
                        <option value="">Selecione uma fonte</option>
                        {fontes.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                )}

                <button type="submit" className="search-btn">Adicionar</button>
            </form>

            {loading && <p className="hint">Carregando...</p>}

            <div className="monitor-list">
                {itens.length === 0 && !loading && (
                    <p className="hint">Nenhum item monitorado. Adicione um tema ou fonte acima.</p>
                )}
                {itens.map(item => (
                    <div key={item.id} className="monitor-item">
                        <div className="monitor-item-info">
                            <span className="monitor-item-nome">{item.nome}</span>
                            <span className="monitor-item-valor">{item.valor}</span>
                            <span className={`monitor-item-tipo ${item.tipo.toLowerCase()}`}>
                                {item.tipo === "TEMA" ? "Tema" : "Fonte"}
                            </span>
                        </div>
                        <button
                            className="monitor-remove-btn"
                            onClick={() => handleRemover(item.id)}
                            title="Remover monitoramento"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </section>
    )
}

function HistoricoTab({ usuario }) {
    const [buscas, setBuscas] = useState([])
    const [noticias, setNoticias] = useState(obterHistoricoNoticias())
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState("")

    useEffect(() => {
        listarHistorico(usuario.id)
            .then(data => setBuscas(data))
            .catch(err => setErro(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleLimpar = async () => {
        try {
            await limparHistorico(usuario.id)
            limparHistoricoNoticias()
            setBuscas([])
            setNoticias([])
        } catch (err) {
            setErro(err.message)
        }
    }

    const temConteudo = noticias.length > 0 || buscas.length > 0

    return (
        <section className="results-section" style={{ paddingTop: "32px" }}>
            <div className="section-header">
                <h2 className="section-title">Histórico</h2>
                {temConteudo && (
                    <button className="limpar-btn" onClick={handleLimpar}>
                        Limpar tudo
                    </button>
                )}
            </div>
            {erro && <p className="erro-msg">{erro}</p>}

            {noticias.length > 0 && (
                <div className="historico-bloco">
                    <h3 className="historico-subtitulo">Notícias visualizadas</h3>
                    <ul className="historico-list">
                        {noticias.map((item, i) => (
                            <li key={i} className="historico-item historico-noticia">
                                <div className="historico-noticia-info">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                                       className="historico-noticia-titulo">
                                        {item.titulo}
                                    </a>
                                    {item.fonteNome && (
                                        <span className="historico-fonte">{item.fonteNome}</span>
                                    )}
                                </div>
                                <span className="historico-data">
                                    {new Date(item.dataClique).toLocaleString("pt-BR")}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="historico-bloco">
                <h3 className="historico-subtitulo">Buscas realizadas</h3>
                {loading && <p className="hint">Carregando...</p>}
                {!loading && buscas.length === 0 && !erro && (
                    <p className="hint">Nenhuma busca realizada ainda.</p>
                )}
                <ul className="historico-list">
                    {buscas.map(item => (
                        <li key={item.id} className="historico-item">
                            <span className="historico-termo">{item.termoBusca}</span>
                            <span className="historico-data">
                                {new Date(item.dataConsulta).toLocaleString("pt-BR")}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

const IDIOMAS = [
    { value: "pt", label: "Português" },
    { value: "en", label: "Inglês" },
    { value: "es", label: "Espanhol" },
    { value: "fr", label: "Francês" },
    { value: "de", label: "Alemão" },
    { value: "it", label: "Italiano" },
    { value: "nl", label: "Holandês" },
    { value: "ru", label: "Russo" },
    { value: "zh", label: "Chinês" },
    { value: "ar", label: "Árabe" },
]

function PerfilTab({ usuario, onLogout }) {
    const [senha, setSenha] = useState("")
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("")
    const [loadingSenha, setLoadingSenha] = useState(false)
    const [sucessoSenha, setSucessoSenha] = useState("")
    const [erroSenha, setErroSenha] = useState("")

    const [idiomaBusca, setIdiomaBusca] = useState(localStorage.getItem("idiomaBusca") || "pt")
    const [idiomaDestaques, setIdiomaDestaques] = useState(localStorage.getItem("idiomaDestaques") || "pt")

    const [confirmarExclusao, setConfirmarExclusao] = useState(false)
    const [loadingExcluir, setLoadingExcluir] = useState(false)
    const [erroExcluir, setErroExcluir] = useState("")

    const handleSenha = async (e) => {
        e.preventDefault()
        if (senha !== confirmacaoSenha) {
            setErroSenha("As senhas não coincidem.")
            return
        }
        setErroSenha("")
        setSucessoSenha("")
        setLoadingSenha(true)
        try {
            await atualizarSenha(usuario.id, usuario.email, senha, confirmacaoSenha)
            setSucessoSenha("Senha atualizada com sucesso!")
            setSenha("")
            setConfirmacaoSenha("")
        } catch (err) {
            setErroSenha(err.message)
        } finally {
            setLoadingSenha(false)
        }
    }

    const handleIdiomaBusca = (e) => {
        const v = e.target.value
        setIdiomaBusca(v)
        localStorage.setItem("idiomaBusca", v)
    }

    const handleIdiomaDestaques = (e) => {
        const v = e.target.value
        setIdiomaDestaques(v)
        localStorage.setItem("idiomaDestaques", v)
    }

    const handleExcluir = async () => {
        setLoadingExcluir(true)
        setErroExcluir("")
        try {
            await excluirConta(usuario.id)
            onLogout()
        } catch (err) {
            setErroExcluir(err.message)
            setLoadingExcluir(false)
        }
    }

    return (
        <section className="perfil-page">
            <h2 className="section-title" style={{ marginBottom: "32px" }}>Configurações</h2>

            <div className="perfil-section">
                <h3 className="perfil-group-title">Conta</h3>
                <div className="perfil-field">
                    <span className="perfil-label">E-mail</span>
                    <div className="perfil-conta-row">
                        <span className="perfil-email">{usuario.email}</span>
                        <button className="logout-inline-btn" onClick={onLogout}>Sair da conta</button>
                    </div>
                </div>
            </div>

            <div className="perfil-divider" />

            <div className="perfil-section">
                <h3 className="perfil-group-title">Alterar senha</h3>
                {sucessoSenha && <p className="sucesso-msg">{sucessoSenha}</p>}
                {erroSenha && <p className="erro-msg">{erroSenha}</p>}
                <form className="perfil-form" onSubmit={handleSenha}>
                    <div className="perfil-row">
                        <div className="perfil-field-group">
                            <label className="perfil-field-label">Nova senha</label>
                            <input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="search-input"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="perfil-field-group">
                            <label className="perfil-field-label">Confirmar nova senha</label>
                            <input
                                type="password"
                                placeholder="Repita a nova senha"
                                value={confirmacaoSenha}
                                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                                className="search-input"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <button type="submit" className="search-btn perfil-save-btn" disabled={loadingSenha}>
                        {loadingSenha ? "Salvando..." : "Salvar nova senha"}
                    </button>
                </form>
            </div>

            <div className="perfil-divider" />

            <div className="perfil-section">
                <h3 className="perfil-group-title">Preferências</h3>
                <div className="perfil-row">
                    <div className="perfil-field-group">
                        <label className="perfil-field-label">Idioma padrão da busca</label>
                        <select value={idiomaBusca} onChange={handleIdiomaBusca} className="filter-select">
                            {IDIOMAS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                    </div>
                    <div className="perfil-field-group">
                        <label className="perfil-field-label">Idioma padrão dos destaques</label>
                        <select value={idiomaDestaques} onChange={handleIdiomaDestaques} className="filter-select">
                            {IDIOMAS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                    </div>
                </div>
                <p className="perfil-hint">Preferências salvas localmente no navegador.</p>
            </div>

            <div className="perfil-divider" />

            <div className="perfil-section">
                {erroExcluir && <p className="erro-msg">{erroExcluir}</p>}
                {!confirmarExclusao ? (
                    <div className="perfil-danger-row">
                        <div>
                            <p className="perfil-danger-name">Excluir conta</p>
                            <p className="perfil-danger-desc">Remove permanentemente sua conta e todos os dados associados.</p>
                        </div>
                        <button className="danger-btn" onClick={() => setConfirmarExclusao(true)}>
                            Excluir conta
                        </button>
                    </div>
                ) : (
                    <div className="perfil-confirm-exclusao">
                        <p className="perfil-danger-desc">Tem certeza? Esta ação é <strong>irreversível</strong> e todos os seus dados serão apagados.</p>
                        <div className="perfil-confirm-actions">
                            <button className="danger-btn" onClick={handleExcluir} disabled={loadingExcluir}>
                                {loadingExcluir ? "Excluindo..." : "Sim, excluir minha conta"}
                            </button>
                            <button className="limpar-btn" onClick={() => setConfirmarExclusao(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default function NewsPage({ usuario, onLogout }) {
    const [aba, setAba] = useState("destaques")
    const [visitados, setVisitados] = useState(new Set(["destaques"]))

    const irParaAba = (novaAba) => {
        setAba(novaAba)
        setVisitados(prev => new Set([...prev, novaAba]))
    }

    const tab = (id, elemento) => {
        if (!visitados.has(id)) return null
        return (
            <div style={{ display: aba === id ? "contents" : "none" }}>
                {elemento}
            </div>
        )
    }

    return (
        <div className="app-layout">
            <Sidebar aba={aba} setAba={irParaAba} usuario={usuario} onLogout={onLogout} />

            <main className="main-content">
                {tab("destaques",    <DestaquesTab usuario={usuario} />)}
                {tab("busca",        <BuscaTab usuario={usuario} />)}
                {tab("favoritos",    <FavoritosTab usuario={usuario} />)}
                {tab("monitoramento",<MonitoramentoTab usuario={usuario} />)}
                {tab("historico",    <HistoricoTab usuario={usuario} />)}
                {tab("perfil",       <PerfilTab usuario={usuario} onLogout={onLogout} />)}
            </main>
        </div>
    )
}
