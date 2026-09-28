'use client';

import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {Home,Users,ClipboardList,Target,CalendarDays,CheckSquare,Newspaper,BarChart3,LogOut,Plus,Search,Menu,X,Building2,UserRound,MapPin,Euro} from 'lucide-react';

type Module='inicio'|'inmuebles'|'clientes'|'pedidos'|'captacion'|'calendario'|'tareas'|'noticias'|'estadisticas';
const modules=[
{id:'inicio',label:'Inicio',icon:Home},{id:'inmuebles',label:'Inmuebles',icon:Building2},
{id:'clientes',label:'Clientes',icon:Users},{id:'pedidos',label:'Pedidos',icon:ClipboardList},
{id:'captacion',label:'Captación',icon:Target},{id:'calendario',label:'Calendario',icon:CalendarDays},
{id:'tareas',label:'Tareas',icon:CheckSquare},{id:'noticias',label:'Noticias',icon:Newspaper},
{id:'estadisticas',label:'Estadísticas',icon:BarChart3}] as const;

export default function Page(){
 const [session,setSession]=useState<any>(null),[loading,setLoading]=useState(true);
 const [module,setModule]=useState<Module>('inicio'),[menu,setMenu]=useState(false),[search,setSearch]=useState('');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');
 const [properties,setProperties]=useState<any[]>([]),[clients,setClients]=useState<any[]>([]),[events,setEvents]=useState<any[]>([]);
 const [showForm,setShowForm]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});
 const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(session)loadData()},[session]);
 async function loadData(){
  const [p,c,e]=await Promise.all([
   supabase.from('properties').select('*').order('created_at',{ascending:false}),
   supabase.from('clients').select('*').order('created_at',{ascending:false}),
   supabase.from('events').select('*').order('start_at',{ascending:true})
  ]);
  setProperties(p.data||[]);setClients(c.data||[]);setEvents(e.data||[]);
 }
 async function signIn(e:React.FormEvent){e.preventDefault();setError('');
  const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}
 async function addProperty(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);
  const {data:user}=await supabase.auth.getUser();
  const {error}=await supabase.from('properties').insert({
   owner_id:user.user?.id,title:f.get('title'),property_type:f.get('type'),city:f.get('city'),
   price:Number(f.get('price')),status:'active',visibility:f.get('visibility'),description:f.get('description')
  });
  if(error)setError(error.message);else{setShowForm(false);loadData()}
 }
 if(loading)return <div className="splash">Cargando Vive Bilbao CRM…</div>;
 if(!session)return <main className="login"><div className="login-card">
  <div className="brand"><b>VIVE</b> BILBAO <small>INMOBILIARIO</small></div><h1>Acceso al CRM</h1><p>Entra con tu usuario profesional.</p>
  <form onSubmit={signIn}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label>Contraseña<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
  {error&&<div className="error">{error}</div>}<button className="primary">Entrar</button></form>
 </div></main>;
 const filtered=properties.filter(p=>JSON.stringify(p).toLowerCase().includes(search.toLowerCase()));
 return <div className="shell">
  <aside className={menu?'sidebar open':'sidebar'}><div className="logo"><b>VIVE</b> BILBAO<small>INMOBILIARIO</small></div>
   <nav>{modules.map(m=><button className={module===m.id?'nav active':'nav'} key={m.id} onClick={()=>{setModule(m.id);setMenu(false)}}><m.icon size={18}/>{m.label}</button>)}</nav>
   <button className="nav logout" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Cerrar sesión</button>
  </aside>
  <section className="main"><header><button className="mobile" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
   <div><strong>{modules.find(m=>m.id===module)?.label}</strong><span>CRM Vive Bilbao Inmobiliario</span></div>
   <div className="header-actions"><div className="search"><Search size={16}/><input placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <button className="primary small" onClick={()=>setShowForm(true)}><Plus size={16}/> Nuevo</button></div>
  </header>
  <div className="content">
   {module==='inicio'&&<Dashboard properties={properties} clients={clients} events={events}/>}
   {module==='inmuebles'&&<><Toolbar title="Inmuebles" onNew={()=>setShowForm(true)}/><div className="grid">{filtered.map(p=><PropertyCard key={p.id} p={p}/>)}</div>{!filtered.length&&<div className="empty panel">No hay inmuebles todavía. Pulsa <b>Nuevo</b> para crear el primero.</div>}</>}
   {module==='clientes'&&<List title="Clientes" rows={clients} empty="No hay clientes todavía."/>}
   {module==='pedidos'&&<Empty title="Pedidos" text="Aquí gestionaremos las necesidades de compra y alquiler y los cruces con inmuebles."/>}
   {module==='captacion'&&<Empty title="Captación" text="Registra propietarios, valoraciones y seguimientos."/>}
   {module==='calendario'&&<List title="Calendario" rows={events} empty="No hay eventos."/>}
   {module==='tareas'&&<Empty title="Tareas" text="Organiza seguimientos y tareas de cada asesor."/>}
   {module==='noticias'&&<Empty title="Noticias" text="Publica noticias internas para el equipo."/>}
   {module==='estadisticas'&&<Stats properties={properties} clients={clients}/>}
  </div></section>
  {showForm&&<div className="modal-back"><div className="modal"><button className="close" onClick={()=>setShowForm(false)}><X/></button>
   <h2>Nuevo inmueble</h2><form onSubmit={addProperty} className="form-grid">
    <label>Título<input name="title" required placeholder="Ej. Piso en Indautxu"/></label>
    <label>Tipo<select name="type"><option>Piso</option><option>Casa</option><option>Chalet</option><option>Parcela</option><option>Local</option><option>Garaje</option></select></label>
    <label>Ciudad<input name="city" required defaultValue="Bilbao"/></label><label>Precio (€)<input name="price" type="number" required/></label>
    <label>Visibilidad<select name="visibility"><option value="shared">Compartido</option><option value="private">Privado</option></select></label>
    <label className="full">Descripción<textarea name="description"/></label><button className="primary full">Guardar inmueble</button>
   </form></div></div>}
 </div>
}

