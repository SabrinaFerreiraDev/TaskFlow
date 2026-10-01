import { Link } from "react-router-dom";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

const benefits = [
  { title: "Organização", text: "Estruture tarefas, prioridades e passos de cada dia." },
  { title: "Progresso", text: "Acompanhe o que já foi concluído e o que vem a seguir." },
  { title: "Favoritos", text: "Destaque tarefas importantes para não perder o foco." },
];

export default function LandingPage() {
  return (
    <main className="auth-screen landing-screen">
      <section className="landing-hero">
        <header className="auth-header">
          <div className="brand auth-brand" aria-label="TaskFlow home">
            <BrandMark />
            <span>
              Task<span>Flow</span>
            </span>
          </div>
        </header>

        <div className="landing-layout">
          <div className="landing-copy">
            <span className="eyebrow">Seu fluxo em ordem</span>
            <h1>
              Organize suas tarefas.
              <span> Acompanhe seu progresso.</span>
              <span> Mantenha tudo sob controle.</span>
            </h1>
            <p>
              Uma forma mais clara de planejar seu dia, priorizar o que importa e
              transformar planos em ações consistentes.
            </p>

            <div className="cta-row">
              <Link to="/login" className="primary-button auth-action">
                Entrar
              </Link>
              <Link to="/register" className="secondary-button auth-action secondary-auth">
                Criar conta
              </Link>
            </div>
          </div>

          <aside className="feature-panel" aria-label="Benefícios da plataforma">
            <div className="feature-panel-header">
              <span className="eyebrow">Benefícios</span>
              <h2>TaskFlow</h2>
            </div>

            <div className="feature-list">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="feature-card">
                  <span className="feature-dot" aria-hidden="true" />
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
