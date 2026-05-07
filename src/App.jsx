import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qrmbtlkjfvokkxdwoxrg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybWJ0bGtqZnZva2t4ZHdveHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzUyNTAsImV4cCI6MjA5MzY1MTI1MH0.F93wzDpSzFibcyO5PSWyPpyO50QQt570FoHQDoNFnEM";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_DOMAIN = "amidays.com";
const ADMIN_EMAILS = ["robin@amidays.com","kaja@amidays.com","elisabeth@amidays.com","jorgen@amidays.com","marops@amidays.com"];

const C = {
  bg:"#31353D", panel:"#3C4149", input:"#2A2E35",
  ash:"#4A5059", greyOlive:"#A4A599", sandrift:"#AF8E72",
  brandyRose:"#C48374", nickel:"#9DA3AB", boulder:"#707677",
  gunmetal:"#31353D", text:"#F1EFE9", textDim:"#B8BDC5",
};
const CUSTOMER_COLORS = ["#AF8E72","#C48374","#A4A599","#6A6D62","#707677","#8A7968"];
const STATUS_COLORS = { red:"#C48374", yellow:"#AF8E72", green:"#6A6D62" };
const HUNCH_FEE = 0.05;

const CHANNEL_COHORTS = {
  "Paid Search": {
    "Google Ads":    ["Søk","Display","Performance Max","Demand Gen","YouTube","Local campaign","Shopping"],
    "Microsoft Ads": ["Søk","Display","Performance Max","Shopping"],
    "Apple Search Ads": null,
    "TikTok Search Ads": null,
  },
  "Paid Social": {
    "Meta":             ["Meta Ads","Facebook","Instagram"],
    "Hunch - Meta":     null,
    "Snapchat":         null,
    "Hunch - Snapchat": null,
    "TikTok":           ["TikTok Feed","TikTok TopView","TikTok Spark Ads"],
    "LinkedIn":         null,
    "Pinterest":        null,
    "Reddit":           null,
  },
  "Programmatisk": {
    "DV360":     ["Display","Video","Native"],
    "Kobler":    null,
    "ReadPeak":  null,
    "Adnuntius": null,
    "Hawk":      null,
  },
};

const ICON_BASE = "https://qrmbtlkjfvokkxdwoxrg.supabase.co/storage/v1/object/public/icons";
const CHANNEL_ICONS = {
  "Google Ads":        `${ICON_BASE}/google-ads.jpg`,
  "Microsoft Ads":     `${ICON_BASE}/microsoft.jpg`,
  "Apple Search Ads":  `${ICON_BASE}/apple-search.jpg`,
  "TikTok Search Ads": `${ICON_BASE}/tiktok.jpg`,
  "Meta":              `${ICON_BASE}/meta.jpg`,
  "Hunch - Meta":      `${ICON_BASE}/hunch.jpg`,
  "Snapchat":          `${ICON_BASE}/snapchat.jpg`,
  "Hunch - Snapchat":  `${ICON_BASE}/hunch.jpg`,
  "TikTok":            `${ICON_BASE}/tiktok.jpg`,
  "LinkedIn":          `${ICON_BASE}/linkedin.jpg`,
  "Pinterest":         `${ICON_BASE}/pinterest.jpg`,
  "Reddit":            `${ICON_BASE}/reddit.jpg`,
  "DV360":             `${ICON_BASE}/dv360.jpg`,
  "Kobler":            `${ICON_BASE}/kobler.jpg`,
  "ReadPeak":          `${ICON_BASE}/readpeak.jpg`,
  "Adnuntius":         `${ICON_BASE}/adnuntius.jpg`,
  "Hawk":              `${ICON_BASE}/hawk.jpg`,
  "Facebook":          `${ICON_BASE}/facebook.jpg`,
  "Instagram":         `${ICON_BASE}/instagram.jpg`,
};

const getChannelIcon = key => {
  // Match on the base channel name (before · separator)
  const base = key.split(" · ")[0];
  return CHANNEL_ICONS[base] || null;
};

const isHunch = key => key.toLowerCase().includes("hunch");
const fmtNOK = v => new Intl.NumberFormat("nb-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0}).format(v||0);
const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a,b) => Math.max(0,Math.round((new Date(b)-new Date(a))/(1000*60*60*24)));
const daysLeft = end => Math.max(0,daysBetween(today(),end));
const daysTotal = (s,e) => Math.max(1,daysBetween(s,e));
const pacing = (spent,budget,start,end) => {
  const total=daysTotal(start,end), elapsed=Math.max(0,daysBetween(start,today()));
  const expected=budget*(elapsed/total);
  if(spent===0&&elapsed===0) return {label:"Pacing OK",ok:true};
  const ratio=expected>0?spent/expected:(spent>0?2:1);
  if(ratio>1.12) return {label:"Overspend",ok:false};
  if(ratio<0.88) return {label:"Underspend",ok:false};
  return {label:"Pacing OK",ok:true};
};
const uid = () => Math.random().toString(36).slice(2,8);
const monthLabel = dateStr => {
  if(!dateStr) return "";
  const d=new Date(dateStr);
  return d.toLocaleString("nb-NO",{month:"long",year:"numeric"});
};

const rowToCustomer = r => ({ id:r.id, name:r.name, industry:r.industry, contact:r.contact, logo:r.logo, logoUrl:r.logo_url||null, bank:r.bank||0 });
const rowToBrief = r => ({
  id:r.id, customerId:r.customer_id, title:r.title, description:r.description,
  start:r.start_date, end:r.end_date, assignedTo:r.assigned_to?[r.assigned_to]:[],
  channels:r.channels||{}, channelBudgets:r.channel_budgets||{},
  status:r.status, archived:r.archived, ownerId:r.owner_id,
});
const rowToCampaign = r => ({
  id:r.id, customerId:r.customer_id, title:r.title,
  start:r.start_date, end:r.end_date, budget:r.budget||0,
  status:r.status, archived:r.archived,
  channels:r.channels||{}, channelBudgets:r.channel_budgets||{},
  spent:r.spent||{}, channelDates:r.channel_dates||{},
  fromBriefId:r.from_brief_id, ownerId:r.owner_id,
});
const customerToRow = c => ({ id:c.id, name:c.name, industry:c.industry, contact:c.contact, logo:c.logo, logo_url:c.logoUrl||null, bank:c.bank||0 });
const briefToRow = b => ({
  id:b.id, customer_id:b.customerId, title:b.title, description:b.description,
  start_date:b.start, end_date:b.end, assigned_to:b.assignedTo?.[0]||null,
  channels:b.channels, channel_budgets:b.channelBudgets,
  status:b.status, archived:b.archived, owner_id:b.ownerId||null,
});
const campaignToRow = t => ({
  id:t.id, customer_id:t.customerId, title:t.title,
  start_date:t.start, end_date:t.end, budget:t.budget,
  status:t.status, archived:t.archived,
  channels:t.channels, channel_budgets:t.channelBudgets,
  spent:t.spent, channel_dates:t.channelDates||{},
  from_brief_id:t.fromBriefId||null, owner_id:t.ownerId||null,
});

