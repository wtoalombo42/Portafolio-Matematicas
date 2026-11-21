import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, Archive, ArrowDownRight, ArrowLeft, ArrowUpRight, BookOpen,
  Calculator, CheckCircle2, ChevronRight, Clock3, Download, File,
  FileCheck2, FileText, FolderOpen, GraduationCap, Grid2X2, HardDrive,
  Laptop, LayoutDashboard, Library, Menu, Newspaper, Plus, Search,
  ShieldCheck, Sparkles, UploadCloud, X
} from "lucide-react";
import "./style.css";

const sections = [
  { id:"materia", n:"01", title:"Materia", subtitle:"Fundamentos y contenidos", icon:BookOpen, tag:"TEORÍA", cover:"cover-theory", description:"Apuntes, fórmulas, conceptos y contenidos desarrollados en clase." },
  { id:"examenes", n:"02", title:"Exámenes", subtitle:"Evaluaciones y prácticas", icon:FileCheck2, tag:"EVALUACIÓN", cover:"cover-exams", description:"Evaluaciones, pruebas y ejercicios de preparación." },
  { id:"apes", n:"03", title:"APEs", subtitle:"Actividades prácticas", icon:Calculator, tag:"APRENDIZAJE", cover:"cover-apes", description:"Actividades prácticas experimentales y trabajos académicos." },
  { id:"deberes", n:"04", title:"Deberes", subtitle:"Trabajo autónomo", icon:FileText, tag:"ACTIVIDADES", cover:"cover-homework", description:"Ejercicios y tareas realizadas durante el período académico." },
  { id:"mano", n:"05", title:"Consultas a mano", subtitle:"Desarrollo manuscrito", icon:BookOpen, tag:"CUADERNO", cover:"cover-hand", description:"Investigaciones y consultas desarrolladas a mano." },
  { id:"computadora", n:"06", title:"Consultas a computadora", subtitle:"Investigación digital", icon:Laptop, tag:"DIGITAL", cover:"cover-digital", description:"Consultas, investigaciones y documentos elaborados digitalmente." },
  { id:"ekos", n:"07", title:"Ekos", subtitle:"Análisis y contexto", icon:Newspaper, tag:"LECTURA", cover:"cover-ekos", description:"Material y análisis relacionados con las publicaciones Ekos." },
  { id:"lecturas", n:"08", title:"Lecturas críticas", subtitle:"Comprensión y reflexión", icon:Library, tag:"REFLEXIÓN", cover:"cover-reading", description:"Lecturas, análisis, comentarios y reflexiones académicas." },
  { id:"anexos", n:"09", title:"Anexos", subtitle:"Material complementario", icon:Archive, tag:"ARCHIVO", cover:"cover-annex", description:"Recursos adicionales y documentos de apoyo." }
];

