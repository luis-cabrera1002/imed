import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import {
  Heart, MessageCircle, Share2, PenSquare, X,
  Stethoscope, Store, User, TrendingUp, Newspaper,
  FlaskConical, Lightbulb, Globe, Filter,
} from "lucide-react";

// ─── tipos ────────────────────────────────────────────────────────────────────
interface Profile {
  user_id: string;
  full_name: string;
  role: string;
}

interface Post {
  id: string;
  user_id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  imagen_url: string | null;
  likes_count: number;
  created_at: string;
  author?: Profile;
  liked?: boolean;
  comments_count?: number;
}

interface Comment {
  id: string;
  user_id: string;
  contenido: string;
  created_at: string;
  author?: Profile;
}

// ─── constantes ──────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { key: "todas",         label: "Todas",           icon: Filter },
  { key: "salud",         label: "Salud General",   icon: Heart },
  { key: "medicamentos",  label: "Medicamentos",    icon: Store },
  { key: "investigacion", label: "Investigación",   icon: FlaskConical },
  { key: "consejos",      label: "Consejos",        icon: Lightbulb },
  { key: "noticias",      label: "Noticias GT",     icon: Newspaper },
] as const;

const CAT_COLORS: Record<string, string> = {
  salud:         "bg-blue-100 text-blue-700",
  medicamentos:  "bg-orange-100 text-orange-700",
  investigacion: "bg-purple-100 text-purple-700",
  consejos:      "bg-green-100 text-green-700",
  noticias:      "bg-red-100 text-red-700",
  otro:          "bg-gray-100 text-gray-600",
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-rose-500",  "bg-amber-500",  "bg-cyan-500",
  "bg-indigo-500","bg-pink-500",
];

function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "ahora mismo";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `hace ${d}d`;
  return new Date(iso).toLocaleDateString("es-GT", { day: "numeric", month: "short" });
}

// ─── noticias médicas estáticas (sidebar derecho) ────────────────────────────
const NOTICIAS = [
  { titulo: "OPS reporta reducción del dengue en Centroamérica", tiempo: "2h" },
  { titulo: "Nuevo hospital en Huehuetenango abrirá en mayo 2026", tiempo: "5h" },
  { titulo: "Minsal aprueba 3 nuevos genéricos para hipertensión", tiempo: "1d" },
  { titulo: "Teleoncología llega a departamentos de Guatemala", tiempo: "2d" },
];