// ══ Login Screen ═══════════════════════════════════════════════════
function LoginScreen({ error }) {
  const handleLogin = async () => {
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_DOMAIN },
      },
    });
  };
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",width:"100%",background:C.bg}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap');
        html,body,#root{height:100%;width:100%;margin:0;padding:0}*{box-sizing:border-box;margin:0;padding:0}
        .btn{cursor:pointer;border:none;transition:all .2s}.btn:hover{opacity:.85;transform:translateY(-1px)}.btn:active{transform:translateY(0)}
      `}</style>
      <div style={{background:C.panel,borderRadius:8,padding:"52px 48px",border:`1px solid ${C.ash}`,textAlign:"center",maxWidth:400,width:"90%"}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,color:C.text,marginBottom:8}}>AmiDesk</div>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel,letterSpacing:".08em",textTransform:"uppercase",marginBottom:40}}>Kampanjeadministrasjon</div>
        {error&&<div style={{background:`${C.brandyRose}20`,border:`1px solid ${C.brandyRose}`,borderRadius:4,padding:"10px 14px",marginBottom:20,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.brandyRose}}>{error}</div>}
        <button className="btn" onClick={handleLogin} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,width:"100%",padding:"14px",borderRadius:4,background:C.sandrift,color:"#fff",fontFamily:"Roboto,sans-serif",fontSize:13,letterSpacing:".04em"}}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
          </svg>
          Logg inn med Google
        </button>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,marginTop:16}}>Kun @amidays.com kontoer har tilgang</div>
      </div>
    </div>
  );
}

// ══ App ═══════════════════════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(undefined);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedBriefId, setSelectedBriefId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateBrief, setShowCreateBrief] = useState(false);
  const [briefToConvert, setBriefToConvert] = useState(null);

  // Auth listener
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const email = session.user.email || "";
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          sb.auth.signOut();
          setAuthError(`Kun @${ALLOWED_DOMAIN} kontoer har tilgang.`);
          setSession(null);
        } else {
          setIsAdmin(ADMIN_EMAILS.includes(email));
          setSession(session);
        }
      } else {
        setSession(null);
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const email = session.user.email || "";
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          sb.auth.signOut();
          setAuthError(`Kun @${ALLOWED_DOMAIN} kontoer har tilgang.`);
          setSession(null);
          return;
        }
        setIsAdmin(ADMIN_EMAILS.includes(email));
        setAuthError(null);
      }
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Upsert profile on login
  useEffect(() => {
    if (!session) return;
    const u = session.user;
    sb.from("profiles").upsert({
      id: u.id,
      email: u.email,
      display_name: u.user_metadata?.full_name || u.email.split("@")[0],
      avatar_url: u.user_metadata?.avatar_url || null,
    }, { onConflict: "id" });
  }, [session]);

  // Load data
  useEffect(() => {
    if (!session) return;
    async function load() {
      const userId = session.user.id;
      const [{ data: cData }, { data: bData }, { data: tData }] = await Promise.all([
        sb.from("customers").select("*"),
        sb.from("briefs").select("*").eq("owner_id", userId),
        sb.from("campaigns").select("*").eq("owner_id", userId),
      ]);
      if (cData) setCustomers(cData.map(rowToCustomer));
      if (bData) setBriefs(bData.map(rowToBrief));
      if (tData) setTasks(tData.map(rowToCampaign));
      if (ADMIN_EMAILS.includes(session.user.email)) {
        const { data: members } = await sb.from("profiles").select("*");
        if (members) setTeamMembers(members);
      }
      setLoading(false);
    }
    load();
  }, [session]);

  if (session === undefined) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,fontFamily:"'Montserrat',sans-serif",fontSize:24,color:C.textDim}}>Laster AmiDesk…</div>
  );
  if (!session) return <LoginScreen error={authError} />;

  const activeTask     = tasks.find(t=>t.id===selectedTaskId);
  const activeCustomer = customers.find(c=>c.id===selectedCustomerId);
  const activeBrief    = briefs.find(b=>b.id===selectedBriefId);

  const navigate = (p, extra={}) => {
    setPage(p);
    if (extra.customerId !== undefined) setSelectedCustomerId(extra.customerId);
    else if (p === "customers") setSelectedCustomerId(null);
    if (extra.taskId !== undefined) setSelectedTaskId(extra.taskId);
    if (extra.briefId !== undefined) setSelectedBriefId(extra.briefId);
    if (extra.viewingUserId !== undefined) setViewingUserId(extra.viewingUserId);
  };

  const adjustBank = async (customerId, delta) => {
    let updated;
    setCustomers(prev => {
      const next = prev.map(c => c.id===customerId ? {...c, bank:(c.bank||0)+delta} : c);
      updated = next.find(c=>c.id===customerId);
      return next;
    });
    if (updated) await sb.from("customers").update({bank: updated.bank}).eq("id", customerId);
  };

  const updateCustomer = async (id, changes) => {
    let updated;
    setCustomers(prev => {
      const next = prev.map(c => c.id===id ? {...c,...changes} : c);
      updated = next.find(c=>c.id===id);
      return next;
    });
    if (updated) await sb.from("customers").update(customerToRow(updated)).eq("id", id);
  };

  const updateBrief = async (id, changes) => {
    let updated;
    setBriefs(prev => {
      const next = prev.map(b => b.id===id ? {...b,...changes} : b);
      updated = next.find(b=>b.id===id);
      return next;
    });
    if (updated) await sb.from("briefs").update(briefToRow(updated)).eq("id", id);
  };

  const updateCampaign = async (id, changes) => {
    let updated;
    setTasks(prev => {
      const next = prev.map(t => t.id===id ? {...t,...changes} : t);
      updated = next.find(t=>t.id===id);
      return next;
    });
    if (updated) await sb.from("campaigns").update(campaignToRow(updated)).eq("id", id);
  };

  const deleteBrief = async (id) => {
    const linked = tasks.filter(t=>t.fromBriefId===id);
    setBriefs(prev=>prev.filter(b=>b.id!==id));
    setTasks(prev=>prev.filter(t=>t.fromBriefId!==id));
    await sb.from("briefs").delete().eq("id",id);
    for (const t of linked) await sb.from("campaigns").delete().eq("id",t.id);
  };

  const deleteCampaign = async (id) => {
    setTasks(prev=>prev.filter(t=>t.id!==id));
    await sb.from("campaigns").delete().eq("id",id);
  };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,fontFamily:"'Montserrat',sans-serif",fontSize:24,color:C.textDim}}>Laster AmiDesk…</div>
  );

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",fontFamily:"'Montserrat',sans-serif",background:C.bg,color:C.text,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap');
        html,body,#root{height:100%;width:100%;margin:0;padding:0}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.ash};border-radius:3px}
        .btn{cursor:pointer;border:none;transition:all .2s}.btn:hover{opacity:.85;transform:translateY(-1px)}.btn:active{transform:translateY(0)}
        .card{background:${C.panel};border-radius:4px;transition:box-shadow .2s}.card:hover{box-shadow:0 4px 20px rgba(0,0,0,.3)}
        .nav-item{cursor:pointer;padding:10px 18px;border-radius:3px;transition:background .15s;font-family:Roboto,sans-serif;font-size:13px;letter-spacing:.04em;color:${C.textDim}}
        .nav-item:hover{background:rgba(255,255,255,.07)}.nav-item.active{background:rgba(255,255,255,.12);color:${C.text}}
        input,select,textarea{font-family:Roboto,sans-serif;font-size:13px;background:${C.input};border:1px solid ${C.ash};border-radius:3px;padding:8px 10px;color:${C.text};outline:none;transition:border .15s}
        input:focus,select:focus,textarea:focus{border-color:${C.sandrift}}
        input::placeholder,textarea::placeholder{color:${C.nickel}}
        label{font-family:Roboto,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.nickel};display:block;margin-bottom:4px}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center}
        .modal{background:${C.input};border-radius:6px;padding:32px;width:620px;max-height:90vh;overflow-y:auto;border:1px solid ${C.ash}}
        .modal-lg{width:780px}
        .channel-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:10px;font-size:11px;font-family:Roboto,sans-serif;cursor:pointer;border:1px solid ${C.ash};background:transparent;color:${C.textDim};transition:all .15s}
        .channel-chip.selected{background:${C.sandrift};color:#fff;border-color:${C.sandrift}}
        .channel-chip:hover{border-color:${C.sandrift}}
        .pacing-ok{color:#fff;background:#3D5C35;padding:3px 8px;border-radius:10px;font-size:10px;font-family:Roboto,sans-serif}
        .pacing-bad{color:#fff;background:#6B3328;padding:3px 8px;border-radius:10px;font-size:10px;font-family:Roboto,sans-serif}
        .tab{cursor:pointer;padding:8px 16px;font-family:Roboto,sans-serif;font-size:13px;border-bottom:2px solid transparent;transition:all .15s;color:${C.nickel}}
        .tab.active{border-bottom-color:${C.sandrift};color:${C.text}}.tab:hover:not(.active){border-bottom-color:${C.ash}}
        select option{background:${C.input};color:${C.text}}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
      `}</style>

      <Sidebar page={page} navigate={navigate} setShowCreateBrief={setShowCreateBrief} session={session} isAdmin={isAdmin}/>

      <main style={{flex:1,overflow:"auto",padding:"32px 36px"}}>
        {page==="dashboard"&&<Dashboard tasks={tasks} customers={customers} briefs={briefs} updateBrief={updateBrief} deleteBrief={deleteBrief} navigate={navigate} setBriefToConvert={setBriefToConvert}/>}
        {page==="campaigns"&&<CampaignPage tasks={tasks} customers={customers} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate} adjustBank={adjustBank}/>}
        {page==="briefs"&&<BriefsPage briefs={briefs} customers={customers} navigate={navigate} setShowCreateBrief={setShowCreateBrief} setBriefToConvert={setBriefToConvert}/>}
        {page==="brief-detail"&&activeBrief&&<BriefDetail brief={activeBrief} updateBrief={updateBrief} deleteBrief={deleteBrief} customers={customers} navigate={navigate} setBriefToConvert={setBriefToConvert}/>}
        {page==="customers"&&!selectedCustomerId&&<CustomerList customers={customers} tasks={tasks} briefs={briefs} navigate={navigate} setShowCreateCustomer={isAdmin?()=>setShowCreateCustomer(true):null}/>}
        {(page==="customers"&&selectedCustomerId&&activeCustomer)||(page==="customer-detail"&&activeCustomer)
          ?<CustomerDetail customer={activeCustomer} tasks={tasks} briefs={briefs} updateCampaign={updateCampaign} updateCustomer={isAdmin?updateCustomer:null} navigate={navigate}/>:null}
        {page==="task-detail"&&activeTask&&<TaskDetail task={activeTask} customers={customers} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate}/>}
        {page==="team"&&isAdmin&&<TeamPage teamMembers={teamMembers} navigate={navigate}/>}
        {page==="team-member"&&isAdmin&&<TeamMemberPage userId={viewingUserId} teamMembers={teamMembers} customers={customers} navigate={navigate}/>}
      </main>

      {showCreateBrief&&<CreateBriefModal customers={customers} onClose={()=>setShowCreateBrief(false)}
        onSave={async b=>{
          const withOwner = {...b, ownerId: session.user.id};
          setBriefs(p=>[...p,withOwner]);
          await sb.from("briefs").upsert(briefToRow(withOwner));
          setShowCreateBrief(false);
        }}/>}
      {showCreateCustomer&&isAdmin&&<CreateCustomerModal onClose={()=>setShowCreateCustomer(false)}
        onSave={async c=>{setCustomers(p=>[...p,c]);await sb.from("customers").upsert(customerToRow(c));setShowCreateCustomer(false);}}/>}
      {briefToConvert&&<ConvertBriefModal brief={briefToConvert} customers={customers}
        onClose={()=>setBriefToConvert(null)}
        onSave={async (campaign,briefId)=>{
          const withOwner = {...campaign, ownerId: session.user.id};
          const cust = customers.find(c=>c.id===campaign.customerId);
          if (cust) await adjustBank(campaign.customerId, -campaign.budget);
          setTasks(p=>[...p,withOwner]);
          await sb.from("campaigns").upsert(campaignToRow(withOwner));
          await updateBrief(briefId,{status:"startet"});
          setBriefToConvert(null);
        }}/>}
    </div>
  );
}

