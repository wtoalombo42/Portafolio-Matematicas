
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, Archive, ArrowLeft, ArrowUpRight, BookOpen,
  Calculator, CheckCircle2, ChevronRight, Download, FileText,
  FolderOpen, GraduationCap, Laptop, Library, Menu, Newspaper,
  Plus, Search, ShieldCheck, Sparkles, UploadCloud, X
} from "lucide-react";
import { supabase } from "./supabase";
import "./style.css";

const OWNER_ID = "c29c7b3a-5042-4684-9d08-031844e8308d";
const BUCKET = "documentos-mathspace";

const sections = [
  { id:"materia", n:"01", title:"Materia", subtitle:"Fundamentos y contenidos", icon:BookOpen, tag:"TEORÍA", cover:"cover-theory", description:"Apuntes, fórmulas, conceptos y contenidos desarrollados en clase." },
  { id:"examenes", n:"02", title:"Exámenes", subtitle:"Evaluaciones y prácticas", icon:FileText, tag:"EVALUACIÓN", cover:"cover-exams", description:"Evaluaciones, pruebas y ejercicios de preparación." },
  { id:"apes", n:"03", title:"APEs", subtitle:"Actividades prácticas", icon:Calculator, tag:"APRENDIZAJE", cover:"cover-apes", description:"Actividades prácticas experimentales y trabajos académicos." },
  { id:"deberes", n:"04", title:"Deberes", subtitle:"Trabajo autónomo", icon:FileText, tag:"ACTIVIDADES", cover:"cover-homework", description:"Ejercicios y tareas realizadas durante el período académico." },
  { id:"mano", n:"05", title:"Consultas a mano", subtitle:"Desarrollo manuscrito", icon:BookOpen, tag:"CUADERNO", cover:"cover-hand", description:"Investigaciones y consultas desarrolladas a mano." },
  { id:"computadora", n:"06", title:"Consultas a computadora", subtitle:"Investigación digital", icon:Laptop, tag:"DIGITAL", cover:"cover-digital", description:"Consultas, investigaciones y documentos digitales." },
  { id:"ekos", n:"07", title:"Ekos", subtitle:"Análisis y contexto", icon:Newspaper, tag:"LECTURA", cover:"cover-ekos", description:"Material y análisis relacionados con publicaciones Ekos." },
  { id:"lecturas", n:"08", title:"Lecturas críticas", subtitle:"Comprensión y reflexión", icon:Library, tag:"REFLEXIÓN", cover:"cover-reading", description:"Lecturas, análisis, comentarios y reflexiones académicas." },
  { id:"anexos", n:"09", title:"Anexos", subtitle:"Material complementario", icon:Archive, tag:"ARCHIVO", cover:"cover-annex", description:"Recursos adicionales y documentos de apoyo." }
];

const partials = [
  {
    id: "primer",
    number: "01",
    title: "Primer parcial",
    description: "Actividades y documentos del primer parcial.",
    icon: BookOpen
  },
  {
    id: "segundo",
    number: "02",
    title: "Segundo parcial",
    description: "Actividades y documentos del segundo parcial.",
    icon: GraduationCap
  }
];

