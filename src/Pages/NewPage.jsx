import { useState } from "react"
import { buscarNoticias } from "../Services/api"
import { Search, Star, Clock, User } from "lucide-react"

const MENU_ITEMS = [
    { id: "busca",     label: "Busca",     icon: <Search size={18} /> },
    { id: "favoritos", label: "Favoritos", icon: <Star size={18} /> },
    { id: "historico", label: "Histórico", icon: <Clock size={18} /> },
    { id: "perfil",    label: "Perfil",    icon: <User size={18} /> },
]

function Sidebar({ aba, setAba, usuario, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-tag">Portal de notícias</span>
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

function BuscaTab({ usuario }) {
    const [query, setQuery] = useState("")
    const [idioma, setIdioma] = useState("pt")
    const [noticias, setNoticias] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState("")
    const [buscado, setBuscado] = useState(false)

    const realizarBusca = async (termoDeBusca, idiomaEscolhido) => {
        if (!termoDeBusca.trim()) return
        setErro("")
        setLoading(true)
        setBuscado(true)
        try {
            const data = await buscarNoticias(termoDeBusca, idiomaEscolhido, usuario.id)
            setNoticias(data.articles || [])
        } catch (err) {
            setErro(err.message)
        } finally {
            setLoading(false)
        }
    }

    const buscarForm = (e) => {
        e.preventDefault()
        realizarBusca(query, idioma)
    }

    const trocarIdioma = (e) => {
        const novoIdioma = e.target.value
        setIdioma(novoIdioma)
        
        if (query.trim()) {
            realizarBusca(query, novoIdioma)
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
                    
                    <select 
                        value={idioma} 
                        onChange={trocarIdioma} 
                        className="language-select"
                        style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', marginLeft: '8px', backgroundColor: '#333', color: '#fff' }}
                    >
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

                    <button type="submit" className="search-btn" disabled={loading} style={{ marginLeft: '8px' }}>
                        {loading ? "Buscando..." : "Buscar"}
                    </button>
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
                           rel="noopener noreferrer" className="news-card">
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
            </section>
        </>
    )
}

function FavoritosTab() {
    return (
        <div className="tab-placeholder">
            <span className="tab-icon">⭐</span>
            <h3>Favoritos</h3>
            <p>Suas notícias favoritas aparecerão aqui.</p>
        </div>
    )
}

function HistoricoTab() {
    return (
        <div className="tab-placeholder">
            <span className="tab-icon">🕒</span>
            <h3>Histórico</h3>
            <p>Suas buscas recentes aparecerão aqui.</p>
        </div>
    )
}

function PerfilTab({ usuario }) {
    return (
        <div className="tab-placeholder">
            <span className="tab-icon">👤</span>
            <h3>Perfil</h3>
            <p className="perfil-email">{usuario.email}</p>
            <p>Configurações de perfil em breve.</p>
        </div>
    )
}

export default function NewsPage({ usuario, onLogout }) {
    const [aba, setAba] = useState("busca")

    return (
        <div className="app-layout">
            <Sidebar aba={aba} setAba={setAba} usuario={usuario} onLogout={onLogout} />

            <main className="main-content">
                {aba === "busca"     && <BuscaTab usuario={usuario} />}
                {aba === "favoritos" && <FavoritosTab />}
                {aba === "historico" && <HistoricoTab />}
                {aba === "perfil"    && <PerfilTab usuario={usuario} />}
            </main>
        </div>
    )
}