// ══ Sidebar ════════════════════════════════════════════════════════
function Sidebar({page, navigate, setShowCreateBrief, session, isAdmin}) {
  const user = session?.user;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Bruker";
  const avatar = user?.user_metadata?.avatar_url;
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const navItems = [
    {id:"dashboard",label:"Dashboard"},
    {id:"campaigns",label:"Kampanjelinjer"},
    {id:"briefs",label:"Oppgaver"},
    {id:"customers",label:"Kunder"},
    ...(isAdmin?[{id:"team",label:"Team"}]:[]),
  ];
  return (
    <aside style={{width:220,background:"#272B32",display:"flex",flexDirection:"column",padding:"28px 16px",borderRight:`1px solid ${C.ash}`,gap:4,flexShrink:0}}>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:600,color:C.text,padding:"0 8px 28px"}}>AmiDesk</div>
      {navItems.map(item=>(
        <div key={item.id}
          className={`nav-item${page===item.id||page===item.id+"-detail"||page==="team-member"&&item.id==="team"?" active":""}`}
          onClick={()=>navigate(item.id)}>{item.label}</div>
      ))}
      <div style={{flex:1}}/>
      <button className="btn" onClick={()=>setShowCreateBrief(true)}
        style={{background:C.sandrift,color:"#fff",padding:"11px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,letterSpacing:".06em",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16}}>
        <span style={{fontSize:16,lineHeight:1}}>+</span> Ny oppgave
      </button>
      <div style={{borderTop:`1px solid ${C.ash}`,paddingTop:14,display:"flex",alignItems:"center",gap:10}}>
        {avatar
          ?<img src={avatar} alt={name} style={{width:30,height:30,borderRadius:"50%",flexShrink:0}}/>
          :<div style={{width:30,height:30,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:11,fontWeight:500,flexShrink:0}}>{initials}</div>
        }
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
          {isAdmin&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.sandrift,letterSpacing:".04em"}}>Admin</div>}
          <button className="btn" onClick={()=>sb.auth.signOut()}
            style={{background:"none",color:C.nickel,fontFamily:"Roboto,sans-serif",fontSize:10,padding:0,letterSpacing:".04em",marginTop:2}}>
            Logg ut
          </button>
        </div>
      </div>
    </aside>
  );
}