function App() {
  const [active, setActive] = useState(null);
  const [activePartial, setActivePartial] = useState(null);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("wtoalombo42@gmail.com");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const admin = user?.id === OWNER_ID;

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const loadDocuments = useCallback(async () => {
    const { data, error } = await supabase
      .from("documentos")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      showNotice("No se pudieron cargar los documentos.");
      return;
    }

    setDocuments(data || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, user]);

  const filtered = useMemo(() => sections.filter(s =>
    `${s.title} ${s.subtitle} ${s.description}`
      .toLowerCase().includes(query.toLowerCase())
  ), [query]);

  const totalFiles = documents.filter(doc =>
    admin || doc.publicado
  ).length;

  const enterAdmin = async () => {
    if (!email.trim() || !password) {
      showNotice("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);

    if (error) {
      showNotice("No se pudo iniciar sesión. Revisa tus datos.");
      return;
    }

    if (data.user?.id !== OWNER_ID) {
      await supabase.auth.signOut();
      showNotice("Esta cuenta no tiene permisos de administrador.");
      return;
    }

    setShowLogin(false);
    setPassword("");
    showNotice("Acceso de administrador activado.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActive(null);
    setActivePartial(null);
    showNotice("Sesión cerrada.");
  };

  const handleFiles = async (event) => {
    if (!active || !activePartial || !admin) return;

    const selected = Array.from(event.target.files || []);

    const pdfs = selected.filter(file =>
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    );

    if (!pdfs.length) {
      showNotice("Selecciona archivos PDF.");
      event.target.value = "";
      return;
    }

    setLoading(true);
    let uploaded = 0;

    for (const file of pdfs) {
      const safeName = file.name.replace(/[\\/]/g, "_");

      const objectPath =
        `${user.id}/${active.id}/${activePartial}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, {
          contentType: "application/pdf",
          upsert: false
        });

      if (uploadError) {
        showNotice(`Error al subir ${file.name}.`);
        continue;
      }

      const { error: insertError } = await supabase
        .from("documentos")
        .insert({
          bucket_id: BUCKET,
          object_path: objectPath,
          titulo: file.name,
          seccion: active.id,
          parcial: activePartial,
          publicado: true,
          propietario: user.id
        });

      if (insertError) {
        await supabase.storage
          .from(BUCKET)
          .remove([objectPath]);

        showNotice(`No se pudo registrar ${file.name}.`);
        continue;
      }

      uploaded++;
    }

    await loadDocuments();

    setLoading(false);
    event.target.value = "";

    if (uploaded) {
      showNotice(`${uploaded} PDF(s) subido(s) correctamente.`);
    }
  };

  const downloadFile = async (doc) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.object_path, 120);

    if (error || !data?.signedUrl) {
      showNotice("No se pudo generar el enlace de descarga.");
      return;
    }

    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = doc.titulo;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const togglePublish = async (doc) => {
    const { error } = await supabase
      .from("documentos")
      .update({ publicado: !doc.publicado })
      .eq("id", doc.id);

    if (error) {
      showNotice("No se pudo actualizar la publicación.");
      return;
    }

    await loadDocuments();

    showNotice(
      doc.publicado
        ? "Documento ocultado."
        : "Documento publicado."
    );
  };

  const removeFile = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.titulo}" definitivamente?`)) {
      return;
    }

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([doc.object_path]);

    if (storageError) {
      showNotice("No se pudo eliminar el archivo.");
      return;
    }

    const { error: dbError } = await supabase
      .from("documentos")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      showNotice("El archivo se quitó del almacenamiento, pero falló el registro.");
      await loadDocuments();
      return;
    }

    await loadDocuments();
    showNotice("Documento eliminado.");
  };

  const openSection = (section) => {
    setActive(section);
    setActivePartial(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPartial = (partialId) => {
    setActivePartial(partialId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeDocuments = active && activePartial
    ? documents.filter(doc =>
        doc.seccion === active.id &&
        doc.parcial === activePartial &&
        (admin || doc.publicado)
      )
    : [];

  const selectedPartial = partials.find(
    partial => partial.id === activePartial
  );

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={() => {
            setActive(null);
            setActivePartial(null);
          }}
        >
          <span className="brand-mark">
            <Calculator size={22}/>
          </span>

          <span>
            <b>MATH<span>SPACE</span></b>
            <small>ACADEMIC PORTFOLIO</small>
          </span>
        </a>

        <nav className="topnav">
          <a
            href="#portfolio"
            onClick={() => {
              setActive(null);
              setActivePartial(null);
            }}
          >
            Portafolio
          </a>

          <a
            href="#about"
            onClick={() => {
              setActive(null);
              setActivePartial(null);
            }}
          >
            Acerca de
          </a>

          <button
            className="admin-button"
            onClick={() => admin ? logout() : setShowLogin(true)}
          >
            <ShieldCheck size={16}/>
            {admin ? "Cerrar sesión" : "Acceso administrador"}
          </button>
        </nav>

        <button
          className="mobile-menu"
          onClick={() => setShowLogin(true)}
          aria-label="Abrir acceso"
        >
          <Menu/>
        </button>
      </header>

      {!active ? (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="pulse-dot"/>
                PORTAFOLIO UNIVERSITARIO · 2026
              </div>

              <h1>
                El conocimiento<br/>
                se construye con <em>lógica.</em>
              </h1>

              <p className="hero-lead">
                Un espacio digital para organizar, documentar y compartir
                mi recorrido académico en Matemáticas.
              </p>

              <div className="hero-actions">
                <a className="primary-cta" href="#portfolio">
                  Explorar portafolio <ArrowUpRight size={17}/>
                </a>

                <span className="hero-note">
                  <span className="tiny-line"/>
                  Aprender · Resolver · Evolucionar
                </span>
              </div>

              <div className="hero-stats">
                <div>
                  <b>09</b>
                  <span>ÁREAS ACADÉMICAS</span>
                </div>

                <div>
                  <b>{String(totalFiles).padStart(2,"0")}</b>
                  <span>DOCUMENTOS</span>
                </div>

                <div>
                  <b>∞</b>
                  <span>POSIBILIDADES</span>
                </div>
              </div>
            </div>

            <div className="hero-art">
              <div className="orbit orbit-a"/>
              <div className="orbit orbit-b"/>
              <div className="orbit orbit-c"/>

              <div className="math-core">
                <span>∑</span>
                <small>f(x) = ∫</small>
              </div>

              <span className="formula formula-one">E = mc²</span>
              <span className="formula formula-two">π ≈ 3.1416</span>
              <span className="formula formula-three">lim x → ∞</span>
              <span className="formula formula-four">a² + b² = c²</span>

              <div className="art-caption">
                <Sparkles size={14}/> MATHEMATICAL THINKING
              </div>
            </div>
          </section>

          <section className="portfolio-section" id="portfolio">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  EXPLORA · ORGANIZA · APRENDE
                </div>

                <h2>
                  Mi espacio <em>académico</em>
                </h2>

                <p>
                  Nueve espacios para reunir el trabajo de todo el período.
                </p>
              </div>

              <div className="search-wrap">
                <Search size={17}/>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar una sección..."
                />
              </div>
            </div>

            <div className="folder-grid">
              {filtered.map(section => {
                const Icon = section.icon;

                const count = documents.filter(doc =>
                  doc.seccion === section.id &&
                  (admin || doc.publicado)
                ).length;

                return (
                  <button
                    className={`folder-card ${section.cover}`}
                    key={section.id}
                    onClick={() => openSection(section)}
                  >
                    <div className="card-top">
                      <span className="card-number">
                        {section.n} / 09
                      </span>

                      <span className="card-tag">
                        {section.tag}
                      </span>
                    </div>

                    <div className="cover-art">
                      <div className="art-grid"/>
                      <div className="art-symbol">
                        {["∑","√","∫","π","∆","∞","∂","θ","Ω"][Number(section.n)-1]}
                      </div>
                      <Icon className="card-icon" size={22}/>
                    </div>

                    <div className="card-bottom">
                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.subtitle}</p>
                      </div>

                      <span className="card-arrow">
                        <ArrowUpRight size={18}/>
                      </span>
                    </div>

                    <div className="card-foot">
                      <span>{count} documentos</span>
                      <span>
                        ABRIR <ChevronRight size={13}/>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                No encontramos secciones con ese nombre.
              </div>
            )}
          </section>

          <section className="about-strip" id="about">
            <div className="about-icon">
              <GraduationCap size={25}/>
            </div>

            <div>
              <div className="eyebrow">SOBRE ESTE ESPACIO</div>
              <h3>Un registro de mi aprendizaje.</h3>
              <p>
                Este portafolio reúne actividades, evaluaciones, consultas
                y materiales desarrollados durante mi formación universitaria.
              </p>
            </div>

            <div className="signature">
              W. Toalombo
              <span>ESTUDIANTE</span>
            </div>
          </section>
        </main>
      ) : (
        <main className="detail-page">
          <button
            className="back-button"
            onClick={() => {
              setActive(null);
              setActivePartial(null);
            }}
          >
            <ArrowLeft size={17}/> Volver al portafolio
          </button>

          <div className={`detail-banner ${active.cover}`}>
            <div className="detail-banner-content">
              <span className="eyebrow">
                {active.n} / 09 · {active.tag}
              </span>

              <h1>{active.title}</h1>
              <p>{active.description}</p>
            </div>

            <div className="detail-glyph">
              {"∑√∫π∆∞∂θΩ"[Number(active.n)-1]}
            </div>
          </div>

          {!activePartial ? (
            <section className="partial-section">
              <div className="eyebrow">
                ORGANIZACIÓN ACADÉMICA
              </div>

              <h2>Selecciona el parcial</h2>

              <p>
                Elige el período para consultar o subir tus documentos.
              </p>

              <div className="partial-grid">
                {partials.map(partial => {
                  const Icon = partial.icon;

                  const count = documents.filter(doc =>
                    doc.seccion === active.id &&
                    doc.parcial === partial.id &&
                    (admin || doc.publicado)
                  ).length;

                  return (
                    <button
                      className="partial-card"
                      key={partial.id}
                      onClick={() => openPartial(partial.id)}
                    >
                      <span className="partial-number">
                        {partial.number}
                      </span>

                      <Icon size={30}/>

                      <h3>{partial.title}</h3>

                      <p>{partial.description}</p>

                      <span>
                        {count} documentos · ABRIR CARPETA →
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <>
              <button
                className="back-button"
                onClick={() => setActivePartial(null)}
              >
                <ArrowLeft size={17}/> Volver a los parciales
              </button>

              <div className="files-heading">
                <div>
                  <div className="eyebrow">
                    BIBLIOTECA DE DOCUMENTOS · {selectedPartial?.number}
                  </div>

                  <h2>{selectedPartial?.title}</h2>

                  <p>
                    Archivos de {active.title.toLowerCase()} · {selectedPartial?.title}.
                  </p>
                </div>

                {admin && (
                  <button
                    className="primary-cta"
                    onClick={() => inputRef.current?.click()}
                    disabled={loading}
                  >
                    <UploadCloud size={17}/>
                    {loading ? "Procesando..." : "Subir archivos PDF"}
                  </button>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden-input"
                onChange={handleFiles}
              />

              {!admin && (
                <div className="notice-box">
                  <ShieldCheck size={18}/>
                  Documentos académicos disponibles para consulta y descarga.
                </div>
              )}

              {admin && (
                <div className="notice-box">
                  <ShieldCheck size={18}/>
                  Modo administrador: puedes subir, publicar, ocultar y eliminar documentos.
                </div>
              )}

              <div className="document-list">
                {activeDocuments.length ? (
                  activeDocuments.map(doc => (
                    <div className="document-row" key={doc.id}>
                      <div className="file-icon">
                        <FileText size={21}/>
                      </div>

                      <div className="file-info">
                        <b>{doc.titulo}</b>

                        <span>
                          {new Date(doc.creado_en).toLocaleDateString("es-EC")}
                          {" · PDF · "}
                          {doc.publicado ? "Publicado" : "Oculto"}
                        </span>
                      </div>

                      <button
                        className="icon-action"
                        onClick={() => downloadFile(doc)}
                        title="Descargar PDF"
                      >
                        <Download size={18}/>
                      </button>

                      {admin && (
                        <>
                          <button
                            className="publish-toggle"
                            onClick={() => togglePublish(doc)}
                          >
                            {doc.publicado ? "Ocultar" : "Publicar"}
                          </button>

                          <button
                            className="icon-action danger"
                            onClick={() => removeFile(doc)}
                            title="Eliminar"
                          >
                            <X size={18}/>
                          </button>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-documents">
                    <div className="empty-file">
                      <FolderOpen size={30}/>
                    </div>

                    <h3>Aún no hay documentos</h3>

                    <p>
                      Los archivos que se agreguen a este parcial aparecerán aquí.
                    </p>

                    {admin && (
                      <button
                        className="primary-cta"
                        onClick={() => inputRef.current?.click()}
                      >
                        <Plus size={17}/> Agregar primer PDF
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      )}

      <footer className="footer">
        <div className="footer-brand">
          <Calculator size={17}/> MATHSPACE
        </div>

        <span>PORTAFOLIO ACADÉMICO · MATEMÁTICAS</span>
        <span>WILMER TOALOMBO © 2026</span>
      </footer>

      {showLogin && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="login-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowLogin(false)}
            >
              <X size={18}/>
            </button>

            <div className="modal-symbol">
              <ShieldCheck size={25}/>
            </div>

            <div className="eyebrow">ZONA RESTRINGIDA</div>
            <h2>Acceso administrador</h2>

            <p>
              Ingresa con tu cuenta privada para administrar los documentos.
            </p>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Correo electrónico"
            />

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              onKeyDown={e => e.key === "Enter" && enterAdmin()}
            />

            <button
              className="primary-cta full"
              onClick={enterAdmin}
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
              <ArrowUpRight size={16}/>
            </button>

            <small>
              Acceso exclusivo del administrador del portafolio.
            </small>
          </div>
        </div>
      )}

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17}/>
          {notice}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