function Dashboard({properties,clients,events}:{properties:any[],clients:any[],events:any[]}){return <><div className="hero"><div><span className="eyebrow">Panel profesional</span><h1>Buenos días 👋</h1><p>Gestiona tu cartera, clientes y captación desde un solo lugar.</p></div></div>
 <div className="kpis"><Kpi icon={<Building2/>} label="Inmuebles" value={properties.length}/><Kpi icon={<Users/>} label="Clientes" value={clients.length}/><Kpi icon={<Target/>} label="Captaciones" value="0"/><Kpi icon={<CalendarDays/>} label="Eventos" value={events.length}/></div>
 <div className="two"><div className="panel"><h2>Accesos rápidos</h2><div className="quick"><span><Building2/> Inmuebles</span><span><Users/> Clientes</span><span><Target/> Captación</span><span><ClipboardList/> Pedidos</span></div></div>
 <div className="panel"><h2>CRM online</h2><p className="muted">Autenticación, base de datos y permisos se gestionan desde Supabase. El inventario puede ser compartido o privado.</p></div></div></>}
function Kpi({icon,label,value}:{icon:any,label:string,value:any}){return <div className="kpi">{icon}<div><span>{label}</span><strong>{value}</strong></div></div>}
function Toolbar({title,onNew}:{title:string,onNew:()=>void}){return <div className="toolbar"><div><h1>{title}</h1><p>Gestiona tu cartera inmobiliaria.</p></div><button className="primary" onClick={onNew}><Plus size={18}/> Nuevo inmueble</button></div>}
function PropertyCard({p}:{p:any}){return <article className="property"><div className="photo"><Building2 size={32}/><span>{p.status||'Activo'}</span></div><div className="property-body"><h3>{p.title}</h3><p><MapPin size={14}/> {p.city||'—'}</p><strong>{p.price?new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(p.price):'Consultar'}</strong><small>{p.property_type||'Inmueble'}</small></div></article>}
function List({title,rows,empty}:{title:string,rows:any[],empty:string}){return <div className="panel page-panel"><div className="panel-title"><h1>{title}</h1><button className="primary small"><Plus size={16}/> Nuevo</button></div>{rows.length?<div className="rows">{rows.map(r=><div className="row" key={r.id}><div><b>{r.name||r.title||'Registro'}</b><span>{r.email||r.phone||r.city||''}</span></div></div>)}</div>:<div className="empty">{empty}</div>}</div>}
function Empty({title,text}:{title:string,text:string}){return <div className="panel page-panel"><div className="panel-title"><h1>{title}</h1><button className="primary small"><Plus size={16}/> Nuevo</button></div><div className="empty"><Target size={34}/><h3>{title}</h3><p>{text}</p></div></div>}
function Stats({properties,clients}:{properties:any[],clients:any[]}){const avg=properties.length?Math.round(properties.reduce((a,p)=>a+(Number(p.price)||0),0)/properties.length):0;return <><div className="toolbar"><div><h1>Estadísticas</h1><p>Visión rápida de actividad.</p></div></div><div className="kpis"><Kpi icon={<Building2/>} label="Inmuebles" value={properties.length}/><Kpi icon={<Users/>} label="Clientes" value={clients.length}/><Kpi icon={<Euro/>} label="Precio medio" value={avg?avg.toLocaleString('es-ES')+' €':'—'}/></div></>}