// ══ Team Page (admin only) ═════════════════════════════════════════
function TeamPage({teamMembers, navigate}) {
  return (
    <div>
      <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500,marginBottom:28}}>Team</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {teamMembers.map(member=>{
          const initials=(member.display_name||member.email).split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
          const adminMember=ADMIN_EMAILS.includes(member.email);
          return (
            <div key={member.id} className="card" style={{padding:"24px",cursor:"pointer"}} onClick={()=>navigate("team-member",{viewingUserId:member.id})}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                {member.avatar_url
                  ?<img src={member.avatar_url} alt={member.display_name} style={{width:44,height:44,borderRadius:"50%"}}/>
                  :<div style={{width:44,height:44,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:14,fontWeight:500}}>{initials}</div>
                }
                <div>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:500}}>{member.display_name||member.email.split("@")[0]}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{member.email}</div>
                </div>
              </div>
              {adminMember&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.sandrift,background:`${C.sandrift}20`,padding:"2px 8px",borderRadius:8,letterSpacing:".04em"}}>Admin</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ Team Member Detail (admin only) ════════════════════════════════
function TeamMemberPage({userId, teamMembers, customers, navigate}) {
  const [memberBriefs, setMemberBriefs] = useState([]);
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const member = teamMembers.find(m=>m.id===userId);

  useEffect(()=>{
    if(!userId) return;
    async function load() {
      const [{ data: bData },{ data: tData }] = await Promise.all([
        sb.from("briefs").select("*").eq("owner_id",userId),
        sb.from("campaigns").select("*").eq("owner_id",userId),
      ]);
      if(bData) setMemberBriefs(bData.map(rowToBrief));
      if(tData) setMemberTasks(tData.map(rowToCampaign));
      setLoading(false);
    }
    load();
  },[userId]);

  if(!member) return null;
  const initials=(member.display_name||member.email).split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const activeBriefs=memberBriefs.filter(b=>!b.archived&&b.status!=="avsluttet");
  const activeTasks=memberTasks.filter(t=>!t.archived);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <button className="btn" onClick={()=>navigate("team")} style={{background:C.ash,color:C.text,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        {member.avatar_url
          ?<img src={member.avatar_url} style={{width:44,height:44,borderRadius:"50%"}}/>
          :<div style={{width:44,height:44,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:14,fontWeight:500}}>{initials}</div>
        }
        <div>
          <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:30,fontWeight:500}}>{member.display_name||member.email.split("@")[0]}</h1>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel}}>{member.email}</div>
        </div>
      </div>
      {loading?<div style={{fontFamily:"Roboto,sans-serif",color:C.nickel}}>Laster…</div>:(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:10}}>Oppgaver ({activeBriefs.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {activeBriefs.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel}}>Ingen aktive oppgaver.</div>}
              {activeBriefs.map(b=>{
                const cust=customers.find(c=>c.id===b.customerId);
                return (
                  <div key={b.id} className="card" style={{padding:"12px 16px",borderLeft:`3px solid ${C.sandrift}`}}>
                    <div style={{fontWeight:500,fontSize:14}}>{b.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{cust?.name} · {b.start} → {b.end}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:10}}>Kampanjelinjer ({activeTasks.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {activeTasks.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel}}>Ingen aktive kampanjer.</div>}
              {activeTasks.map(t=>{
                const cust=customers.find(c=>c.id===t.customerId);
                const totalSpent=Object.values(t.spent||{}).reduce((a,b)=>a+b,0);
                return (
                  <div key={t.id} className="card" style={{padding:"12px 16px"}}>
                    <div style={{fontWeight:500,fontSize:14}}>{t.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,marginBottom:4}}>{cust?.name} · {t.start} → {t.end}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.textDim}}>{fmtNOK(totalSpent)} / {fmtNOK(t.budget)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══ CustomerAvatar ════════════════════════════════════════════════
function CustomerAvatar({customer, size=44, fontSize=14}) {
  if(customer?.logoUrl) return <img src={customer.logoUrl} alt={customer.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize,fontWeight:500,flexShrink:0}}>{customer?.logo||"?"}</div>;
}

// ══ EditCustomerModal (admin only) ════════════════════════════════
function EditCustomerModal({customer, onClose, onSave}) {
  const [form,setForm]=useState({name:customer.name||"",industry:customer.industry||"",contact:customer.contact||"",logo:customer.logo||""});
  const [uploading,setUploading]=useState(false);
  const [previewUrl,setPreviewUrl]=useState(customer.logoUrl||null);

  const handleFile = async e => {
    const file = e.target.files[0];
    if(!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${customer.id}.${ext}`;
    const { error } = await sb.storage.from("logos").upload(path, file, {upsert:true});
    if(error) { alert("Feil ved opplasting: "+error.message); setUploading(false); return; }
    const { data } = sb.storage.from("logos").getPublicUrl(path);
    setPreviewUrl(data.publicUrl+"?t="+Date.now());
    setUploading(false);
    onSave({...form, logoUrl: data.publicUrl});
  };

  const save = () => onSave({...form, logoUrl: previewUrl});

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500}}>Rediger kunde</h2>
          <button className="btn" onClick={onClose} style={{background:"none",fontSize:20,color:C.nickel}}>✕</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,padding:"14px",background:C.bg,borderRadius:4,border:`1px solid ${C.ash}`}}>
          {previewUrl
            ?<img src={previewUrl} alt="logo" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover"}}/>
            :<div style={{width:56,height:56,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:18,fontWeight:500}}>{form.logo||form.name.slice(0,2).toUpperCase()}</div>
          }
          <div>
            <label style={{marginBottom:6}}>Logo</label>
            <label className="btn" style={{display:"inline-block",background:C.ash,color:C.text,padding:"6px 14px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12,cursor:"pointer"}}>
              {uploading?"Laster opp…":"Last opp bilde"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} disabled={uploading}/>
            </label>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.nickel,marginTop:4}}>JPG, PNG, WebP · maks 1MB</div>
          </div>
        </div>
        {[{key:"name",label:"Kundenavn"},{key:"industry",label:"Bransje"},{key:"contact",label:"Nettside"},{key:"logo",label:"Initialer (fallback)"}].map(f=>(
          <div key={f.key} style={{marginBottom:14}}><label>{f.label}</label>
            <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{width:"100%"}}/>
          </div>
        ))}
        <button className="btn" onClick={save} style={{background:C.sandrift,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%",marginTop:6}}>Lagre endringer</button>
      </div>
    </div>
  );
}

// ══ Dashboard ══════════════════════════════════════════════════════
function Dashboard({tasks, customers, briefs, updateBrief, deleteBrief, navigate, setBriefToConvert}) {
  const activeBriefs=briefs.filter(b=>!b.archived&&b.status!=="avsluttet");
  const activeTasks=tasks.filter(t=>!t.archived);
  const pendingCampaign=activeBriefs.filter(b=>!activeTasks.some(t=>t.fromBriefId===b.id));
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500}}>Dashboard</h1>
        {pendingCampaign.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:8,background:`${C.sandrift}20`,border:`1px solid ${C.sandrift}`,borderRadius:6,padding:"8px 14px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.sandrift}}/>
            <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.sandrift}}>{pendingCampaign.length} oppgave{pendingCampaign.length!==1?"r":""} venter på kampanje</span>
          </div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
        {[{label:"Aktive oppgaver",value:activeBriefs.length},{label:"Kunder",value:customers.length},{label:"Aktive kampanjer",value:activeTasks.length}].map(card=>(
          <div key={card.label} className="card" style={{padding:"20px 24px"}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".08em",textTransform:"uppercase",color:C.nickel,marginBottom:6}}>{card.label}</div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:28,fontWeight:500}}>{card.value}</div>
          </div>
        ))}
      </div>
      {activeBriefs.length>0?(
        <div>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:500,marginBottom:14}}>Oppgaver</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {activeBriefs.map(brief=>{
              const cust=customers.find(c=>c.id===brief.customerId);
              const isStarted=brief.status==="startet";
              const hasCampaign=activeTasks.some(t=>t.fromBriefId===brief.id);
              return (
                <div key={brief.id} className="card"
                  style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",borderLeft:`4px solid ${isStarted?C.greyOlive:C.sandrift}`}}
                  onClick={()=>navigate("brief-detail",{briefId:brief.id})}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,flexShrink:0}}>{cust?.logo||"?"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500,fontSize:14,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{brief.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,display:"flex",gap:10,flexWrap:"wrap"}}>
                      <span>{cust?.name}</span>
                      {brief.start&&brief.end&&<span>· {brief.start} → {brief.end}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                    <button className="btn" onClick={e=>{e.stopPropagation();updateBrief(brief.id,{status:isStarted?"ny":"startet"});}}
                      style={{padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11,background:isStarted?C.greyOlive:C.ash,color:C.text,border:"none"}}>
                      {isStarted?"● Startet":"Sett i gang"}
                    </button>
                    {!hasCampaign&&(
                      <button className="btn" onClick={e=>{e.stopPropagation();setBriefToConvert(brief);}}
                        style={{padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11,background:C.sandrift,color:"#fff",border:"none"}}>
                        Lag kampanje
                      </button>
                    )}
                    {hasCampaign&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.greyOlive,padding:"5px 10px",background:`${C.greyOlive}18`,borderRadius:3}}>✓ Kampanje opprettet</span>}
                    <button className="btn" onClick={e=>{e.stopPropagation();if(confirm("Slett oppgaven permanent?\nTilknyttede kampanjelinjer slettes også."))deleteBrief(brief.id);}}
                      style={{background:"none",color:C.nickel,fontSize:14,padding:"4px 6px"}}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ):(
        <div style={{fontFamily:"Roboto,sans-serif",color:C.nickel,padding:"60px 0",textAlign:"center",fontSize:14}}>Ingen aktive oppgaver. Opprett en oppgave for å komme i gang.</div>
      )}
    </div>
  );
}

function StatusDot({status, onChange}) {
  const [open,setOpen]=useState(false);
  const col=STATUS_COLORS[status]||C.greyOlive;
  return (
    <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
      <div style={{width:14,height:14,borderRadius:"50%",background:col,cursor:"pointer",border:"2px solid rgba(0,0,0,.2)"}} onClick={()=>setOpen(!open)}/>
      {open&&(
        <div style={{position:"absolute",right:0,top:20,background:C.input,border:`1px solid ${C.ash}`,borderRadius:4,padding:6,display:"flex",flexDirection:"column",gap:4,zIndex:10,boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>
          {Object.entries(STATUS_COLORS).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 6px",borderRadius:3}} onClick={()=>{onChange(k);setOpen(false);}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:v}}/>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,whiteSpace:"nowrap",color:C.text}}>{k==="green"?"Aktiv":k==="yellow"?"Pågående":"Kritisk"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══ Briefs Page ════════════════════════════════════════════════════
function BriefsPage({briefs, customers, navigate, setShowCreateBrief, setBriefToConvert}) {
  const active=briefs.filter(b=>!b.archived&&b.status!=="avsluttet");
  const archived=briefs.filter(b=>b.archived||b.status==="avsluttet");
  const [tab,setTab]=useState("active");
  const shown=tab==="active"?active:archived;
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500}}>Oppgaver</h1>
        <button className="btn" onClick={()=>setShowCreateBrief(true)} style={{background:C.gunmetal,color:C.text,padding:"10px 18px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,border:`1px solid ${C.ash}`}}>+ Ny oppgave</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.ash}`,marginBottom:20}}>
        {["active","archived"].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="active"?"Aktive":"Avsluttede"} ({t==="active"?active.length:archived.length})
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {shown.map(brief=>{
          const cust=customers.find(c=>c.id===brief.customerId);
          const isStarted=brief.status==="startet";
          const totalBudget=Object.values(brief.channelBudgets||{}).reduce((a,b)=>a+b,0);
          return (
            <div key={brief.id} className="card"
              style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",borderLeft:`4px solid ${brief.status==="avsluttet"?C.ash:isStarted?C.greyOlive:C.sandrift}`}}
              onClick={()=>navigate("brief-detail",{briefId:brief.id})}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.ash,color:C.text,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,flexShrink:0}}>{cust?.logo||"?"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:500,fontSize:15,marginBottom:3}}>{brief.title}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span>{cust?.name}</span>
                  {brief.start&&brief.end&&<span>{brief.start} → {brief.end}</span>}
                  {totalBudget>0&&<span>Budsjett: {fmtNOK(totalBudget)}</span>}
                </div>
              </div>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,padding:"3px 10px",borderRadius:8,background:C.ash,color:C.text,flexShrink:0}}>
                {brief.status==="startet"?"Startet":brief.status==="avsluttet"?"Avsluttet":"Ny"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ Brief Detail ═══════════════════════════════════════════════════
function BriefDetail({brief, updateBrief, deleteBrief, customers, navigate, setBriefToConvert}) {
  const cust=customers.find(c=>c.id===brief.customerId);
  const isStarted=brief.status==="startet";
  const totalBudget=Object.values(brief.channelBudgets||{}).reduce((a,b)=>a+b,0);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <button className="btn" onClick={()=>navigate("briefs")} style={{background:C.ash,color:C.text,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:30,fontWeight:500,flex:1}}>{brief.title}</h1>
        <button className="btn" onClick={()=>setBriefToConvert(brief)} style={{background:C.sandrift,color:"#fff",padding:"9px 18px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12}}>Lag kampanje →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:24}}>
        <div>
          {brief.description&&(
            <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:10}}>Brief</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",color:C.textDim}}>{brief.description}</div>
            </div>
          )}
          {Object.keys(brief.channelBudgets||{}).length>0&&(
            <div className="card" style={{padding:"20px 24px"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:12}}>Kanalbudsjett</div>
              {Object.entries(brief.channelBudgets).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.ash}`,fontFamily:"Roboto,sans-serif",fontSize:12}}>
                  <span style={{color:C.textDim}}>{k}{isHunch(k)&&<span style={{color:C.brandyRose,fontSize:10,marginLeft:6}}>-5% Hunch fee</span>}</span>
                  <span style={{fontWeight:500}}>{fmtNOK(v)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:600}}>
                <span>Totalt</span><span>{fmtNOK(totalBudget)}</span>
              </div>
            </div>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="card" style={{padding:"16px 18px"}}>
            {[{label:"Kunde",value:cust?.name||"—"},{label:"Periode",value:brief.start&&brief.end?`${brief.start} → ${brief.end}`:"Ikke satt"},{label:"Status",value:brief.status==="startet"?"Startet":brief.status==="avsluttet"?"Avsluttet":"Ny"}].map(row=>(
              <div key={row.label} style={{marginBottom:12}}>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:2}}>{row.label}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:13}}>{row.value}</div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={()=>updateBrief(brief.id,{status:isStarted?"ny":"startet"})}
            style={{padding:"10px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:isStarted?C.greyOlive:C.ash,color:C.text,border:"none"}}>
            {isStarted?"● Startet — klikk for å reversere":"Sett i gang"}
          </button>
          <button className="btn" onClick={()=>{if(confirm("Avslutt og arkiver oppgaven?"))updateBrief(brief.id,{status:"avsluttet",archived:true});}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:C.ash,color:C.nickel,border:"none"}}>Avslutt oppgave</button>
          <button className="btn" onClick={()=>{if(confirm("Slett oppgaven permanent?\nTilknyttede kampanjelinjer slettes også.")){deleteBrief(brief.id);navigate("briefs");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:"none",color:C.brandyRose,border:`1px solid ${C.brandyRose}60`}}>Slett oppgave permanent</button>
        </div>
      </div>
    </div>
  );
}

// ══ Campaign Page ══════════════════════════════════════════════════
function CampaignPage({tasks, customers, updateCampaign, deleteCampaign, navigate, adjustBank}) {
  const active=tasks.filter(t=>!t.archived);
  const grouped=customers.map(c=>({customer:c,tasks:active.filter(t=>t.customerId===c.id)})).filter(g=>g.tasks.length>0);
  return (
    <div>
      <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500,marginBottom:28}}>Kampanjelinjer</h1>
      {grouped.length===0&&<div style={{fontFamily:"Roboto,sans-serif",color:C.nickel,padding:"60px 0",textAlign:"center"}}>Ingen aktive kampanjelinjer.</div>}
      {grouped.map(({customer,tasks:custTasks},groupIdx)=>{
        const accent=CUSTOMER_COLORS[groupIdx%CUSTOMER_COLORS.length];
        return (
          <div key={customer.id} style={{marginBottom:4,background:C.panel,borderRadius:6,border:`1px solid ${C.ash}`,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",background:accent,borderBottom:`2px solid rgba(0,0,0,.2)`}}>
              <CustomerAvatar customer={customer} size={28} fontSize={11}/>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:19,fontWeight:600,cursor:"pointer",color:"#fff"}} onClick={()=>navigate("customer-detail",{customerId:customer.id})}>{customer.name}</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:"rgba(255,255,255,.8)",background:"rgba(0,0,0,.2)",padding:"2px 9px",borderRadius:10,flexShrink:0}}>{custTasks.length} kampanje{custTasks.length!==1?"r":""}</div>
            </div>
            {custTasks.map((task,taskIdx)=>(
              <TaskBlock key={task.id} task={task} taskIdx={taskIdx} custTasks={custTasks} accent={accent} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate} adjustBank={adjustBank}/>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function TaskBlock({task, taskIdx, custTasks, accent, updateCampaign, deleteCampaign, navigate, adjustBank}) {
  const [editingMeta,setEditingMeta]=useState(false);
  const [meta,setMeta]=useState({start:task.start,end:task.end,budget:task.budget});
  const [showEndConfirm,setShowEndConfirm]=useState(false);
  const isEnded=task.end&&task.end<=today();

  const saveMeta=()=>{
    if(!meta.end) return;
    updateCampaign(task.id,{start:meta.start,end:meta.end,budget:+meta.budget||task.budget});
    setEditingMeta(false);
  };

  const handleEndCampaign=async ()=>{
    const totalSpent=Object.values(task.spent||{}).reduce((a,b)=>a+b,0);
    const diff=task.budget-totalSpent; // positive = rest tilbake, negative = merforbruk
    if(adjustBank) await adjustBank(task.customerId, diff);
    await updateCampaign(task.id,{end:today(),archived:true});
    setShowEndConfirm(false);
  };

  const handleEndChannel=(line)=>{
    const lineDiff = line.budget - line.spent;
    if(confirm(`Avslutt "${line.label}"?\nRestbudsjett ${fmtNOK(lineDiff)} ${lineDiff>=0?"returneres til bank":"trekkes fra bank"}.`)){
      if(adjustBank) adjustBank(task.customerId, lineDiff);
      const nd={...(task.channelDates||{}),[line.flatKey]:{start:line.chStart,end:today()}};
      updateCampaign(task.id,{channelDates:nd});
    }
  };

  const lines=getChannelLines(task);
  const grouped=groupLinesByChannel(lines);

  return (
    <div>
      {/* Campaign header */}
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",padding:"10px 20px",borderBottom:`1px solid ${C.ash}`,borderLeft:`3px solid ${accent}`}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",color:C.text}} onClick={()=>navigate("task-detail",{taskId:task.id})}>{task.title}</div>
        {editingMeta?(
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <input type="date" value={meta.start} onChange={e=>setMeta(f=>({...f,start:e.target.value}))} style={{width:132,padding:"3px 7px",fontSize:11}}/>
            <span style={{color:C.nickel,fontSize:11}}>→</span>
            <input type="date" value={meta.end} onChange={e=>setMeta(f=>({...f,end:e.target.value}))} style={{width:132,padding:"3px 7px",fontSize:11}}/>
            <input type="number" value={meta.budget} onChange={e=>setMeta(f=>({...f,budget:e.target.value}))} style={{width:110,padding:"3px 7px",fontSize:11,textAlign:"right"}}/>
            <span style={{color:C.nickel,fontSize:11}}>NOK</span>
            <button className="btn" onClick={saveMeta} style={{background:C.sandrift,color:"#fff",padding:"3px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Lagre</button>
            <button className="btn" onClick={()=>setEditingMeta(false)} style={{background:C.ash,color:C.text,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>✕</button>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{task.start} → {task.end}</span>
            <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>· {fmtNOK(task.budget)}</span>
            <button className="btn" onClick={()=>{setMeta({start:task.start,end:task.end,budget:task.budget});setEditingMeta(true);}} style={{background:"none",border:`1px solid ${C.ash}`,color:C.nickel,padding:"2px 9px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Rediger</button>
            {isEnded&&!showEndConfirm&&(
              <button className="btn" onClick={()=>setShowEndConfirm(true)} style={{background:`${C.brandyRose}20`,border:`1px solid ${C.brandyRose}`,color:C.brandyRose,padding:"2px 9px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Avslutt kampanje</button>
            )}
            {showEndConfirm&&(
              <div style={{display:"flex",alignItems:"center",gap:6,background:C.input,padding:"4px 10px",borderRadius:4,border:`1px solid ${C.brandyRose}`}}>
                <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.brandyRose}}>
                  Gjøre opp bank og arkivere?
                </span>
                <button className="btn" onClick={handleEndCampaign} style={{background:C.brandyRose,color:"#fff",padding:"3px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Ja, avslutt</button>
                <button className="btn" onClick={()=>setShowEndConfirm(false)} style={{background:C.ash,color:C.text,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Avbryt</button>
              </div>
            )}
            <button className="btn" onClick={()=>{if(confirm(`Slett kampanjen "${task.title}" permanent?`))deleteCampaign(task.id);}} style={{background:"none",border:`1px solid ${C.brandyRose}40`,color:C.brandyRose,padding:"2px 9px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Slett</button>
          </div>
        )}
      </div>

      {/* Grouped channel lines */}
      <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:12}}>
        {Object.entries(grouped).map(([channelName, channelLines])=>{
          const icon=getChannelIcon(channelName);
          return (
            <div key={channelName}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                {icon&&<img src={icon} alt="" style={{width:14,height:14,borderRadius:2,objectFit:"contain",background:"#fff",padding:1}}/>}
                <span style={{fontFamily:"Roboto,sans-serif",fontSize:10,fontWeight:500,letterSpacing:".06em",textTransform:"uppercase",color:C.nickel}}>{channelName}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {channelLines.map(line=>(
                  <CampaignLineRow key={line.flatKey} line={line} task={task} updateCampaign={updateCampaign} onEndChannel={handleEndChannel}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {taskIdx<custTasks.length-1&&<div style={{height:1,background:C.ash,margin:"0 16px"}}/>}
    </div>
  );
}

function getChannelLines(task) {
  // Use channelBudgets as source of truth — these have the actual named lines
  const budgets = task.channelBudgets || {};
  if (Object.keys(budgets).length === 0) {
    // Fallback: derive from channels structure
    return Object.entries(task.channels||{}).flatMap(([ch,subs])=>{
      const items=(subs&&subs.length>0)?subs:[null];
      return items.map(sub=>{
        const flatKey=sub?`${ch} · ${sub}`:ch;
        const budget=0;
        const spent=task.spent?.[flatKey]??0;
        const chEnd=(task.channelDates?.[flatKey]?.end)||task.end;
        const chStart=(task.channelDates?.[flatKey]?.start)||task.start;
        const dl=daysLeft(chEnd);
        const dayBudget=dl>0?Math.round((budget-spent)/dl):0;
        const p=pacing(spent,budget,chStart,chEnd);
        const hunch=isHunch(flatKey);
        const netBudget=hunch?Math.round(budget*(1-HUNCH_FEE)):budget;
        return{flatKey,label:flatKey,budget,netBudget,spent,dayBudget,dl,p,hunch,chStart,chEnd,baseChannel:ch};
      });
    });
  }
  return Object.entries(budgets).map(([flatKey, budget])=>{
    // baseChannel is everything before " — "
    const baseChannel = flatKey.split(" — ")[0].split(" · ")[0];
    const spent=task.spent?.[flatKey]??0;
    const chEnd=(task.channelDates?.[flatKey]?.end)||task.end;
    const chStart=(task.channelDates?.[flatKey]?.start)||task.start;
    const dl=daysLeft(chEnd);
    const dayBudget=dl>0?Math.round((budget-spent)/dl):0;
    const p=pacing(spent,budget,chStart,chEnd);
    const hunch=isHunch(flatKey);
    const netBudget=hunch?Math.round(budget*(1-HUNCH_FEE)):budget;
    return{flatKey,label:flatKey,budget,netBudget,spent,dayBudget,dl,p,hunch,chStart,chEnd,baseChannel};
  });
}

// Group lines by base channel for display
function groupLinesByChannel(lines) {
  const groups = {};
  lines.forEach(line => {
    const ch = line.baseChannel || line.flatKey;
    if (!groups[ch]) groups[ch] = [];
    groups[ch].push(line);
  });
  return groups;
}

function CampaignLineRow({line, task, updateCampaign, onEndChannel}) {
  const [mode,setMode]=useState(null);
  const [spentVal,setSpentVal]=useState(line.spent);
  const [budgetVal,setBudgetVal]=useState(line.budget);
  const [dateVal,setDateVal]=useState({start:line.chStart,end:line.chEnd});
  const pct=line.budget>0?Math.min(100,Math.round((line.spent/line.budget)*100)):0;
  const isEnded=line.chEnd&&line.chEnd<=today();

  const saveSpent=()=>{updateCampaign(task.id,{spent:{...task.spent,[line.flatKey]:spentVal}});setMode(null);};
  const saveBudget=()=>{updateCampaign(task.id,{channelBudgets:{...task.channelBudgets,[line.flatKey]:budgetVal}});setMode(null);};
  const saveDate=()=>{
    const nd={...(task.channelDates||{}),[line.flatKey]:{start:dateVal.start,end:dateVal.end}};
    updateCampaign(task.id,{channelDates:nd});setMode(null);
  };

  const lineName = line.label.includes(" — ") ? line.label.split(" — ").slice(1).join(" — ") : line.label;

  return (
    <div style={{borderRadius:3,border:`1px solid ${C.ash}`,background:"rgba(255,255,255,.02)",overflow:"hidden"}}>
      {/* Main row */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",flexWrap:"wrap"}}>
        <div style={{minWidth:160,flex:1}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.text}}>{lineName}</div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.nickel}}>{line.chStart} → {line.chEnd}</div>
          {line.hunch&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.brandyRose}}>Hunch fee −5% = {fmtNOK(line.netBudget)}</div>}
        </div>

        {/* Progress bar + amounts */}
        <div style={{flex:2,minWidth:140}}>
          <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:10,color:C.nickel,marginBottom:3}}>
            <span>{fmtNOK(line.spent)}</span>
            <span>{fmtNOK(line.hunch?line.netBudget:line.budget)}</span>
          </div>
          <div style={{height:2,background:C.ash,borderRadius:1,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:C.brandyRose,borderRadius:1,transition:"width .4s"}}/>
          </div>
        </div>

        {/* NOK/dag + dager */}
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,textAlign:"right",minWidth:80,flexShrink:0}}>
          <div style={{fontWeight:500,color:C.text,fontSize:12}}>{fmtNOK(line.dayBudget)}/dag</div>
          <div style={{fontSize:10}}>{line.dl}d igjen</div>
        </div>

        <span className={line.p.ok?"pacing-ok":"pacing-bad"} style={{fontSize:9,padding:"2px 6px"}}>{line.p.label}</span>

        {/* Action buttons */}
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          <button className="btn" onClick={()=>setMode(mode==="spent"?null:"spent")}
            style={{background:mode==="spent"?C.sandrift:"none",border:`1px solid ${mode==="spent"?C.sandrift:C.ash}`,color:mode==="spent"?"#fff":C.nickel,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Forbruk</button>
          <button className="btn" onClick={()=>setMode(mode==="budget"?null:"budget")}
            style={{background:mode==="budget"?C.sandrift:"none",border:`1px solid ${mode==="budget"?C.sandrift:C.ash}`,color:mode==="budget"?"#fff":C.nickel,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Budsjett</button>
          <button className="btn" onClick={()=>setMode(mode==="date"?null:"date")}
            style={{background:mode==="date"?C.sandrift:"none",border:`1px solid ${mode==="date"?C.sandrift:C.ash}`,color:mode==="date"?"#fff":C.nickel,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Dato</button>
          {isEnded&&<button className="btn" onClick={()=>onEndChannel&&onEndChannel(line)}
            style={{background:`${C.greyOlive}25`,border:`1px solid ${C.greyOlive}`,color:C.greyOlive,padding:"3px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>Avslutt</button>}
        </div>
      </div>

      {/* Inline edit panels */}
      {mode==="spent"&&(
        <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:C.input,borderTop:`1px solid ${C.ash}`}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,flexShrink:0}}>Oppdater forbruk:</span>
          <input type="number" value={spentVal} onChange={e=>setSpentVal(+e.target.value)} style={{flex:1,maxWidth:160}} placeholder="NOK"/>
          <button className="btn" onClick={saveSpent} style={{background:C.sandrift,color:"#fff",padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Lagre</button>
          <button className="btn" onClick={()=>setMode(null)} style={{background:C.ash,color:C.text,padding:"5px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>✕</button>
        </div>
      )}
      {mode==="budget"&&(
        <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:C.input,borderTop:`1px solid ${C.ash}`}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,flexShrink:0}}>Oppdater budsjett:</span>
          <input type="number" value={budgetVal} onChange={e=>setBudgetVal(+e.target.value)} style={{flex:1,maxWidth:160}} placeholder="NOK"/>
          <button className="btn" onClick={saveBudget} style={{background:C.sandrift,color:"#fff",padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Lagre</button>
          <button className="btn" onClick={()=>setMode(null)} style={{background:C.ash,color:C.text,padding:"5px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>✕</button>
        </div>
      )}
      {mode==="date"&&(
        <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:C.input,borderTop:`1px solid ${C.ash}`,flexWrap:"wrap"}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,flexShrink:0}}>Datoer:</span>
          <input type="date" value={dateVal.start} onChange={e=>setDateVal(f=>({...f,start:e.target.value}))} style={{width:140,padding:"4px 8px",fontSize:11}}/>
          <span style={{color:C.nickel,fontSize:11}}>→</span>
          <input type="date" value={dateVal.end} onChange={e=>setDateVal(f=>({...f,end:e.target.value}))} style={{width:140,padding:"4px 8px",fontSize:11}}/>
          <button className="btn" onClick={saveDate} style={{background:C.sandrift,color:"#fff",padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Lagre</button>
          <button className="btn" onClick={()=>setMode(null)} style={{background:C.ash,color:C.text,padding:"5px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>✕</button>
        </div>
      )}
    </div>
  );
}

// ══ Task Detail ════════════════════════════════════════════════════
function TaskDetail({task, customers, updateCampaign, deleteCampaign, navigate}) {
  const cust=customers.find(c=>c.id===task.customerId);
  const totalSpent=Object.values(task.spent||{}).reduce((a,b)=>a+b,0);
  const p=pacing(totalSpent,task.budget,task.start,task.end);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
        <button className="btn" onClick={()=>navigate("campaigns")} style={{background:C.ash,color:C.text,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:30,fontWeight:500,flex:1}}>{task.title}</h1>
        <StatusDot status={task.status} onChange={s=>updateCampaign(task.id,{status:s})}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
        <div className="card" style={{padding:"20px 24px"}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:12}}>Kanaler</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {getChannelLines(task).map(line=>(
              <CampaignLineRow key={line.flatKey} line={line} task={task} updateCampaign={updateCampaign}/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="card" style={{padding:"16px 18px"}}>
            {[{label:"Kunde",value:cust?.name||"—"},{label:"Periode",value:`${task.start} → ${task.end}`},{label:"Totalt budsjett",value:fmtNOK(task.budget)},{label:"Totalt forbruk",value:fmtNOK(totalSpent)},{label:"Pacing",value:p.label}].map(r=>(
              <div key={r.label} style={{marginBottom:10}}>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:2}}>{r.label}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:13}}>{r.value}</div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={()=>{if(confirm("Arkiver kampanje?")){updateCampaign(task.id,{archived:true});navigate("campaigns");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:C.ash,color:C.nickel,border:"none"}}>Arkiver kampanje</button>
          <button className="btn" onClick={()=>{if(confirm(`Slett kampanjen permanent?`)){deleteCampaign(task.id);navigate("campaigns");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:"none",color:C.brandyRose,border:`1px solid ${C.brandyRose}60`}}>Slett kampanje</button>
        </div>
      </div>
    </div>
  );
}

// ══ Customer List ══════════════════════════════════════════════════
function CustomerList({customers, tasks, briefs, navigate, setShowCreateCustomer}) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500}}>Kunder</h1>
        {setShowCreateCustomer&&<button className="btn" onClick={setShowCreateCustomer} style={{background:C.panel,color:C.text,padding:"10px 18px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,border:`1px solid ${C.ash}`}}>+ Ny kunde</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {customers.map(c=>{
          const cTasks=tasks.filter(t=>t.customerId===c.id&&!t.archived);
          const cBriefs=briefs.filter(b=>b.customerId===c.id&&!b.archived);
          return (
            <div key={c.id} className="card" style={{padding:"24px",cursor:"pointer"}} onClick={()=>navigate("customer-detail",{customerId:c.id})}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <CustomerAvatar customer={c} size={44} fontSize={14}/>
                <div>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:500}}>{c.name}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{c.industry}</div>
                </div>
              </div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel,marginBottom:12}}>{c.contact}</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.greyOlive,marginBottom:10,fontWeight:500}}>Bank: {fmtNOK(c.bank||0)}</div>
              <div style={{display:"flex",gap:6}}>
                <span style={{background:C.ash,padding:"3px 10px",borderRadius:10,fontFamily:"Roboto,sans-serif",fontSize:11}}>{cTasks.length} kampanjer</span>
                {cBriefs.length>0&&<span style={{background:`${C.sandrift}30`,padding:"3px 10px",borderRadius:10,fontFamily:"Roboto,sans-serif",fontSize:11,color:C.sandrift}}>{cBriefs.length} oppgaver</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ Customer Detail ════════════════════════════════════════════════
function CustomerDetail({customer, tasks, briefs, updateCampaign, updateCustomer, navigate}) {
  const [tab,setTab]=useState("active");
  const [editingBank,setEditingBank]=useState(false);
  const [bankInput,setBankInput]=useState(customer.bank||0);
  const [showEdit,setShowEdit]=useState(false);
  const activeTasks=tasks.filter(t=>t.customerId===customer.id&&!t.archived);
  const archivedTasks=tasks.filter(t=>t.customerId===customer.id&&t.archived);
  const activeBriefs=briefs.filter(b=>b.customerId===customer.id&&!b.archived);
  const archivedBriefs=briefs.filter(b=>b.customerId===customer.id&&b.archived);
  const hunchEntries=[...activeTasks,...archivedTasks].flatMap(task=>
    getChannelLines(task).filter(l=>l.hunch&&l.spent>0).map(l=>({
      month:monthLabel(task.start),channel:l.flatKey,spent:l.spent,
      fee:Math.round(l.spent*HUNCH_FEE),taskTitle:task.title,
    }))
  );
  const hunchByMonth=hunchEntries.reduce((acc,e)=>{
    if(!acc[e.month]) acc[e.month]=[];
    acc[e.month].push(e);return acc;
  },{});

  return (
    <>
      <div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
        <button className="btn" onClick={()=>navigate("customers")} style={{background:C.ash,color:C.text,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        <CustomerAvatar customer={customer} size={48} fontSize={15}/>
        <div style={{flex:1}}>
          <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:500}}>{customer.name}</h1>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel}}>{customer.industry} · {customer.contact}</div>
        </div>
        {updateCustomer&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <button className="btn" onClick={()=>setShowEdit(true)} style={{background:C.ash,color:C.text,padding:"5px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11,border:`1px solid ${C.ash}`}}>Rediger kunde</button>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:4}}>Kundebank</div>
              {editingBank?(
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <input type="number" value={bankInput} onChange={e=>setBankInput(+e.target.value)} style={{width:130,textAlign:"right"}}/>
                  <button className="btn" onClick={()=>{updateCustomer(customer.id,{bank:bankInput});setEditingBank(false);}} style={{background:C.sandrift,color:"#fff",padding:"5px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>Lagre</button>
                  <button className="btn" onClick={()=>setEditingBank(false)} style={{background:C.ash,color:C.text,padding:"5px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>✕</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500,color:(customer.bank||0)<0?C.brandyRose:C.greyOlive}}>{fmtNOK(customer.bank||0)}</span>
                  <button className="btn" onClick={()=>{setBankInput(customer.bank||0);setEditingBank(true);}} style={{background:"none",border:`1px solid ${C.ash}`,color:C.nickel,padding:"3px 9px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>Sett inn</button>
                </div>
              )}
            </div>
          </div>
        )}
        {!updateCustomer&&(
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:4}}>Kundebank</div>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500,color:(customer.bank||0)<0?C.brandyRose:C.greyOlive}}>{fmtNOK(customer.bank||0)}</span>
          </div>
        )}
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.ash}`,marginBottom:20}}>
        {["active","history",...(hunchEntries.length>0?["hunch"]:[])].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="active"?"Aktive":t==="history"?"Historikk":"Hunch fees"}
          </div>
        ))}
      </div>

      {tab==="active"&&(
        <>
          {activeBriefs.length>0&&(
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:8}}>Oppgaver</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {activeBriefs.map(b=>(
                  <div key={b.id} className="card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderLeft:`3px solid ${C.sandrift}`}} onClick={()=>navigate("brief-detail",{briefId:b.id})}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:14}}>{b.title}</div>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{b.start&&b.end?`${b.start} → ${b.end}`:""}</div>
                    </div>
                    <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,background:C.ash,padding:"2px 8px",borderRadius:8}}>{b.status==="startet"?"Startet":"Ny"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTasks.length>0&&(
            <div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.nickel,marginBottom:8}}>Kampanjer</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {activeTasks.map(task=>{
                  const totalSpent=Object.values(task.spent||{}).reduce((a,b)=>a+b,0);
                  return (
                    <div key={task.id} className="card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>navigate("task-detail",{taskId:task.id})}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:500,fontSize:14}}>{task.title}</div>
                        <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{task.start} → {task.end}</div>
                      </div>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,textAlign:"right",color:C.textDim}}>{fmtNOK(totalSpent)} / {fmtNOK(task.budget)}</div>
                      <StatusDot status={task.status} onChange={s=>updateCampaign(task.id,{status:s})}/>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeBriefs.length===0&&activeTasks.length===0&&<div style={{fontFamily:"Roboto,sans-serif",color:C.nickel,padding:"40px 0",textAlign:"center"}}>Ingen aktive oppgaver eller kampanjer.</div>}
        </>
      )}
      {tab==="history"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...archivedBriefs,...archivedTasks].length===0&&<div style={{fontFamily:"Roboto,sans-serif",color:C.nickel,padding:"40px 0",textAlign:"center"}}>Ingen historikk ennå.</div>}
          {archivedBriefs.map(b=>(
            <div key={b.id} className="card" style={{padding:"12px 16px",opacity:.7}}>
              <div style={{fontWeight:500,fontSize:14}}>{b.title}</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>Oppgave · Avsluttet</div>
            </div>
          ))}
          {archivedTasks.map(t=>(
            <div key={t.id} className="card" style={{padding:"12px 16px",opacity:.7}}>
              <div style={{fontWeight:500,fontSize:14}}>{t.title}</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>Kampanje · {t.start} → {t.end} · {fmtNOK(t.budget)}</div>
            </div>
          ))}
        </div>
      )}
      {tab==="hunch"&&(
        <div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel,marginBottom:16}}>5% tech fee trekkes automatisk fra budsjett på Hunch-kanaler.</div>
          {Object.entries(hunchByMonth).map(([month,entries])=>(
            <div key={month} style={{marginBottom:20}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:500,marginBottom:10,textTransform:"capitalize"}}>{month}</div>
              {entries.map((e,i)=>(
                <div key={i} className="card" style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500}}>{e.channel}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>{e.taskTitle}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.brandyRose}}>Hunch fee: {fmtNOK(e.fee)}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>av {fmtNOK(e.spent)} forbruk</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
      {showEdit&&updateCustomer&&<EditCustomerModal customer={customer} onClose={()=>setShowEdit(false)}
        onSave={changes=>{updateCustomer(customer.id,changes);setShowEdit(false);}}/>}
    </>
  );
}
function ChannelDropdown({channels, onChange}) {
  const [openCohort, setOpenCohort] = useState(null);
  const toggleChannel = ch => {
    const nc={...channels};
    if(nc[ch]) delete nc[ch]; else nc[ch]=[];
    onChange(nc);
  };
  const toggleSub = (ch,sub) => {
    const cur=channels[ch]||[];
    const next=cur.includes(sub)?cur.filter(s=>s!==sub):[...cur,sub];
    onChange({...channels,[ch]:next});
  };
  const selectedCount=Object.keys(channels).length;
  return (
    <div>
      {selectedCount>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
          {Object.entries(channels).map(([ch,subs])=>{
            const items=(subs&&subs.length>0)?subs:[null];
            return items.map(sub=>{
              const key=sub?`${ch} · ${sub}`:ch;
              return <span key={key} style={{fontFamily:"Roboto,sans-serif",fontSize:11,background:`${C.sandrift}30`,color:C.sandrift,padding:"2px 8px",borderRadius:8,display:"flex",alignItems:"center",gap:4}}>
                {key}<span style={{cursor:"pointer",opacity:.7}} onClick={()=>sub?toggleSub(ch,sub):toggleChannel(ch)}>✕</span>
              </span>;
            });
          })}
        </div>
      )}
      {Object.entries(CHANNEL_COHORTS).map(([cohort,chans])=>(
        <div key={cohort} style={{marginBottom:6}}>
          <div onClick={()=>setOpenCohort(openCohort===cohort?null:cohort)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:C.bg,border:`1px solid ${C.ash}`,borderRadius:openCohort===cohort?"4px 4px 0 0":"4px",cursor:"pointer"}}>
            <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.text}}>{cohort}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {Object.keys(chans).filter(ch=>channels[ch]).length>0&&(
                <span style={{fontFamily:"Roboto,sans-serif",fontSize:10,background:`${C.sandrift}30`,color:C.sandrift,padding:"1px 7px",borderRadius:8}}>
                  {Object.keys(chans).filter(ch=>channels[ch]).length} valgt
                </span>
              )}
              <span style={{color:C.nickel,fontSize:12}}>{openCohort===cohort?"▲":"▼"}</span>
            </div>
          </div>
          {openCohort===cohort&&(
            <div style={{border:`1px solid ${C.ash}`,borderTop:"none",borderRadius:"0 0 4px 4px",padding:"8px",display:"flex",flexDirection:"column",gap:4,background:C.input}}>
              {Object.entries(chans).map(([ch,subs])=>{
                const selected=!!channels[ch];
                return (
                  <div key={ch} style={{borderRadius:3,border:`1px solid ${selected?C.sandrift:C.ash}`,background:selected?`${C.sandrift}10`:"transparent"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",cursor:"pointer"}} onClick={()=>toggleChannel(ch)}>
                      <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${selected?C.sandrift:C.ash}`,background:selected?C.sandrift:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {selected&&<span style={{color:"#fff",fontSize:9}}>✓</span>}
                      </div>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.text,flex:1,display:"flex",alignItems:"center",gap:6}}>
                        {CHANNEL_ICONS[ch]&&<img src={CHANNEL_ICONS[ch]} alt="" style={{width:16,height:16,borderRadius:3,objectFit:"contain",background:"#fff",padding:1}}/>}
                        {ch}
                      </span>
                      {isHunch(ch)&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.brandyRose}}>−5% fee</span>}
                    </div>
                    {selected&&subs&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"4px 10px 8px 32px"}}>
                        {subs.map(sub=><div key={sub} className={`channel-chip${(channels[ch]||[]).includes(sub)?" selected":""}`} onClick={()=>toggleSub(ch,sub)}>{sub}</div>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getSelectedLines(channels) {
  return Object.entries(channels).flatMap(([ch,subs])=>{
    const items=(subs&&subs.length>0)?subs:[null];
    return items.map(sub=>({flatKey:sub?`${ch} · ${sub}`:ch,label:sub?`${ch} · ${sub}`:ch,hunch:isHunch(sub||ch)}));
  });
}

// ══ Create Brief Modal ════════════════════════════════════════════
function CreateBriefModal({customers, onClose, onSave}) {
  const [form,setForm]=useState({customerId:"",title:"",description:"",start:today(),end:"",assignedTo:"",channels:{}});
  const [campaignLines,setCampaignLines]=useState([]);
  const selectedLines=getSelectedLines(form.channels);
  const handleChannelChange=newChannels=>{
    const newLines=getSelectedLines(newChannels);
    setCampaignLines(prev=>{
      const kept=prev.filter(cl=>newLines.some(l=>l.flatKey===cl.flatKey));
      const existing=new Set(kept.map(cl=>cl.flatKey));
      const added=newLines.filter(l=>!existing.has(l.flatKey)).map(l=>({id:uid(),flatKey:l.flatKey,name:"Kampanje 1",budget:0,hunch:l.hunch}));
      return [...kept,...added];
    });
    setForm(f=>({...f,channels:newChannels}));
  };
  const addLine=flatKey=>{
    const count=campaignLines.filter(cl=>cl.flatKey===flatKey).length;
    setCampaignLines(prev=>[...prev,{id:uid(),flatKey,name:`Kampanje ${count+1}`,budget:0,hunch:isHunch(flatKey)}]);
  };
  const removeLine=id=>setCampaignLines(prev=>prev.filter(cl=>cl.id!==id));
  const updateLine=(id,changes)=>setCampaignLines(prev=>prev.map(cl=>cl.id===id?{...cl,...changes}:cl));
  const total=campaignLines.reduce((a,cl)=>a+(cl.budget||0),0);
  const save=()=>{
    if(!form.customerId||!form.title) return alert("Fyll inn kunde og tittel");
    if(!form.end) return alert("Fyll inn sluttdato");
    const channelBudgets={};
    campaignLines.forEach(cl=>{channelBudgets[`${cl.flatKey} — ${cl.name}`]=cl.budget||0;});
    onSave({id:uid(),...form,assignedTo:form.assignedTo?[form.assignedTo]:[],channels:form.channels,channelBudgets,status:"ny",archived:false});
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:"92vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500}}>Ny oppgave</h2>
          <button className="btn" onClick={onClose} style={{background:"none",fontSize:20,color:C.nickel}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label>Kunde</label>
            <select value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))} style={{width:"100%"}}>
              <option value="">Velg kunde...</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name} — Bank: {fmtNOK(c.bank||0)}</option>)}
            </select>
          </div>
          <div><label>Ressurs</label>
            <select value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))} style={{width:"100%"}}>
              <option value="">Ikke tildelt</option>
              <option value="r1">Robin Askevold</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:14}}><label>Tittel</label>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{width:"100%"}} placeholder="f.eks. Q2 kampanje"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div><label>Startdato</label><input type="date" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))} style={{width:"100%"}}/></div>
          <div><label>Sluttdato</label><input type="date" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))} style={{width:"100%"}}/></div>
        </div>
        <div style={{marginBottom:14}}><label>Brief / Beskrivelse</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{width:"100%",minHeight:70,resize:"vertical"}} placeholder="Mål, målgruppe, budskap..."/>
        </div>
        <div style={{marginBottom:16}}><label>Kanaler</label>
          <ChannelDropdown channels={form.channels} onChange={handleChannelChange}/>
        </div>
        {selectedLines.length>0&&(
          <div style={{marginBottom:18}}>
            <label>Kampanjelinjer og budsjett</label>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
              {selectedLines.map(line=>{
                const linesForChannel=campaignLines.filter(cl=>cl.flatKey===line.flatKey);
                return (
                  <div key={line.flatKey} style={{background:C.bg,borderRadius:4,border:`1px solid ${C.ash}`,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.text}}>
                        {line.label}{line.hunch&&<span style={{color:C.brandyRose,fontSize:10,marginLeft:6}}>−5% Hunch fee</span>}
                      </span>
                      <button className="btn" onClick={()=>addLine(line.flatKey)} style={{background:"none",border:`1px solid ${C.ash}`,color:C.nickel,padding:"2px 8px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:10}}>+ Legg til kampanje</button>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {linesForChannel.map(cl=>(
                        <div key={cl.id} style={{display:"flex",alignItems:"center",gap:8}}>
                          <input value={cl.name} onChange={e=>updateLine(cl.id,{name:e.target.value})} style={{flex:1,padding:"5px 8px",fontSize:12}} placeholder="Kampanjenavn"/>
                          <input type="number" value={cl.budget||""} onChange={e=>updateLine(cl.id,{budget:+e.target.value})} style={{width:120,textAlign:"right",padding:"5px 8px",fontSize:12}} placeholder="0"/>
                          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel,width:30}}>NOK</span>
                          {linesForChannel.length>1&&<button className="btn" onClick={()=>removeLine(cl.id)} style={{background:"none",color:C.nickel,fontSize:13,padding:"2px 4px"}}>✕</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {total>0&&(
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:13,marginTop:10,padding:"8px 12px",background:C.bg,borderRadius:3,border:`1px solid ${C.ash}`}}>
                <span style={{color:C.nickel}}>Totalt budsjett</span>
                <strong style={{color:C.text}}>{fmtNOK(total)}</strong>
              </div>
            )}
          </div>
        )}
        <button className="btn" onClick={save} style={{background:C.sandrift,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%",marginTop:6}}>Opprett oppgave</button>
      </div>
    </div>
  );
}

// ══ Convert Brief → Campaign Modal ════════════════════════════════
function ConvertBriefModal({brief, customers, onClose, onSave}) {
  const cust=customers.find(c=>c.id===brief.customerId);
  // Use brief.channelBudgets directly — these have the named lines + amounts already set
  const [channelBudgets,setChannelBudgets]=useState({...brief.channelBudgets});
  const [form,setForm]=useState({title:brief.title,start:brief.start||today(),end:brief.end||""});
  const total=Object.values(channelBudgets).reduce((a,b)=>a+b,0);
  const bankAfter=(cust?.bank||0)-total;

  const save=()=>{
    if(!form.title||!form.end) return alert("Fyll inn tittel og sluttdato");
    // Build channels object from brief
    onSave({
      id:uid(),customerId:brief.customerId,title:form.title,
      start:form.start,end:form.end,budget:total,status:"green",
      channels:brief.channels||{},channelBudgets,
      spent:{},channelDates:{},archived:false,fromBriefId:brief.id
    },brief.id);
  };

  const lineEntries = Object.entries(channelBudgets);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500}}>Lag kampanje fra oppgave</h2>
          <button className="btn" onClick={onClose} style={{background:"none",fontSize:20,color:C.nickel}}>✕</button>
        </div>
        {cust&&(
          <div style={{background:C.bg,borderRadius:4,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:12}}>
            <span style={{color:C.nickel}}>Kundebank: <strong style={{color:C.text}}>{fmtNOK(cust.bank||0)}</strong></span>
            <span style={{color:bankAfter<0?C.brandyRose:C.greyOlive}}>Etter kampanje: <strong>{fmtNOK(bankAfter)}</strong></span>
          </div>
        )}
        <div style={{marginBottom:14}}><label>Kampanjenavn</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{width:"100%"}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
          <div><label>Startdato</label><input type="date" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))} style={{width:"100%"}}/></div>
          <div><label>Sluttdato</label><input type="date" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))} style={{width:"100%"}}/></div>
        </div>
        {lineEntries.length>0&&(
          <div style={{marginBottom:18}}>
            <label style={{marginBottom:8,display:"block"}}>Kampanjelinjer og budsjett</label>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {lineEntries.map(([key,val])=>{
                const baseCh = key.split(" — ")[0];
                const hunch = isHunch(baseCh);
                const icon = getChannelIcon(baseCh);
                return (
                  <div key={key} style={{display:"flex",alignItems:"center",gap:10,background:C.bg,borderRadius:3,padding:"8px 12px",border:`1px solid ${C.ash}`}}>
                    <div style={{flex:1,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.textDim,display:"flex",alignItems:"center",gap:6}}>
                      {icon&&<img src={icon} alt="" style={{width:16,height:16,borderRadius:3,objectFit:"contain",background:"#fff",padding:1}}/>}
                      {key}
                      {hunch&&<span style={{color:C.brandyRose,fontSize:10,marginLeft:4}}>−5% fee</span>}
                    </div>
                    <input type="number" value={val||""} onChange={e=>setChannelBudgets(p=>({...p,[key]:+e.target.value}))} style={{width:120,textAlign:"right"}} placeholder="0"/>
                    <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.nickel}}>NOK</span>
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"flex-end",fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel,paddingRight:36}}>
                Totalt: <strong style={{color:C.text,marginLeft:6}}>{fmtNOK(total)}</strong>
              </div>
            </div>
          </div>
        )}
        {lineEntries.length===0&&(
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.nickel,marginBottom:18,padding:"12px",background:C.bg,borderRadius:4,border:`1px solid ${C.ash}`}}>
            Ingen kampanjelinjer satt opp på oppgaven. Opprett kampanjen og legg til linjer manuelt.
          </div>
        )}
        <button className="btn" onClick={save} style={{background:C.sandrift,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>Opprett kampanje</button>
      </div>
    </div>
  );
}

// ══ Create Customer Modal ══════════════════════════════════════════
function CreateCustomerModal({onClose, onSave}) {
  const [form,setForm]=useState({name:"",industry:"",contact:"",logo:"",bank:0});
  const save=()=>{
    if(!form.name) return alert("Fyll inn kundenavn");
    const logo=form.logo||form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    onSave({id:uid(),...form,logo,bank:+form.bank||0});
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:500}}>Ny kunde</h2>
          <button className="btn" onClick={onClose} style={{background:"none",fontSize:20,color:C.nickel}}>✕</button>
        </div>
        {[{key:"name",label:"Kundenavn",placeholder:"f.eks. Oris Dental"},{key:"industry",label:"Bransje",placeholder:"f.eks. Tannhelse"},{key:"contact",label:"Nettside",placeholder:"f.eks. orisdental.no"},{key:"logo",label:"Logo-initialer (valgfritt)",placeholder:"f.eks. OD"}].map(f=>(
          <div key={f.key} style={{marginBottom:14}}><label>{f.label}</label>
            <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{width:"100%"}} placeholder={f.placeholder}/>
          </div>
        ))}
        <div style={{marginBottom:14}}><label>Startkapital i bank (NOK)</label>
          <input type="number" value={form.bank} onChange={e=>setForm(p=>({...p,bank:e.target.value}))} style={{width:"100%"}} placeholder="0"/>
        </div>
        <button className="btn" onClick={save} style={{background:C.sandrift,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%",marginTop:6}}>Opprett kunde</button>
      </div>
    </div>
  );
}