// ─── componente principal ─────────────────────────────────────────────────────
export default function Feed() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<string>("todas");
  const [showCompose, setShowCompose] = useState(false);

  // stats sidebar
  const [myPostsCount, setMyPostsCount]   = useState(0);
  const [myLikesCount, setMyLikesCount]   = useState(0);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }
    setUser(u);

    const { data: p } = await supabase
      .from("profiles").select("user_id, full_name, role").eq("user_id", u.id).single();
    if (p) setProfile(p as Profile);

    await loadPosts(u.id);
    setLoading(false);
  }

  async function loadPosts(uid: string) {
    const { data: postsRaw } = await supabase
      .from("feed_posts")
      .select("id, user_id, titulo, contenido, categoria, imagen_url, likes_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsRaw) return;

    // author profiles
    const uids = [...new Set(postsRaw.map((p: any) => p.user_id))];
    const { data: profilesRaw } = await supabase
      .from("profiles").select("user_id, full_name, role").in("user_id", uids);
    const profileMap: Record<string, Profile> = {};
    (profilesRaw ?? []).forEach((p: any) => { profileMap[p.user_id] = p; });

    // likes by current user
    const postIds = postsRaw.map((p: any) => p.id);
    const { data: myLikes } = await supabase
      .from("feed_likes").select("post_id").eq("user_id", uid).in("post_id", postIds);
    const likedSet = new Set((myLikes ?? []).map((l: any) => l.post_id));

    // comment counts
    const { data: commentCounts } = await supabase
      .from("feed_comments").select("post_id").in("post_id", postIds);
    const countMap: Record<string, number> = {};
    (commentCounts ?? []).forEach((c: any) => { countMap[c.post_id] = (countMap[c.post_id] ?? 0) + 1; });

    const enriched: Post[] = postsRaw.map((p: any) => ({
      ...p,
      author: profileMap[p.user_id],
      liked: likedSet.has(p.id),
      comments_count: countMap[p.id] ?? 0,
    }));

    setPosts(enriched);

    // sidebar stats
    const mine = enriched.filter(p => p.user_id === uid);
    setMyPostsCount(mine.length);
    setMyLikesCount(mine.reduce((s, p) => s + p.likes_count, 0));
  }

  async function toggleLike(post: Post) {
    if (!user) return;
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));
    await supabase.rpc("toggle_feed_like", { p_post_id: post.id, p_user_id: user.id });
  }

  function copyLink(postId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/feed#${postId}`);
  }

  const filtered = catFilter === "todas" ? posts : posts.filter(p => p.categoria === catFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-6">

          {/* ── SIDEBAR IZQUIERDO ────────────────────────────────────── */}
          <aside className="hidden lg:block space-y-4">
            {/* Perfil card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-700" />
              <div className="px-5 pb-5 -mt-8">
                <div className={`w-16 h-16 rounded-2xl ${avatarColor(profile?.full_name ?? "U")} flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white`}>
                  {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div className="mt-3">
                  <p className="font-bold text-gray-900 leading-tight">{profile?.full_name ?? "Usuario"}</p>
                  <RoleBadge role={profile?.role ?? "patient"} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-blue-50 rounded-xl p-2">
                    <p className="text-xl font-black text-blue-700">{myPostsCount}</p>
                    <p className="text-xs text-blue-500 font-medium">Publicaciones</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2">
                    <p className="text-xl font-black text-rose-600">{myLikesCount}</p>
                    <p className="text-xs text-rose-400 font-medium">Likes recibidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Categorías</p>
              <div className="space-y-1">
                {CATEGORIAS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCatFilter(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      catFilter === key
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── FEED CENTRAL ─────────────────────────────────────────── */}
          <main className="space-y-4 min-w-0">
            {/* Composer */}
            <ComposeBox
              profile={profile}
              user={user}
              onPost={() => loadPosts(user.id)}
              open={showCompose}
              setOpen={setShowCompose}
            />

            {/* Filtros mobile */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIAS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCatFilter(key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    catFilter === key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Posts */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay publicaciones en esta categoría</p>
                <p className="text-gray-400 text-sm mt-1">¡Sé el primero en publicar!</p>
              </div>
            ) : (
              filtered.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={() => toggleLike(post)}
                  onShare={() => copyLink(post.id)}
                />
              ))
            )}
          </main>

          {/* ── SIDEBAR DERECHO ──────────────────────────────────────── */}
          <aside className="hidden lg:block space-y-4">
            {/* Tendencias */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="font-bold text-gray-800 text-sm">Tendencias en iMed</p>
              </div>
              <div className="space-y-3">
                {[
                  { tag: "#SaludGuatemala",   count: "2.4k posts" },
                  { tag: "#MedicamentosIA",   count: "1.8k posts" },
                  { tag: "#Telemedicina2026", count: "1.2k posts" },
                  { tag: "#PrevenciónDengue", count: "987 posts" },
                  { tag: "#NutriciónSana",    count: "743 posts" },
                ].map(t => (
                  <div key={t.tag} className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">{t.tag}</p>
                    <p className="text-xs text-gray-400">{t.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Noticias médicas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <p className="font-bold text-gray-800 text-sm">Noticias de Salud</p>
              </div>
              <div className="space-y-4">
                {NOTICIAS.map((n, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700 font-medium leading-snug">{n.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sugerencias */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
              <p className="font-bold text-sm mb-1">Completá tu perfil</p>
              <p className="text-xs text-blue-100 mb-3">Un perfil completo genera hasta 3x más conexiones.</p>
              <button
                onClick={() => window.location.href = "/patient-dashboard"}
                className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
              >
                Ir a mi perfil
              </button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({
  post, currentUserId, onLike, onShare,
}: {
  post: Post;
  currentUserId?: string;
  onLike: () => void;
  onShare: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  async function loadComments() {
    if (commentsLoaded) { setShowComments(v => !v); return; }
    const { data } = await supabase
      .from("feed_comments")
      .select("id, user_id, contenido, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    const uids = [...new Set((data ?? []).map((c: any) => c.user_id))];
    const { data: profiles } = uids.length
      ? await supabase.from("profiles").select("user_id, full_name, role").in("user_id", uids)
      : { data: [] };
    const pm: Record<string, Profile> = {};
    (profiles ?? []).forEach((p: any) => { pm[p.user_id] = p; });

    setComments((data ?? []).map((c: any) => ({ ...c, author: pm[c.user_id] })));
    setCommentsLoaded(true);
    setShowComments(true);
  }

  async function sendComment() {
    if (!newComment.trim() || !currentUserId) return;
    setSendingComment(true);
    const txt = newComment.trim();
    setNewComment("");
    await supabase.from("feed_comments").insert({
      post_id: post.id,
      user_id: currentUserId,
      contenido: txt,
    });
    setCommentsLoaded(false);
    await loadComments();
    setSendingComment(false);
  }

  function handleLike() {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike();
  }

  const authorName = post.author?.full_name ?? "Usuario iMed";
  const authorRole = post.author?.role ?? "patient";

  return (
    <article id={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 pb-3">
        <div className={`w-11 h-11 rounded-xl ${avatarColor(authorName)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-gray-900 text-sm leading-tight">{authorName}</p>
            <RoleBadge role={authorRole} small />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
            <span className="text-gray-200">·</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[post.categoria] ?? CAT_COLORS.otro}`}>
              {CATEGORIAS.find(c => c.key === post.categoria)?.label ?? post.categoria}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-5 pb-4">
        <h2 className="font-bold text-gray-900 mb-2 leading-snug">{post.titulo}</h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{post.contenido}</p>
        {post.imagen_url && (
          <img
            src={post.imagen_url}
            alt={post.titulo}
            className="mt-3 w-full rounded-xl object-cover max-h-72"
            loading="lazy"
          />
        )}
      </div>

      {/* Acciones */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            post.liked
              ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
              : "text-gray-500 hover:bg-gray-50 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${likeAnim ? "scale-150" : "scale-100"} ${post.liked ? "fill-rose-500" : ""}`} />
          <span>{post.likes_count}</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count ?? 0}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${avatarColor(c.author?.full_name ?? "U")} flex items-center justify-center text-white text-sm font-bold`}>
                {(c.author?.full_name ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-700">{c.author?.full_name ?? "Usuario"}</p>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{c.contenido}</p>
              </div>
            </div>
          ))}

          {/* Nuevo comentario */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendComment()}
              placeholder="Escribí un comentario..."
              disabled={sendingComment}
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
            <button
              onClick={sendComment}
              disabled={!newComment.trim() || sendingComment}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── ComposeBox ────────────────────────────────────────────────────────────────
function ComposeBox({
  profile, user, onPost, open, setOpen,
}: {
  profile: Profile | null;
  user: any;
  onPost: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState("salud");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function publish() {
    if (!titulo.trim() || !contenido.trim() || !user) return;
    setPosting(true);
    await supabase.from("feed_posts").insert({
      user_id: user.id,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria,
    });
    setTitulo("");
    setContenido("");
    setCategoria("salud");
    setPosting(false);
    setOpen(false);
    onPost();
  }

  const authorName = profile?.full_name ?? "Usuario";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {!open ? (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${avatarColor(authorName)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
            className="flex-1 text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-400 transition-colors border border-gray-100"
          >
            ¿Qué querés compartir hoy?
          </button>
          <button
            onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Publicar</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${avatarColor(authorName)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
                <RoleBadge role={profile?.role ?? "patient"} small />
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Título de tu publicación"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <textarea
            ref={textareaRef}
            rows={4}
            placeholder="Compartí un artículo, consejo, experiencia o novedad médica..."
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between gap-3">
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="salud">Salud General</option>
              <option value="medicamentos">Medicamentos</option>
              <option value="investigacion">Investigación</option>
              <option value="consejos">Consejos</option>
              <option value="noticias">Noticias GT</option>
              <option value="otro">Otro</option>
            </select>

            <button
              onClick={publish}
              disabled={!titulo.trim() || !contenido.trim() || posting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
function RoleBadge({ role, small }: { role: string; small?: boolean }) {
  if (role === "doctor") {
    return (
      <span className={`inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 font-semibold rounded-full ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}>
        <Stethoscope className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />
        Médico Verificado
      </span>
    );
  }
  if (role === "pharmacy") {
    return (
      <span className={`inline-flex items-center gap-1 bg-orange-100 text-orange-700 font-semibold rounded-full ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}>
        <Store className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />
        Farmacia
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 bg-blue-50 text-blue-600 font-semibold rounded-full ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"}`}>
      <User className={small ? "w-2.5 h-2.5" : "w-3 h-3"} />
      Paciente
    </span>
  );
}