function App() {
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [filesBySection, setFilesBySection] = useState({});
  const [notice, setNotice] = useState("");
  const inputRef = useRef(null);

  const totalFiles = Object.values(filesBySection).reduce((sum, list) => sum + list.length, 0);
  const filtered = useMemo(() => sections.filter(s =>
    `${s.title} ${s.subtitle} ${s.description}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  const handleFiles = (event) => {
    if (!active) return;
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    const newItems = selected.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      date: new Date().toLocaleDateString("es-EC"),
      url: URL.createObjectURL(file)
    }));
    setFilesBySection(prev => ({ ...prev, [active.id]: [...(prev[active.id] || []), ...newItems] }));
    showNotice(`${selected.length} archivo(s) agregado(s) a ${active.title}.`);
    event.target.value = "";
  };

  const removeFile = (id) => {
    setFilesBySection(prev => ({
      ...prev,
      [active.id]: (prev[active.id] || []).filter(file => file.id !== id)
    }));
  };

  const enterAdmin = () => {
    // Demo local: sustituir por autenticación segura de Supabase antes de publicar.
    if (password === "matematicas2026") {
      setAdmin(true);
      setShowLogin(false);
      setPassword("");
      showNotice("Modo de edición activado en esta demostración.");
    } else {
      showNotice("Contraseña de demostración incorrecta.");
    }
  };

  const openSection = (section) => {
    setActive(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setActive(null)}>
          <span className="brand-mark"><Calculator size={22}/></span>
          <span><b>MATH<span>SPACE</span></b><small>ACADEMIC PORTFOLIO</small></span>
        </a>
        <nav className="topnav">
          <a href="#portfolio">Portafolio</a>
          <a href="#about">Acerca de</a>
          <button className="admin-button" onClick={() => admin ? setAdmin(false) : setShowLogin(true)}>
            <ShieldCheck size={16}/>{admin ? "Salir de edición" : "Acceso administrador"}
          </button>
        </nav>
        <button className="mobile-menu" onClick={() => setShowLogin(true)} aria-label="Abrir acceso"><Menu/></button>
      </header>

      {!active ? (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span className="pulse-dot"/> PORTAFOLIO UNIVERSITARIO · 2026</div>
              <h1>El conocimiento<br/>se construye con <em>lógica.</em></h1>
              <p className="hero-lead">Un espacio digital para organizar, documentar y compartir mi recorrido académico en Matemáticas.</p>
              <div className="hero-actions">
                <a className="primary-cta" href="#portfolio">Explorar portafolio <ArrowUpRight size={17}/></a>
                <span className="hero-note"><span className="tiny-line"/> Aprender · Resolver · Evolucionar</span>
              </div>
              <div className="hero-stats">
                <div><b>09</b><span>ÁREAS ACADÉMICAS</span></div>
                <div><b>{String(totalFiles).padStart(2,"0")}</b><span>ARCHIVOS EN ESTA SESIÓN</span></div>
                <div><b>∞</b><span>POSIBILIDADES</span></div>
              </div>
            </div>
            <div className="hero-art" aria-label="Ilustración matemática abstracta">
              <div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/>
              <div className="math-core"><span>∑</span><small>f(x) = ∫</small></div>
              <span className="formula formula-one">E = mc²</span>
              <span className="formula formula-two">π ≈ 3.1416</span>
              <span className="formula formula-three">lim x → ∞</span>
              <span className="formula formula-four">a² + b² = c²</span>
              <div className="art-caption"><Sparkles size={14}/> MATHEMATICAL THINKING</div>
            </div>
          </section>

          <section className="portfolio-section" id="portfolio">
            <div className="section-heading">
              <div><div className="eyebrow">EXPLORA · ORGANIZA · APRENDE</div><h2>Mi espacio <em>académico</em></h2><p>Nueve espacios para reunir el trabajo de todo el período.</p></div>
              <div className="search-wrap"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar una sección..."/></div>
            </div>
            <div className="folder-grid">
              {filtered.map(section => {
                const Icon = section.icon;
                const count = (filesBySection[section.id] || []).length;
                return <button className={`folder-card ${section.cover}`} key={section.id} onClick={() => openSection(section)}>
                  <div className="card-top"><span className="card-number">{section.n} / 09</span><span className="card-tag">{section.tag}</span></div>
                  <div className="cover-art"><div className="art-grid"/><div className="art-symbol">{section.id === "materia" ? "∑" : section.id === "examenes" ? "√" : section.id === "apes" ? "∫" : section.id === "deberes" ? "π" : section.id === "mano" ? "∆" : section.id === "computadora" ? "∞" : section.id === "ekos" ? "∂" : section.id === "lecturas" ? "θ" : "Ω"}</div><Icon className="card-icon" size={22}/></div>
                  <div className="card-bottom"><div><h3>{section.title}</h3><p>{section.subtitle}</p></div><span className="card-arrow"><ArrowUpRight size={18}/></span></div>
                  <div className="card-foot"><span>{count} archivos en esta sesión</span><span>ABRIR <ChevronRight size={13}/></span></div>
                </button>;
              })}
            </div>
            {filtered.length === 0 && <div className="empty-state">No encontramos secciones con ese nombre.</div>}
          </section>

          <section className="about-strip" id="about">
            <div className="about-icon"><GraduationCap size={25}/></div>
            <div><div className="eyebrow">SOBRE ESTE ESPACIO</div><h3>Un registro de mi aprendizaje.</h3><p>Este portafolio reúne actividades, evaluaciones, consultas y materiales desarrollados durante mi formación universitaria.</p></div>
            <div className="signature">W. Toalombo<span>ESTUDIANTE</span></div>
          </section>
        </main>
      ) : (
        <main className="detail-page">
          <button className="back-button" onClick={() => setActive(null)}><ArrowLeft size={17}/> Volver al portafolio</button>
          <div className={`detail-banner ${active.cover}`}>
            <div className="detail-banner-content"><span className="eyebrow">{active.n} / 09 · {active.tag}</span><h1>{active.title}</h1><p>{active.description}</p></div>
            <div className="detail-glyph">{active.id === "materia" ? "∑" : active.id === "examenes" ? "√" : active.id === "apes" ? "∫" : active.id === "deberes" ? "π" : active.id === "mano" ? "∆" : active.id === "computadora" ? "∞" : active.id === "ekos" ? "∂" : active.id === "lecturas" ? "θ" : "Ω"}</div>
          </div>
          <div className="files-heading"><div><div className="eyebrow">BIBLIOTECA DE DOCUMENTOS</div><h2>Archivos de la sección</h2><p>Documentos asociados a {active.title.toLowerCase()}.</p></div>
            {admin && <button className="primary-cta" onClick={() => inputRef.current?.click()}><UploadCloud size={17}/> Subir archivos</button>}
          </div>
          <input ref={inputRef} type="file" multiple className="hidden-input" onChange={handleFiles} />
          {!admin && <div className="notice-box"><ShieldCheck size={18}/> Esta sección es de consulta. El administrador puede agregar documentos desde su panel.</div>}
          <div className="document-list">
            {(filesBySection[active.id] || []).length ? (filesBySection[active.id] || []).map(file => (
              <div className="document-row" key={file.id}><div className="file-icon"><FileText size={21}/></div><div className="file-info"><b>{file.name}</b><span>{(file.size / 1024).toFixed(1)} KB · Agregado {file.date}</span></div><a className="icon-action" href={file.url} download={file.name} title="Descargar"><Download size={18}/></a>{admin && <button className="icon-action danger" onClick={() => removeFile(file.id)} title="Quitar"><X size={18}/></button>}</div>
            )) : <div className="empty-documents"><div className="empty-file"><FolderOpen size={30}/></div><h3>Aún no hay documentos</h3><p>Los archivos que se agreguen a esta sección aparecerán aquí.</p>{admin && <button className="primary-cta" onClick={() => inputRef.current?.click()}><Plus size={17}/> Agregar primer archivo</button>}</div>}
          </div>
        </main>
      )}

      <footer className="footer"><div className="footer-brand"><Calculator size={17}/> MATHSPACE</div><span>PORTAFOLIO ACADÉMICO · MATEMÁTICAS</span><span>WILMER TOALOMBO © 2026</span></footer>

      {showLogin && <div className="modal-backdrop" onClick={() => setShowLogin(false)}><div className="login-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowLogin(false)}><X size={18}/></button><div className="modal-symbol"><ShieldCheck size={25}/></div><div className="eyebrow">ZONA RESTRINGIDA</div><h2>Acceso administrador</h2><p>Ingresa la clave de demostración para probar la carga local de archivos.</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña de demostración" onKeyDown={e => e.key === "Enter" && enterAdmin()}/><button className="primary-cta full" onClick={enterAdmin}>Ingresar <ArrowUpRight size={16}/></button><small>Demo local: matematicas2026. No usar esta clave en una web pública.</small></div></div>}
      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);