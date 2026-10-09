import { Link } from "react-router-dom";

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /></span>;
}

export default function LandingPage() {
  return (
    <main className="auth-screen landing-screen">
      <section className="landing-hero">
        <header className="auth-header">
          <div className="brand auth-brand" aria-label="TaskFlow home">
            <BrandMark />
            <span>Task<span>Flow</span></span>
          </div>
          <Link to="/login" className="landing-signin">Já tem uma conta? <b>Entrar</b></Link>
        </header>

        <div className="landing-layout">
          <div className="landing-copy">
            <span className="eyebrow">Planejamento pessoal, sem ruído</span>
            <h1>O que importa,<span> no ritmo certo.</span></h1>
            <p>Um espaço direto para decidir o próximo passo, acompanhar o que foi feito e manter a semana sob controle.</p>
            <div className="cta-row">
              <Link to="/register" className="primary-button auth-action">Criar minha conta <span aria-hidden="true">→</span></Link>
              <Link to="/login" className="secondary-button auth-action secondary-auth">Entrar</Link>
            </div>
            <p className="landing-note">Comece com uma lista simples. Ajuste o fluxo conforme você avança.</p>
          </div>

          <aside className="product-preview" aria-label="Prévia do TaskFlow">
            <div className="preview-topline"><span>Hoje</span><span className="preview-status">2 concluídas</span></div>
            <div className="preview-title-row"><div><span className="preview-kicker">Sua lista</span><h2>Quinta-feira</h2></div><span className="preview-progress">68%</span></div>
            <div className="preview-meter"><span /></div>
            <div className="preview-list">
              <div className="preview-task is-done"><span className="preview-check">✓</span><div><strong>Revisar anotações</strong><small>Estudos · Média</small></div></div>
              <div className="preview-task"><span className="preview-check" /><div><strong>Planejar próxima entrega</strong><small>Prática · Alta</small></div><span className="preview-star">★</span></div>
              <div className="preview-task"><span className="preview-check" /><div><strong>Organizar materiais</strong><small>Estudos · Baixa</small></div></div>
            </div>
            <div className="preview-footer"><span>3 tarefas para seguir</span><span aria-hidden="true">→</span></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
