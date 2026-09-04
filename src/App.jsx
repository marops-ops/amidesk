import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, List, ClipboardList, Building2, Users,
  Bell, Plus, Search, MoreHorizontal, X,
  ChevronDown, ChevronRight, ArrowRight,
  UserPlus, Share2, Wallet, Trash2, Upload, Calendar,
  CircleCheck, TrendingDown, TrendingUp, Clock, Pencil,
  Phone, Mail, Star, Globe,
} from "lucide-react";

const SUPABASE_URL = "https://qrmbtlkjfvokkxdwoxrg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybWJ0bGtqZnZva2t4ZHdveHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzUyNTAsImV4cCI6MjA5MzY1MTI1MH0.F93wzDpSzFibcyO5PSWyPpyO50QQt570FoHQDoNFnEM";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const ALLOWED_DOMAIN = "amidays.com";
const SUPER_ADMIN_EMAILS = ["robin@amidays.com","marops@amidays.com"];

const ADMIN_EMAILS = [
  // Kanal-heads
  "kaja@amidays.com",       // SOME head
  "jorgen@amidays.com",     // SEM head
  "elisabeth@amidays.com",  // Programmatisk head
  "rebecca@amidays.com",    // SOME head
  // Rådgivere og partnere
  "arvid@amidays.com","jakob@amidays.com","lina@amidays.com",
  "marianne@amidays.com","ole@amidays.com","simen@amidays.com","trine@amidays.com",
  // Data & Analyse
  "robin@amidays.com",
  // Økonomi
  "magnus@amidays.com",
  // System
  "marops@amidays.com",
  // NB: Jonas, Markus (SEO), Naritsa, Signe (Design) er IKKE admin
];

const AMIDAYS_STAFF = [
  {id:"arvid",    name:"Arvid Cedergren",            email:"arvid@amidays.com",    depts:["Rådgiver","Data & Analyse"]},
  {id:"christina",name:"Christina Veliz",             email:"christina@amidays.com", depts:["SOME"]},
  {id:"elisabeth",name:"Elisabeth Gullikstad Albech", email:"elisabeth@amidays.com", depts:["Programmatisk"]},
  {id:"jakob",    name:"Jakob Skåltveit",             email:"jakob@amidays.com",    depts:["Rådgiver"]},
  {id:"jenny",    name:"Jenny Duers",                 email:"jenny@amidays.com",    depts:["SEM"]},
  {id:"jonas",    name:"Jonas Aam",                   email:"jonas@amidays.com",    depts:["SEO"]},
  {id:"jorgen",   name:"Jørgen Aasbrein Vågen",       email:"jorgen@amidays.com",   depts:["SEM"]},
  {id:"kaja",     name:"Kaja Augestad Sølvesen",      email:"kaja@amidays.com",     depts:["SOME"]},
  {id:"lina",     name:"Lina Agdestein",              email:"lina@amidays.com",     depts:["Rådgiver"]},
  {id:"magnus",   name:"Magnus Leirfall",             email:"magnus@amidays.com",   depts:["Økonomi"]},
  {id:"marianne", name:"Marianne Eskeland",           email:"marianne@amidays.com", depts:["Rådgiver"]},
  {id:"markus",   name:"Markus Syljusveen",           email:"markus@amidays.com",   depts:["SEO"]},
  {id:"marte",    name:"Marte Økland",                email:"marte@amidays.com",    depts:["Programmatisk","SOME"]},
  {id:"mikael",   name:"Mikael Strand Blomquist",     email:"mikael@amidays.com",   depts:["SEO","SOME"]},
  {id:"trine",    name:"Trine Kvam Hviding",          email:"trine@amidays.com",    depts:["Rådgiver"]},
  {id:"naritsa",  name:"Naritsa Larsen Risbø",        email:"naritsa@amidays.com",  depts:["Design"]},
  {id:"ole",      name:"Ole Kristian Ullereng",       email:"ole@amidays.com",      depts:["Rådgiver"]},
  {id:"rebecca",  name:"Rebecca Økland",              email:"rebecca@amidays.com",  depts:["SOME"]},
  {id:"robin",    name:"Robin Askevold",              email:"robin@amidays.com",    depts:["Data & Analyse","SOME","SEM"]},
  {id:"signe",    name:"Signe Bjerke Thon Brekke",   email:"signe@amidays.com",    depts:["Design"]},
  {id:"simen",    name:"Simen Kronvall",              email:"simen@amidays.com",    depts:["Rådgiver"]},
];

// Channel → dept mapping for filtering assign/share lists
const CHANNEL_DEPT_MAP = {
  "SOME":           ["Meta","Hunch - Meta","Snapchat","Hunch - Snapchat","TikTok","LinkedIn","Pinterest","Reddit","Apple Search Ads","TikTok Search Ads"],
  "SEM":            ["Google Ads","Microsoft Ads"],
  "Programmatisk":  ["DV360","Kobler","ReadPeak","Adnuntius","Hawk"],
};


// Filter staff by dept label
function staffByDept(dept) {
  return AMIDAYS_STAFF.filter(s=>s.depts.includes(dept));
}
const ADVISORS = AMIDAYS_STAFF.filter(s=>s.depts.includes("Rådgiver"));
const CHANNEL_STAFF = AMIDAYS_STAFF.filter(s=>
  s.depts.some(d=>["SOME","SEM","Programmatisk","Data & Analyse","SEO"].includes(d))
);
// Get relevant staff for a channel
function staffForChannel(channelName) {
  const dept = Object.entries(CHANNEL_DEPT_MAP).find(([,chs])=>
    chs.some(ch=>channelName.toLowerCase().includes(ch.toLowerCase()))
  )?.[0];
  if(!dept) return AMIDAYS_STAFF; // fallback: all
  return AMIDAYS_STAFF.filter(s=>s.depts.includes(dept));
}

const C = {
  // flater
  bg:         "#F4F1EB",
  sidebar:    "#EDE7DD",
  card:       "#FFFFFF",
  cardAlt:    "#FBF9F5",
  // kanter
  border:     "#E7E1D7",
  borderSoft: "#EFEAE1",
  borderDash: "#DCD5C8",
  divider:    "#F0EBE2",
  // tekst
  ink:        "#2B2F36",
  ink2:       "#5F666F",
  ink3:       "#949AA3",
  ink4:       "#A9AEB6",
  // aksent
  sand:       "#AF8E72",
  sandHover:  "#9C7C60",
  sandDeep:   "#8D6F54",
  sandBg:     "#F6EEE6",
  sandBd:     "#E4D5C5",
  // status
  okFg:       "#3E6337", okBar:   "#4F7A46", okBg:   "#ECF1E8",
  warnFg:     "#8A6420", warnBar: "#B98A3C", warnBg: "#FBF2E2",
  badFg:      "#96503C", badBar:  "#A85B45", badBg:  "#FAEBE7",
  staleEdge:  "#D9A24A", staleRow:"#FFFDF7",
  infoFg:     "#1E6E8C", infoBg:  "#E9F1F4",
  // legacy aliases brukt i eldre komponenter
  panel:      "#FFFFFF",
  input:      "#FBF9F5",
  ash:        "#E7E1D7",
  nickel:     "#949AA3",
  text:       "#2B2F36",
  textDim:    "#5F666F",
  greyOlive:  "#8D6F54",
  sandrift:   "#AF8E72",
  brandyRose: "#A85B45",
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

const rowToCustomer = r => ({
  id:r.id, name:r.name, industry:r.industry, contact:r.contact, logo:r.logo, logoUrl:r.logo_url||null, bank:r.bank||0,
  colorPrimary:r.color_primary||null, colorSecondary:r.color_secondary||null,
  contactName:r.contact_name||"", contactPhone:r.contact_phone||"", contactEmail:r.contact_email||"",
  advisorId:r.advisor_id||null, resources:r.resources||[],
  deptBudgets:r.dept_budgets||{},
});
const rowToBrief = r => ({
  id:r.id, customerId:r.customer_id, title:r.title, description:r.description,
  start:r.start_date, end:r.end_date, assignedTo:r.assigned_to?[r.assigned_to]:[],
  channels:r.channels||{}, channelBudgets:r.channel_budgets||{},
  status:r.status, archived:r.archived, ownerId:r.owner_id,
  sharedWith:r.shared_with||[],
  restspendUsed:r.restspend_used||0,
});
const rowToCampaign = r => ({
  id:r.id, customerId:r.customer_id, title:r.title,
  start:r.start_date, end:r.end_date, budget:r.budget||0,
  status:r.status, archived:r.archived,
  channels:r.channels||{}, channelBudgets:r.channel_budgets||{},
  spent:r.spent||{}, channelDates:r.channel_dates||{},
  fromBriefId:r.from_brief_id, ownerId:r.owner_id,
  lineAssignments:r.line_assignments||{},
  sharedWith:r.shared_with||[],
  lastSpendUpdate:r.last_spend_update||null,
  archivedLines:r.archived_lines||[],
  restspendUsed:r.restspend_used||0,
});
const campaignToRow = t => ({
  id:t.id, customer_id:t.customerId, title:t.title,
  start_date:t.start, end_date:t.end, budget:t.budget,
  status:t.status, archived:t.archived,
  channels:t.channels, channel_budgets:t.channelBudgets,
  spent:t.spent, channel_dates:t.channelDates||{},
  from_brief_id:t.fromBriefId||null, owner_id:t.ownerId||null,
  line_assignments:t.lineAssignments||{},
  shared_with:t.sharedWith||[],
  last_spend_update:t.lastSpendUpdate||null,
  archived_lines:t.archivedLines||[],
  restspend_used:t.restspendUsed||0,
});
const customerToRow = c => ({
  id:c.id, name:c.name, industry:c.industry, contact:c.contact, logo:c.logo, logo_url:c.logoUrl||null, bank:c.bank||0,
  color_primary:c.colorPrimary||null, color_secondary:c.colorSecondary||null,
  contact_name:c.contactName||null, contact_phone:c.contactPhone||null, contact_email:c.contactEmail||null,
  advisor_id:c.advisorId||null, resources:c.resources||[],
  dept_budgets:c.deptBudgets||{},
});
const briefToRow = b => ({
  id:b.id, customer_id:b.customerId, title:b.title, description:b.description,
  start_date:b.start, end_date:b.end, assigned_to:b.assignedTo?.[0]||null,
  channels:b.channels, channel_budgets:b.channelBudgets,
  status:b.status, archived:b.archived, owner_id:b.ownerId||null,
  shared_with:b.sharedWith||[],
  restspend_used:b.restspendUsed||0,
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
      <div style={{background:C.card,borderRadius:8,padding:"52px 48px",border:"1px solid "+C.border,textAlign:"center",maxWidth:400,width:"90%"}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,color:C.ink,marginBottom:8}}>AmiDesk</div>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,letterSpacing:".08em",textTransform:"uppercase",marginBottom:40}}>Kampanjeadministrasjon</div>
        {error&&<div style={{background:`${C.badFg}20`,border:"1px solid "+C.badFg,borderRadius:4,padding:"10px 14px",marginBottom:20,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.badFg}}>{error}</div>}
        <button className="btn" onClick={handleLogin} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,width:"100%",padding:"14px",borderRadius:4,background:C.sand,color:"#fff",fontFamily:"Roboto,sans-serif",fontSize:13,letterSpacing:".04em"}}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
          </svg>
          Logg inn med Google
        </button>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginTop:16}}>Kun @amidays.com kontoer har tilgang</div>
      </div>
    </div>
  );
}

// ══ App ═══════════════════════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(undefined);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [routeState, setRouteState] = useState({page:"campaigns", slug:null});
  const page = routeState.page;
  const selectedCustomerId = routeState.page==="customer-detail" ? routeState.slug : null;
  const selectedBriefId    = routeState.page==="brief-detail"    ? routeState.slug : null;
  const selectedTaskId     = routeState.page==="task-detail"     ? routeState.slug : null;
  const viewingUserId      = routeState.page==="team-member"     ? routeState.slug : null;
  // ── URL routing helpers (outside component) ──────────────────────
const parseUrl = () => {
  const path = window.location.pathname;
  if (path === "/" || path === "/dashboard") return {page:"dashboard", slug:null};
  if (path === "/kampanjelinjer") return {page:"campaigns", slug:null};
  if (path === "/oppgaver") return {page:"briefs", slug:null};
  if (path.startsWith("/kunder/")) return {page:"customer-detail", slug:path.replace("/kunder/","")};
  if (path === "/kunder") return {page:"customers", slug:null};
  if (path === "/andres") return {page:"others", slug:null};
  if (path.startsWith("/team/")) return {page:"team-member", slug:path.replace("/team/","")};
  if (path.startsWith("/oppgave/")) return {page:"brief-detail", slug:path.replace("/oppgave/","")};
  if (path.startsWith("/kampanje/")) return {page:"task-detail", slug:path.replace("/kampanje/","")};
  return {page:"campaigns", slug:null};
};
const slugify = (name) => (name||"").toLowerCase()
  .replace(/æ/g,"ae").replace(/ø/g,"o").replace(/å/g,"a")
  .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
  const [teamMembers, setTeamMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateBrief, setShowCreateBrief] = useState(false);
  const [briefToConvert, setBriefToConvert] = useState(null);
  const [addCampaignTarget, setAddCampaignTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [favoriteCustomers, setFavoriteCustomers] = useState([]);
  const [customerOrder, setCustomerOrder] = useState([]);
  const [othersTasks, setOthersTasks] = useState([]);

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
    async function syncProfile() {
      if (!session) return;
      const u = session.user;
      const staffEntry = AMIDAYS_STAFF.find(s=>s.email===u.email);
      const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;
      await sb.from("profiles").upsert({
        id: u.id,
        email: u.email,
        display_name: u.user_metadata?.full_name || u.email.split("@")[0],
        avatar_url: avatarUrl,
        ...(staffEntry ? {departments: staffEntry.depts} : {}),
      }, { onConflict: "id" });
      if(avatarUrl) {
        await sb.from("profiles").update({avatar_url: avatarUrl}).eq("id", u.id);
      }
    }
    syncProfile();
  }, [session]);

  // Popstate for URL routing
  useEffect(() => {
    setRouteState(parseUrl());
    const onPop = () => setRouteState(parseUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Load data
  useEffect(() => {
    if (!session) return;
    async function load() {
      const userId = session.user.id;
      const isAdminUser = ADMIN_EMAILS.includes(session.user.email);

      const [{ data: cData }, { data: bOwned }, { data: bShared }, { data: nData }] = await Promise.all([
        sb.from("customers").select("*"),
        sb.from("briefs").select("*").eq("owner_id", userId),
        sb.from("briefs").select("*").filter("shared_with", "cs", `["${userId}"]`),
        sb.from("notifications").select("*").eq("user_id", userId).eq("read", false).order("created_at", {ascending:false}),
      ]);

      // Own campaigns + shared
      const [{ data: tOwned }, { data: tShared }] = await Promise.all([
        sb.from("campaigns").select("*").eq("owner_id", userId),
        sb.from("campaigns").select("*").filter("shared_with", "cs", `["${userId}"]`),
      ]);
      const seenT = new Set();
      const ownTaskRows = [...(tOwned||[]), ...(tShared||[])].filter(t=>{ if(seenT.has(t.id)) return false; seenT.add(t.id); return true; });

      if (cData) setCustomers(cData.map(rowToCustomer));
      const allBriefs = [...(bOwned||[]), ...(bShared||[])];
      const seenB = new Set();
      setBriefs(allBriefs.filter(b=>{ if(seenB.has(b.id)) return false; seenB.add(b.id); return true; }).map(rowToBrief));
      setTasks(ownTaskRows.map(rowToCampaign));

      // For admins: load others' campaigns
      if (isAdminUser) {
        const { data: othersC } = await sb.from("campaigns").select("*").neq("owner_id", userId).eq("archived", false);
        if(othersC) setOthersTasks(othersC.map(rowToCampaign));
      }
      if (nData) setNotifications(nData);
      // Load favorites from profile
      const {data: profileData} = await sb.from("profiles").select("favorite_customers, customer_order").eq("id", userId).single();
      if (profileData?.favorite_customers) setFavoriteCustomers(profileData.favorite_customers);
      if (profileData?.customer_order) setCustomerOrder(profileData.customer_order);
      const { data: members } = await sb.from("profiles").select("id,email,display_name,avatar_url,departments");
      if (members) setTeamMembers(members);
      setLoading(false);
    }
    load();

    // Realtime: listen for new notifications
    const channel = sb.channel("notifications-"+session.user.id)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq."+session.user.id,
      }, payload => {
        setNotifications(prev=>[payload.new, ...prev]);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [session]);

  if (session === undefined) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,fontFamily:"'Montserrat',sans-serif",fontSize:24,color:C.ink2}}>Laster AmiDesk…</div>
  );
  if (!session) return <LoginScreen error={authError} />;

  const activeTask     = tasks.find(t=>t.id===selectedTaskId);
  const activeCustomer = customers.find(c=>c.id===selectedCustomerId||slugify(c.name)===selectedCustomerId);
  const activeBrief    = briefs.find(b=>b.id===selectedBriefId);

  const navigate = (p, extra={}) => {
    let path = "/kampanjelinjer";
    if (p==="dashboard")      path = "/dashboard";
    else if (p==="campaigns") path = "/kampanjelinjer";
    else if (p==="briefs")    path = "/oppgaver";
    else if (p==="team")      path = "/team";
    else if (p==="others")    path = "/andres";
    else if (p==="customers") path = "/kunder";
    else if (p==="customer-detail" && extra.customerId) {
      const c = customers.find(c=>c.id===extra.customerId);
      path = "/kunder/"+(c ? slugify(c.name) : extra.customerId);
    }
    else if (p==="brief-detail" && extra.briefId)         path = "/oppgave/"+extra.briefId;
    else if (p==="task-detail" && extra.taskId)           path = "/kampanje/"+extra.taskId;
    else if (p==="team-member" && extra.viewingUserId)    path = "/team/"+extra.viewingUserId;
    window.history.pushState({}, "", path);
    setRouteState({page:p, slug:extra.customerId||extra.briefId||extra.taskId||extra.viewingUserId||null});
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

  const toggleFavorite = async (customerId) => {
    const next = favoriteCustomers.includes(customerId)
      ? favoriteCustomers.filter(id=>id!==customerId)
      : [...favoriteCustomers, customerId];
    setFavoriteCustomers(next);
    if (session?.user?.id) {
      await sb.from("profiles").update({favorite_customers: next}).eq("id", session.user.id);
    }
  };

  const saveCustomerOrder = async (order) => {
    setCustomerOrder(order);
    if (session?.user?.id) {
      await sb.from("profiles").update({customer_order: order}).eq("id", session.user.id);
    }
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
      const next = prev.map(t => {
        if(t.id!==id) return t;
        updated = {...t,...changes};
        return updated;
      });
      return next;
    });
    // Wait for state to settle then write to DB
    await new Promise(r=>setTimeout(r,0));
    if(updated) await sb.from("campaigns").update(campaignToRow(updated)).eq("id",id);
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
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,fontFamily:"'Montserrat',sans-serif",fontSize:24,color:C.ink2}}>Laster AmiDesk…</div>
  );

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",fontFamily:"'Montserrat',sans-serif",background:C.bg,color:C.ink,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap');
        html,body,#root{height:100%;width:100%;margin:0;padding:0}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        .btn{cursor:pointer;border:none;transition:all .15s;font-family:Roboto,sans-serif}.btn:hover{opacity:.85}.btn:active{opacity:.7}
        .card{background:${C.card};border-radius:14px;box-shadow:0 1px 2px rgba(43,47,54,.04);transition:box-shadow .2s}
        .card:hover{box-shadow:0 8px 24px rgba(43,47,54,.09)}
        .nav-item{cursor:pointer;padding:9px 14px;border-radius:9px;transition:all .15s;font-family:Roboto,sans-serif;font-size:13px;color:${C.ink2};display:flex;align-items:center;gap:9px;margin-bottom:1px}
        .nav-item:hover{background:rgba(43,47,54,.06)}.nav-item.active{background:${C.card};box-shadow:0 1px 2px rgba(43,47,54,.07);color:${C.ink}}
        input,select,textarea{font-family:Roboto,sans-serif;font-size:13px;background:${C.card};border:1px solid ${C.border};border-radius:9px;padding:8px 12px;color:${C.ink};outline:none;transition:border .15s;width:100%}
        input:focus,select:focus,textarea:focus{border-color:${C.sand}}
        input[type=date]{cursor:pointer;-webkit-appearance:none;appearance:none;min-width:140px}
        input[type=date]::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.6;filter:invert(30%)}
        input::placeholder,textarea::placeholder{color:${C.ink4}}
        label{font-family:Roboto,sans-serif;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:${C.ink4};display:block;margin-bottom:5px}
        .modal-overlay{position:fixed;inset:0;background:rgba(43,47,54,.42);backdrop-filter:blur(3px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:${C.card};border-radius:14px;padding:32px;width:620px;max-height:92vh;overflow-y:auto;border:1px solid ${C.border};box-shadow:0 30px 80px rgba(43,47,54,.28)}
        .modal-lg{width:780px}
        .channel-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:99px;font-size:11px;font-family:Roboto,sans-serif;cursor:pointer;border:1px solid ${C.border};background:${C.card};color:${C.ink3};transition:all .15s;white-space:nowrap;flex-shrink:0}
        .channel-chip.selected{background:${C.sandBg};color:${C.sandDeep};border-color:${C.sandBd}}
        .channel-chip:hover{border-color:${C.sand};color:${C.sand}}
        .pacing-ok{display:inline-flex;align-items:center;gap:4px;color:${C.okFg};background:${C.okBg};padding:3px 9px;border-radius:99px;font-size:10px;font-family:Roboto,sans-serif;white-space:nowrap;flex-shrink:0}
        .pacing-warn{display:inline-flex;align-items:center;gap:4px;color:${C.warnFg};background:${C.warnBg};padding:3px 9px;border-radius:99px;font-size:10px;font-family:Roboto,sans-serif;white-space:nowrap;flex-shrink:0}
        .pacing-bad{display:inline-flex;align-items:center;gap:4px;color:${C.badFg};background:${C.badBg};padding:3px 9px;border-radius:99px;font-size:10px;font-family:Roboto,sans-serif;white-space:nowrap;flex-shrink:0}
        .tab{cursor:pointer;padding:8px 16px;font-family:Roboto,sans-serif;font-size:13px;border-bottom:2px solid transparent;transition:all .15s;color:${C.ink3}}
        .tab.active{border-bottom-color:${C.sand};color:${C.ink}}.tab:hover:not(.active){border-bottom-color:${C.border}}
        select option{background:${C.card};color:${C.ink}}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        .action-stripe{display:flex;align-items:center;gap:6px;padding:8px 12px;background:${C.cardAlt};border-top:1px solid ${C.borderSoft};flex-wrap:wrap}
        .action-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:8px;font-family:Roboto,sans-serif;font-size:11.5px;cursor:pointer;border:1px solid ${C.border};background:${C.card};color:${C.ink2};white-space:nowrap;transition:all .15s}
        .action-btn:hover{border-color:${C.sand};color:${C.sand}}
        .action-btn.danger{color:${C.badFg};border-color:${C.badBg}}.action-btn.danger:hover{border-color:${C.badFg};background:${C.badBg}}
        .action-btn.settle{color:${C.okFg};border-color:${C.okBg}}.action-btn.settle:hover{border-color:${C.okFg};background:${C.okBg}}
      `}</style>

      <Sidebar page={page} navigate={navigate} setShowCreateBrief={setShowCreateBrief} session={session} isAdmin={isAdmin} notifications={notifications} onMarkRead={async(id)=>{
        await sb.from("notifications").update({read:true}).eq("id",id);
        setNotifications(p=>p.filter(n=>n.id!==id));
      }}/>

      <main style={{flex:1,overflow:"auto",padding:"34px 44px 80px",background:C.bg,color:C.ink}}>
        {page==="dashboard"&&<Dashboard tasks={tasks} customers={customers} briefs={briefs} updateBrief={updateBrief} deleteBrief={deleteBrief} navigate={navigate} setBriefToConvert={setBriefToConvert} session={session}/>}
        {page==="campaigns"&&<CampaignPage tasks={tasks} customers={customers} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate} adjustBank={adjustBank} onAddCampaign={(customer,ctx)=>setAddCampaignTarget({customer,presetChannel:ctx?.channel||null})} briefs={briefs} setShowCreateBrief={setShowCreateBrief} isAdmin={isAdmin} session={session} customerOrder={customerOrder} onReorder={saveCustomerOrder}/>}
        {page==="briefs"&&<BriefsPage briefs={briefs} customers={customers} navigate={navigate} setShowCreateBrief={setShowCreateBrief} setBriefToConvert={setBriefToConvert}/>}
        {page==="brief-detail"&&activeBrief&&<BriefDetail brief={activeBrief} updateBrief={updateBrief} deleteBrief={deleteBrief} customers={customers} navigate={navigate} setBriefToConvert={setBriefToConvert}/>}
        {page==="customers"&&!selectedCustomerId&&<CustomerList customers={customers} tasks={tasks} briefs={briefs} navigate={navigate} setShowCreateCustomer={isAdmin?()=>setShowCreateCustomer(true):null} onAddCampaign={c=>setAddCampaignTarget({customer:c,presetChannel:null})} favoriteCustomers={favoriteCustomers} toggleFavorite={toggleFavorite}/>}
        {(page==="customer-detail"&&activeCustomer)
          ?<CustomerDetail customer={activeCustomer} tasks={tasks} briefs={briefs} updateCampaign={updateCampaign} updateCustomer={isAdmin?updateCustomer:updateCustomer} navigate={navigate} onAddCampaign={c=>setAddCampaignTarget({customer:c,presetChannel:null})} session={session} teamMembers={teamMembers}/>:null}
        {page==="task-detail"&&activeTask&&<TaskDetail task={activeTask} customers={customers} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate}/>}
        {page==="team"&&<TeamPage teamMembers={teamMembers} navigate={navigate}/>}
        {page==="others"&&isAdmin&&<OthersCampaignPage tasks={othersTasks} customers={customers} teamMembers={teamMembers} session={session} navigate={navigate} updateCampaign={updateCampaign}/>}
        {page==="team-member"&&<TeamMemberPage userId={viewingUserId} teamMembers={teamMembers} customers={customers} navigate={navigate} session={session} isAdmin={isAdmin} onUpdateProfile={(id,changes)=>setTeamMembers(prev=>prev.map(m=>m.id===id?{...m,...changes}:m))}/>}
      </main>

      {addCampaignTarget&&<AddCampaignModal
        customer={addCampaignTarget.customer}
        presetChannel={addCampaignTarget.presetChannel}
        tasks={tasks}
        onClose={()=>setAddCampaignTarget(null)}
        onSave={async campaign=>{
          const withOwner={...campaign,ownerId:session.user.id};
          await adjustBank(campaign.customerId,-campaign.budget);
          setTasks(p=>[...p,withOwner]);
          await sb.from("campaigns").upsert(campaignToRow(withOwner));
          setAddCampaignTarget(null);
        }}/>}
      {showCreateBrief&&<CreateBriefModal customers={customers} tasks={tasks} onClose={()=>setShowCreateBrief(false)}
        onSave={async b=>{
          // Find if assigned resource maps to a known profile
          const staffMember = b.assignedTo?.[0]
            ? AMIDAYS_STAFF.find(s=>s.id===b.assignedTo[0])
            : null;
          let sharedWith = [];
          if(staffMember) {
            const {data:profile} = await sb.from("profiles").select("id").eq("email",staffMember.email).single();
            if(profile && profile.id !== session.user.id) {
              sharedWith = [profile.id];
              // Create notification
              await sb.from("notifications").insert({
                id: uid(),
                user_id: profile.id,
                type: "brief_assigned",
                message: `${session.user.user_metadata?.full_name||session.user.email} la deg til på "${b.title}"`,
                brief_id: b.id,
                read: false,
              });
            }
          }
          const withOwner = {...b, ownerId: session.user.id, sharedWith};
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
function Sidebar({page, navigate, setShowCreateBrief, session, isAdmin, notifications=[], onMarkRead}) {
  const user = session?.user;
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Bruker";
  const avatar = user?.user_metadata?.avatar_url;
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const [showNotifs,setShowNotifs]=useState(false);
  const unread=notifications.length;

  const navItems = [
    {id:"dashboard",   label:"Dashboard",       Icon:LayoutDashboard},
    {id:"campaigns",   label:"Kampanjelinjer",  Icon:List},
    {id:"briefs",      label:"Oppgaver",        Icon:ClipboardList},
    {id:"customers",   label:"Kunder",          Icon:Building2},
    {id:"team",        label:"Team",            Icon:Users},
    ...(isAdmin?[{id:"others",label:"Andres kampanjer",Icon:Users,adminLabel:true}]:[]),
  ];

  return (
    <aside style={{width:232,background:C.sidebar,display:"flex",flexDirection:"column",padding:"24px 14px",borderRight:`1px solid ${C.border}`,gap:2,flexShrink:0,position:"relative"}}>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:20,fontWeight:600,color:C.ink,padding:"0 10px 24px",letterSpacing:"-.02em"}}>AmiDesk</div>

      {navItems.map(({id,label,Icon,adminLabel})=>(
        <div key={id}
          className={`nav-item${page===id||page===id+"-detail"||page==="team-member"&&id==="team"?" active":""}`}
          onClick={()=>navigate(id)}>
          <Icon size={16} strokeWidth={1.75}/>
          <span style={{flex:1}}>{label}</span>
          {adminLabel&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:9,color:C.sand,letterSpacing:".06em",textTransform:"uppercase"}}>admin</span>}
        </div>
      ))}

      <div style={{flex:1}}/>

      <button className="btn" onClick={()=>setShowCreateBrief(true)}
        style={{background:C.sand,color:"#fff",padding:"11px 14px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:12.5,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:10}}>
        <Plus size={15} strokeWidth={2}/> Ny oppgave
      </button>

      {/* Notification bell */}
      <div style={{position:"relative",marginBottom:8}}>
        <button className="btn" onClick={()=>setShowNotifs(!showNotifs)}
          style={{background:"none",color:C.ink2,padding:"8px 10px",borderRadius:9,display:"flex",alignItems:"center",gap:7,fontFamily:"Roboto,sans-serif",fontSize:12.5,width:"100%",border:`1px solid ${showNotifs?C.sand:C.border}`}}>
          <Bell size={15} strokeWidth={1.75}/>
          <span>Varsler</span>
          {unread>0&&<span style={{marginLeft:"auto",background:"#C48374",color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{unread}</span>}
        </button>
        {showNotifs&&(
          <div style={{position:"absolute",bottom:"100%",left:0,right:0,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:8,marginBottom:4,maxHeight:300,overflowY:"auto",zIndex:50,boxShadow:"0 8px 24px rgba(43,47,54,.12)"}}>
            {unread===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,padding:10,textAlign:"center"}}>Ingen nye varsler</div>}
            {notifications.map(n=>{
              const Icon = n.type==="brief_assigned"?UserPlus:n.type==="campaign_shared"?Share2:ArrowRight;
              const bg = n.type==="brief_assigned"?C.sandBg:n.type==="campaign_shared"?C.infoBg:C.okBg;
              const fg = n.type==="brief_assigned"?C.sandDeep:n.type==="campaign_shared"?C.infoFg:C.okFg;
              return (
                <div key={n.id} style={{padding:"10px 10px",borderRadius:8,background:C.cardAlt,marginBottom:4,cursor:"pointer",border:`1px solid ${C.borderSoft}`,display:"flex",gap:10,alignItems:"flex-start"}}
                  onClick={()=>{onMarkRead(n.id);if(n.brief_id)navigate("brief-detail",{briefId:n.brief_id});setShowNotifs(false);}}>
                  <div style={{width:26,height:26,borderRadius:8,background:bg,color:fg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon size={13} strokeWidth={1.75}/>
                  </div>
                  <div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11.5,color:C.ink,lineHeight:1.4}}>{n.message}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,marginTop:2}}>Trykk for å åpne</div>
                  </div>
                </div>
              );
            })}
            {unread>0&&<button className="btn" onClick={async()=>{for(const n of notifications)await onMarkRead(n.id);setShowNotifs(false);}}
              style={{background:C.borderSoft,color:C.ink3,padding:"6px",borderRadius:8,fontFamily:"Roboto,sans-serif",fontSize:11,width:"100%",marginTop:2}}>Merk alle som lest</button>}
          </div>
        )}
      </div>

      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",alignItems:"center",gap:10}}>
        {avatar
          ?<img src={avatar} alt={name} style={{width:30,height:30,borderRadius:"50%",flexShrink:0}}/>
          :<div style={{width:30,height:30,borderRadius:"50%",background:C.sandBg,color:C.sandDeep,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:11,fontWeight:600,flexShrink:0}}>{initials}</div>
        }
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontWeight:500}}>{name}</div>
          {isAdmin&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.sand,letterSpacing:".08em",textTransform:"uppercase",marginTop:1}}>Admin</div>}
          <button className="btn" onClick={()=>sb.auth.signOut()}
            style={{background:"none",color:C.ink3,fontFamily:"Roboto,sans-serif",fontSize:10,padding:0,marginTop:1}}>
            Logg ut
          </button>
        </div>
      </div>
    </aside>
  );
}

// ══ Team Page (admin only) ═════════════════════════════════════════
function OthersCampaignPage({tasks, customers, teamMembers, session, navigate, updateCampaign}) {
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(session?.user?.email||"");
  const userEmail = session?.user?.email||"";
  const userStaff = AMIDAYS_STAFF.find(s=>s.email===userEmail);
  const userDepts = userStaff?.depts||[];

  // Determine which dept channels this admin manages
  const managedChannels = isSuperAdmin ? null : // null = all
    Object.entries(CHANNEL_DEPT_MAP)
      .filter(([dept])=>userDepts.includes(dept))
      .flatMap(([,chs])=>chs);

  // Filter tasks by managed channels (if not super-admin)
  const filtered = tasks.filter(t=>{
    if(isSuperAdmin) return true;
    return Object.keys(t.channelBudgets||{}).some(key=>{
      const ch=key.split(" — ")[0];
      return managedChannels?.some(mc=>ch.toLowerCase().includes(mc.toLowerCase()));
    });
  });

  // Group by owner
  const byOwner = {};
  filtered.forEach(t=>{
    const ownerId=t.ownerId||"unassigned";
    if(!byOwner[ownerId]) byOwner[ownerId]=[];
    byOwner[ownerId].push(t);
  });

  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:28}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,color:C.ink,letterSpacing:"-.02em"}}>Andres kampanjer</h1>
        <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.sand,letterSpacing:".08em",textTransform:"uppercase"}}>admin</span>
      </div>
      {Object.entries(byOwner).map(([ownerId,ownerTasks])=>{
        const profile=teamMembers.find(m=>m.id===ownerId);
        const staff=AMIDAYS_STAFF.find(s=>s.email===profile?.email);
        const name=profile?.display_name||staff?.name||"Ukjent";
        const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
        const depts=(profile?.departments||staff?.depts||[]);

        return (
          <div key={ownerId} style={{marginBottom:24,background:C.card,borderRadius:14,border:"1px solid rgba(43,47,54,.18)",overflow:"hidden",boxShadow:"0 4px 16px rgba(43,47,54,.08)"}}>
            {/* Owner header */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
              {profile?.avatar_url
                ?<img src={profile.avatar_url} alt={name} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                :<div style={{width:36,height:36,borderRadius:"50%",background:C.sandBg,color:C.sandDeep,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:600,flexShrink:0}}>{initials}</div>
              }
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,fontWeight:600,color:C.ink}}>{name}</div>
                <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
                  {depts.map(d=><span key={d} style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,background:C.borderSoft,padding:"2px 8px",borderRadius:99}}>{d}</span>)}
                </div>
              </div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{ownerTasks.length} kampanje{ownerTasks.length!==1?"r":""}</div>
            </div>

            {/* Campaign lines */}
            <div style={{overflowX:"auto"}}>
              <div style={{minWidth:860,padding:"0 0 8px"}}>
                <div style={{display:"grid",gridTemplateColumns:LINE_GRID,gap:12,padding:"7px 12px",background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
                  {["LINJE","FORBRUK MOT PLAN","BRUKT","BUDSJETT","KR/DAG","PACING",""].map(h=>(
                    <div key={h} style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:C.ink4}}>{h}</div>
                  ))}
                </div>
                <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:10}}>
                  {ownerTasks.filter(t=>!t.archived).map(task=>{
                    const cust=customers.find(c=>c.id===task.customerId);
                    const lines=getChannelLines(task);
                    if(!lines.length) return null;
                    const grouped=groupLinesByChannel(lines);
                    return (
                      <div key={task.id} style={{marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0 8px",borderBottom:"1px solid "+C.borderSoft,marginBottom:8}}>
                          <CustomerAvatar customer={cust||{}} size={30} fontSize={11}/>
                          <div>
                            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,fontWeight:600,color:C.ink}}>{cust?.name||"Ukjent kunde"}</div>
                            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{task.title}</div>
                          </div>
                        </div>
                        {Object.entries(grouped).map(([channelName,channelLines])=>{
                          const icon=getChannelIcon(channelName);
                          return (
                            <div key={channelName} style={{marginBottom:6}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,padding:"0 0 4px",borderBottom:"1px solid "+C.borderSoft}}>
                                {icon&&<div style={{width:18,height:18,borderRadius:4,overflow:"hidden",flexShrink:0,background:"#fff"}}>
                                  <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                </div>}
                                <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:600,color:C.ink2}}>{channelName}</span>
                              </div>
                              {channelLines.map(line=>(
                                <CampaignLineRow key={line.flatKey} line={line} task={task}
                                  updateCampaign={updateCampaign}
                                  onEndChannel={()=>{}}
                                  onDeleteLine={()=>{}}/>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {Object.keys(byOwner).length===0&&(
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,color:C.ink3,textAlign:"center",padding:"60px 0"}}>Ingen andres kampanjelinjer å vise.</div>
      )}
    </div>
  );
}

function TeamPage({teamMembers, navigate}) {
  return (
    <div>
      <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,marginBottom:28,color:C.ink,letterSpacing:"-.02em"}}>Team</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {teamMembers.map(member=>{
          const initials=(member.display_name||member.email).split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
          const isAdmin=ADMIN_EMAILS.includes(member.email);
          const depts=(member.departments||[]);
          return (
            <div key={member.id} className="card" style={{padding:"24px 26px",cursor:"pointer"}} onClick={()=>navigate("team-member",{viewingUserId:member.id})}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                {member.avatar_url
                  ?<img src={member.avatar_url} alt={member.display_name} style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                  :<div style={{width:60,height:60,borderRadius:"50%",background:C.sandBg,color:C.sandDeep,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',sans-serif",fontSize:20,fontWeight:600,flexShrink:0}}>{initials}</div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:17,fontWeight:600,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member.display_name||member.email.split("@")[0]}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{member.email}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {isAdmin&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.sand,background:C.sandBg,padding:"3px 10px",borderRadius:99,border:"1px solid "+C.sandBd}}>Admin</span>}
                {depts.map(d=><span key={d} style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink2,background:C.borderSoft,padding:"3px 10px",borderRadius:99}}>{d}</span>)}
                {depts.length===0&&!isAdmin&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink4}}>Ingen avdeling satt</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ Team Member Detail ═════════════════════════════════════════════
const DEPT_OPTIONS = ["Rådgiver","SEM","SOME","Programmatisk","Data & Analyse"];

function TeamMemberPage({userId, teamMembers, customers, navigate, session, onUpdateProfile, isAdmin=false}) {
  const [memberBriefs, setMemberBriefs] = useState([]);
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [deptDraft, setDeptDraft] = useState([]);
  const member = teamMembers.find(m=>m.id===userId);
  const isOwnProfile = session?.user?.id === userId;

  useEffect(()=>{
    if(!userId) return;
    async function load() {
      const [{data:bData},{data:tData}] = await Promise.all([
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
  const depts=member.departments||[];

  const saveProfile=async()=>{
    await sb.from("profiles").update({departments:deptDraft}).eq("id",userId);
    onUpdateProfile&&onUpdateProfile(userId,{departments:deptDraft});
    setEditingProfile(false);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <button className="btn" onClick={()=>navigate("team")} style={{background:C.borderSoft,color:C.ink,padding:"6px 12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        {member.avatar_url
          ?<img src={member.avatar_url} style={{width:64,height:64,borderRadius:"50%",objectFit:"cover"}}/>
          :<div style={{width:64,height:64,borderRadius:"50%",background:C.sandBg,color:C.sandDeep,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',sans-serif",fontSize:20,fontWeight:600}}>{initials}</div>
        }
        <div style={{flex:1}}>
          <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:28,fontWeight:600,color:C.ink}}>{member.display_name||member.email.split("@")[0]}</h1>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginTop:2}}>{member.email}</div>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            {depts.map(d=><span key={d} style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink2,background:C.borderSoft,padding:"3px 10px",borderRadius:99}}>{d}</span>)}
          </div>
        </div>
        {isOwnProfile&&!editingProfile&&(
          <button className="action-btn" onClick={()=>{setDeptDraft([...depts]);setEditingProfile(true);}}>Rediger profil</button>
        )}
      </div>

      {/* Edit profile */}
      {editingProfile&&(
        <div className="card" style={{padding:"20px 24px",marginBottom:24}}>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:16,fontWeight:600,color:C.ink,marginBottom:14}}>Jeg hører til:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {DEPT_OPTIONS.map(d=>{
              const selected=deptDraft.includes(d);
              return (
                <button key={d} onClick={()=>setDeptDraft(prev=>selected?prev.filter(x=>x!==d):[...prev,d])}
                  style={{padding:"7px 16px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:13,cursor:"pointer",border:"1px solid "+(selected?C.sand:C.border),background:selected?C.sandBg:"transparent",color:selected?C.sandDeep:C.ink2,transition:"all .15s",display:"flex",alignItems:"center",gap:6}}>
                  {selected&&<CircleCheck size={14} color={C.sand}/>}{d}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="action-btn settle" onClick={saveProfile}>Lagre</button>
            <button className="action-btn" onClick={()=>setEditingProfile(false)}><X size={12}/> Avbryt</button>
          </div>
        </div>
      )}

      {loading?<div style={{fontFamily:"Roboto,sans-serif",color:C.ink3}}>Laster…</div>:(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Oppgaver ({activeBriefs.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {activeBriefs.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen aktive oppgaver.</div>}
              {activeBriefs.map(b=>{
                const cust=customers.find(c=>c.id===b.customerId);
                return (
                  <div key={b.id} className="card" style={{padding:"12px 16px",borderLeft:"3px solid "+C.sand}}>
                    <div style={{fontWeight:500,fontSize:14,color:C.ink}}>{b.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{cust?.name} · {b.start} → {b.end}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Kampanjelinjer</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {activeTasks.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen aktive kampanjelinjer.</div>}
              {activeTasks.flatMap(t=>{
                const cust=customers.find(c=>c.id===t.customerId);
                return getChannelLines(t).map(line=>{
                  const icon=getChannelIcon(line.label.split(" — ")[0]);
                  const lineName=line.label.includes(" — ")?line.label.split(" — ").slice(1).join(" — "):line.label;
                  const pct=line.budget>0?Math.min(100,Math.round(line.spent/line.budget*100)):0;
                  return (
                    <div key={line.flatKey} className="card" style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {icon&&<div style={{width:22,height:22,borderRadius:5,overflow:"hidden",flexShrink:0,background:"#fff"}}>
                          <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        </div>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lineName}</div>
                          <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3}}>{cust?.name} · {line.chStart} → {line.chEnd}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink2}}>{fmtNOK(line.spent)} / {fmtNOK(line.budget)}</div>
                          <div style={{height:3,width:60,background:C.divider,borderRadius:99,marginTop:3,marginLeft:"auto"}}>
                            <div style={{height:"100%",width:pct+"%",background:C.okBar,borderRadius:99}}/>
                          </div>
                        </div>
                      </div>
                      {/* Admin actions */}
                      {isAdmin&&(
                        <div style={{display:"flex",gap:6,marginTop:8,paddingTop:8,borderTop:"1px solid "+C.borderSoft}}>
                          <select onChange={async e=>{
                            const targetEmail=e.target.value;
                            if(!targetEmail) return;
                            const {data:profile}=await sb.from("profiles").select("id").eq("email",targetEmail).single();
                            if(!profile){alert("Brukeren har ikke logget inn ennå.");return;}
                            await sb.from("campaigns").update({owner_id:profile.id}).eq("id",t.id);
                            e.target.value="";
                          }} style={{flex:1,padding:"4px 8px",fontSize:11,borderRadius:7}}>
                            <option value="">Tildel til…</option>
                            {staffForChannel(line.flatKey.split(" — ")[0]).map(s=><option key={s.id} value={s.email}>{s.name}</option>)}
                          </select>
                          <select onChange={async e=>{
                            const targetEmail=e.target.value;
                            if(!targetEmail) return;
                            const {data:profile}=await sb.from("profiles").select("id").eq("email",targetEmail).single();
                            if(!profile){alert("Brukeren har ikke logget inn ennå.");return;}
                            const cur=(await sb.from("campaigns").select("shared_with").eq("id",t.id).single()).data;
                            const sw=[...((cur?.shared_with)||[])];
                            if(!sw.includes(profile.id)) sw.push(profile.id);
                            await sb.from("campaigns").update({shared_with:sw}).eq("id",t.id);
                            e.target.value="";
                          }} style={{flex:1,padding:"4px 8px",fontSize:11,borderRadius:7}}>
                            <option value="">Del med…</option>
                            {staffForChannel(line.flatKey.split(" — ")[0]).map(s=><option key={s.id} value={s.email}>{s.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                });
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
  const bg = customer?.colorPrimary || C.sand;
  if(customer?.logoUrl) return (
    <div style={{width:size,height:size,borderRadius:9,overflow:"hidden",flexShrink:0,border:"1px solid "+C.border,background:bg}}>
      <div style={{width:"100%",height:"100%",backgroundImage:"url("+customer.logoUrl+")",backgroundSize:"contain",backgroundPosition:"center",backgroundRepeat:"no-repeat"}}/>
    </div>
  );
  return <div style={{width:size,height:size,borderRadius:9,background:bg,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',sans-serif",fontSize,fontWeight:600,flexShrink:0}}>{(customer?.logo||customer?.name||"?").slice(0,2).toUpperCase()}</div>;
}

// ══ ColorPicker ═══════════════════════════════════════════════════
function ColorSwatch({color, label, onChange}) {
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(color||"");
  const isValid=v=>(/^#[0-9A-Fa-f]{6}$/).test(v);
  const save=()=>{
    if(isValid(val)){onChange(val);setEditing(false);}
    else if(val===""){onChange(null);setEditing(false);}
  };
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <div
        onClick={()=>setEditing(!editing)}
        style={{width:32,height:32,borderRadius:"50%",background:color||"transparent",border:`2px solid ${color?color:C.border}`,cursor:"pointer",position:"relative",flexShrink:0,transition:"transform .15s"}}
        title={label}
      >
        {!color&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:C.ink3,fontSize:16}}>+</div>}
      </div>
      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9,color:C.ink3,letterSpacing:".04em",textTransform:"uppercase"}}>{label}</div>
      {editing&&(
        <div style={{display:"flex",gap:4,alignItems:"center",marginTop:2}}>
          <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}}
            placeholder="#000000" style={{width:88,padding:"3px 6px",fontSize:11}} autoFocus/>
          <button className="btn" onClick={save} style={{background:C.sand,color:"#fff",padding:"3px 7px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>OK</button>
        </div>
      )}
    </div>
  );
}

// ══ EditCustomerModal (admin only) ════════════════════════════════
function EditCustomerModal({customer, onClose, onSave}) {
  const [form,setForm]=useState({
    name:customer.name||"", industry:customer.industry||"",
    contact:customer.contact||"", logo:customer.logo||"",
    colorPrimary:customer.colorPrimary||null,
    colorSecondary:customer.colorSecondary||null,
    contactName:customer.contactName||"",
    contactPhone:customer.contactPhone||"",
    contactEmail:customer.contactEmail||"",
    advisorId:customer.advisorId||"",
    resources:customer.resources||[],
  });
  const [uploading,setUploading]=useState(false);
  const [previewUrl,setPreviewUrl]=useState(customer.logoUrl||null);

  const handleFile = async e => {
    const file=e.target.files[0];
    if(!file) return;
    setUploading(true);
    const ext=file.name.split(".").pop();
    const path=`${customer.id}.${ext}`;
    const {error}=await sb.storage.from("logos").upload(path,file,{upsert:true});
    if(error){alert("Feil ved opplasting: "+error.message);setUploading(false);return;}
    const {data}=sb.storage.from("logos").getPublicUrl(path);
    setPreviewUrl(data.publicUrl+"?t="+Date.now());
    setUploading(false);
  };

  const addResource=()=>setForm(f=>({...f,resources:[...f.resources,{staffId:"",department:""}]}));
  const updateResource=(i,changes)=>setForm(f=>({...f,resources:f.resources.map((r,idx)=>idx===i?{...r,...changes}:r)}));
  const removeResource=i=>setForm(f=>({...f,resources:f.resources.filter((_,idx)=>idx!==i)}));

  const save=()=>onSave({...form,logoUrl:previewUrl});

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:"92vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:24,fontWeight:600}}>Rediger kunde</h2>
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>

        {/* Logo + farger */}
        <div style={{display:"flex",alignItems:"flex-start",gap:20,marginBottom:20,padding:"16px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            {previewUrl
              ?<img src={previewUrl} alt="logo" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover"}}/>
              :<div style={{width:56,height:56,borderRadius:"50%",background:C.borderSoft,color:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:18,fontWeight:500}}>{form.logo||form.name.slice(0,2).toUpperCase()}</div>
            }
            <label className="btn" style={{display:"inline-block",background:C.borderSoft,color:C.ink,padding:"4px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11,cursor:"pointer",textAlign:"center"}}>
              {uploading?"Laster…":"Last opp"}
              <input type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} disabled={uploading}/>
            </label>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginBottom:10,letterSpacing:".05em",textTransform:"uppercase"}}>Merkevarefarger</div>
            <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
              <ColorSwatch color={form.colorPrimary} label="Primær" onChange={v=>setForm(f=>({...f,colorPrimary:v}))}/>
              <ColorSwatch color={form.colorSecondary} label="Sekundær" onChange={v=>setForm(f=>({...f,colorSecondary:v}))}/>
            </div>
          </div>
        </div>

        {/* Grunninfo */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[{key:"name",label:"Kundenavn"},{key:"industry",label:"Bransje"},{key:"contact",label:"Nettside"},{key:"logo",label:"Initialer (fallback)"}].map(f=>(
            <div key={f.key}><label>{f.label}</label>
              <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{width:"100%"}}/>
            </div>
          ))}
        </div>

        {/* Kundekontakt */}
        <div style={{marginBottom:16,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginBottom:10,letterSpacing:".05em",textTransform:"uppercase"}}>Kundekontakt</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label>Navn</label><input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} style={{width:"100%"}} placeholder="Kontaktperson"/></div>
            <div><label>Telefon</label><input value={form.contactPhone} onChange={e=>setForm(f=>({...f,contactPhone:e.target.value}))} style={{width:"100%"}} placeholder="+47 xxx xx xxx"/></div>
            <div><label>E-post</label><input value={form.contactEmail} onChange={e=>setForm(f=>({...f,contactEmail:e.target.value}))} style={{width:"100%"}} placeholder="navn@selskap.no"/></div>
          </div>
        </div>

        {/* Rådgiver */}
        <div style={{marginBottom:16,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginBottom:10,letterSpacing:".05em",textTransform:"uppercase"}}>Rådgiver</div>
          <select value={form.advisorId} onChange={e=>setForm(f=>({...f,advisorId:e.target.value}))} style={{width:"100%"}}>
            <option value="">Velg rådgiver...</option>
            {ADVISORS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {form.advisorId&&(()=>{const s=AMIDAYS_STAFF.find(x=>x.id===form.advisorId);return s?<div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginTop:6}}>{s.email}</div>:null;})()}
        </div>

        {/* Ressurser */}
        <div style={{marginBottom:20,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,letterSpacing:".05em",textTransform:"uppercase"}}>Ressurser</div>
            <button className="btn" onClick={addResource} style={{background:C.borderSoft,color:C.ink,padding:"4px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>+ Legg til</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {form.resources.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"center"}}>
                <select value={r.staffId} onChange={e=>updateResource(i,{staffId:e.target.value})} style={{width:"100%"}}>
                  <option value="">Velg person...</option>
                  {CHANNEL_STAFF.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={r.department} onChange={e=>updateResource(i,{department:e.target.value})} style={{width:"100%"}}>
                  <option value="">Velg avdeling...</option>
                  {["SOME","SEM","Programmatisk","SEO","Data & Analyse","Rådgiver","Design","Økonomi"].map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <button className="btn" onClick={()=>removeResource(i)} style={{background:"none",color:C.badFg,border:"1px solid "+C.badFg+"40",padding:"4px 8px",borderRadius:3}}><Trash2 size={14}/></button>
              </div>
            ))}
            {form.resources.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen ressurser lagt til.</div>}
          </div>
        </div>

        <button className="btn" onClick={save} style={{background:C.sand,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>Lagre endringer</button>
      </div>
    </div>
  );
}

// ══ Dashboard ══════════════════════════════════════════════════════
function Dashboard({tasks, customers, briefs, updateBrief, deleteBrief, navigate, setBriefToConvert, session}) {
  const activeBriefs=briefs.filter(b=>!b.archived&&b.status!=="avsluttet");
  const activeTasks=tasks.filter(t=>!t.archived);
  const activeCampaignLines=activeTasks.reduce((sum,t)=>sum+Math.max(1,Object.keys(t.channelBudgets||{}).length),0);
  const staleCount=activeTasks.filter(t=>{
    const lu=t.lastSpendUpdate?new Date(t.lastSpendUpdate):(t.start?new Date(t.start):null);
    return lu&&Math.floor((new Date()-lu)/(1000*60*60*24))>=7;
  }).length;
  const firstName=session?.user?.user_metadata?.full_name?.split(" ")[0]||"";
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,color:C.ink,letterSpacing:"-.02em"}}>God dag{firstName?", "+firstName:""}!</h1>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,color:C.ink2,marginTop:6}}>
          {staleCount>0&&<span style={{color:C.warnFg}}>{staleCount} linje{staleCount!==1?"r":""} trenger spend-oppdatering · </span>}
          {activeBriefs.length} oppgave{activeBriefs.length!==1?"r":""} aktive
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:32}}>
        {[
          {label:"Aktive kampanjelinjer",value:activeCampaignLines},
          {label:"Kunder",value:customers.length},
          {label:"Aktive oppgaver",value:activeBriefs.length},
        ].map(card=>(
          <div key={card.label} className="card" style={{padding:"20px 22px"}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:C.ink4,marginBottom:8}}>{card.label}</div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:27,fontWeight:600,color:C.ink}}>{card.value}</div>
          </div>
        ))}
      </div>
      {activeBriefs.length>0&&(
        <div>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:16,fontWeight:600,color:C.ink,marginBottom:12}}>Dine oppgaver</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {activeBriefs.map(brief=>{
              const cust=customers.find(c=>c.id===brief.customerId);
              const isStarted=brief.status==="startet";
              const hasCampaign=activeTasks.some(t=>t.fromBriefId===brief.id);
              return (
                <div key={brief.id} className="card"
                  style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderLeft:"3px solid "+(isStarted?C.okBar:C.sand)}}
                  onClick={()=>navigate("brief-detail",{briefId:brief.id})}>
                  <CustomerAvatar customer={cust||{}} size={32} fontSize={11}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500,fontSize:13,color:C.ink,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{brief.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span>{cust?.name}</span>
                      {brief.start&&brief.end&&<span>· {brief.start} → {brief.end}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0,alignItems:"center"}}>
                    <button className="btn" onClick={e=>{e.stopPropagation();updateBrief(brief.id,{status:isStarted?"ny":"startet"});}}
                      style={{padding:"5px 12px",borderRadius:8,fontFamily:"Roboto,sans-serif",fontSize:11,background:isStarted?C.okBg:C.borderSoft,color:isStarted?C.okFg:C.ink2,border:"1px solid "+(isStarted?C.okBar:C.border)}}>
                      {isStarted?"Startet":"Sett i gang"}
                    </button>
                    {!hasCampaign&&(
                      <button className="btn" onClick={e=>{e.stopPropagation();setBriefToConvert(brief);}}
                        style={{padding:"5px 12px",borderRadius:8,fontFamily:"Roboto,sans-serif",fontSize:11,background:C.sand,color:"#fff",border:"none",display:"flex",alignItems:"center",gap:5}}>
                        <ArrowRight size={12}/> Lag kampanje
                      </button>
                    )}
                    {hasCampaign&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.sandDeep,padding:"5px 10px",background:`${C.sandDeep}18`,borderRadius:3}}>✓ Kampanje opprettet</span>}
                    <button className="btn" onClick={e=>{e.stopPropagation();if(confirm("Slett oppgaven permanent?\nTilknyttede kampanjelinjer slettes også."))deleteBrief(brief.id);}}
                      style={{background:"none",color:C.ink3,fontSize:14,padding:"4px 6px"}}><Trash2 size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
        <div style={{position:"absolute",right:0,top:20,background:C.cardAlt,border:"1px solid "+C.border,borderRadius:4,padding:6,display:"flex",flexDirection:"column",gap:4,zIndex:10,boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>
          {Object.entries(STATUS_COLORS).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 6px",borderRadius:3}} onClick={()=>{onChange(k);setOpen(false);}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:v}}/>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,whiteSpace:"nowrap",color:C.ink}}>{k==="green"?"Aktiv":k==="yellow"?"Pågående":"Kritisk"}</span>
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
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500,color:C.ink}}>Oppgaver</h1>
        <button className="btn" onClick={()=>setShowCreateBrief(true)} style={{background:C.gunmetal,color:C.ink,padding:"10px 18px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,border:"1px solid "+C.border}}>+ Ny oppgave</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
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
              style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",borderLeft:`4px solid ${brief.status==="avsluttet"?C.border:isStarted?C.sandDeep:C.sand}`}}
              onClick={()=>navigate("brief-detail",{briefId:brief.id})}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.borderSoft,color:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,flexShrink:0}}>{cust?.logo||"?"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:500,fontSize:15,marginBottom:3}}>{brief.title}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span>{cust?.name}</span>
                  {brief.start&&brief.end&&<span>{brief.start} → {brief.end}</span>}
                  {totalBudget>0&&<span>Budsjett: {fmtNOK(totalBudget)}</span>}
                </div>
              </div>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,padding:"3px 10px",borderRadius:8,background:C.borderSoft,color:C.ink,flexShrink:0}}>
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
        <button className="btn" onClick={()=>navigate("briefs")} style={{background:C.borderSoft,color:C.ink,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:30,fontWeight:500,flex:1}}>{brief.title}</h1>
        <button className="btn" onClick={()=>setBriefToConvert(brief)} style={{background:C.sand,color:"#fff",padding:"9px 18px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12}}>Lag kampanje →</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:24}}>
        <div>
          {brief.description&&(
            <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Brief</div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",color:C.ink2}}>{brief.description}</div>
            </div>
          )}
          {Object.keys(brief.channelBudgets||{}).length>0&&(
            <div className="card" style={{padding:"20px 24px"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:12}}>Kanalbudsjett</div>
              {Object.entries(brief.channelBudgets).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontFamily:"Roboto,sans-serif",fontSize:12}}>
                  <span style={{color:C.ink2}}>{k}{isHunch(k)&&<span style={{color:C.badFg,fontSize:10,marginLeft:6}}>-5% Hunch fee</span>}</span>
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
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:2}}>{row.label}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:13}}>{row.value}</div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={()=>updateBrief(brief.id,{status:isStarted?"ny":"startet"})}
            style={{padding:"10px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:isStarted?C.okBg:C.borderSoft,color:C.ink2,border:"none"}}>
            {isStarted?"● Startet — klikk for å reversere":"Sett i gang"}
          </button>
          <button className="btn" onClick={()=>{if(confirm("Avslutt og arkiver oppgaven?"))updateBrief(brief.id,{status:"avsluttet",archived:true});}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:C.borderSoft,color:C.ink3,border:"none"}}>Avslutt oppgave</button>
          <button className="btn" onClick={()=>{if(confirm("Slett oppgaven permanent?\nTilknyttede kampanjelinjer slettes også.")){deleteBrief(brief.id);navigate("briefs");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:"none",color:C.badFg,border:`1px solid ${C.badFg}60`}}>Slett oppgave permanent</button>
        </div>
      </div>
    </div>
  );
}

// ══ Campaign Page ══════════════════════════════════════════════════
function CampaignPage({tasks, customers, updateCampaign, deleteCampaign, navigate, adjustBank, onAddCampaign, briefs=[], setShowCreateBrief, isAdmin, session, customerOrder=[], onReorder}) {
  const [dragOver, setDragOver] = useState(null);
  const dragSrc = useRef(null);

  const active=tasks.filter(t=>!t.archived);
  const grouped=customers
    .filter(c=>active.some(t=>t.customerId===c.id))
    .sort((a,b)=>{
      const ai=customerOrder.indexOf(a.id);
      const bi=customerOrder.indexOf(b.id);
      if(ai===-1&&bi===-1) return a.name.localeCompare(b.name);
      if(ai===-1) return 1; if(bi===-1) return -1;
      return ai-bi;
    })
    .map(c=>({customer:c,tasks:active.filter(t=>t.customerId===c.id)}));

  const countLines=(custTasks)=>custTasks.reduce((sum,t)=>sum+Object.keys(t.channelBudgets||{}).length,0);

  const [collapsedCustomers, setCollapsedCustomers] = useState({});
  const toggleCollapse = (id) => setCollapsedCustomers(prev=>({...prev,[id]:!prev[id]}));
  const handleDragStart=(e,id)=>{dragSrc.current=id;e.dataTransfer.effectAllowed="move";};
  const handleDragOver=(e,id)=>{e.preventDefault();setDragOver(id);};
  const handleDrop=(e,targetId)=>{
    e.preventDefault();
    const srcId=dragSrc.current;
    if(!srcId||srcId===targetId){setDragOver(null);return;}
    const ids=grouped.map(g=>g.customer.id);
    const from=ids.indexOf(srcId), to=ids.indexOf(targetId);
    ids.splice(from,1); ids.splice(to,0,srcId);
    onReorder&&onReorder(ids);
    setDragOver(null); dragSrc.current=null;
  };
  const handleDragEnd=()=>{setDragOver(null);dragSrc.current=null;};

  return (
    <div>
      <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:500,marginBottom:28,color:C.ink}}>Kampanjelinjer</h1>
      {grouped.length===0&&<div style={{fontFamily:"Roboto,sans-serif",color:C.ink3,padding:"60px 0",textAlign:"center"}}>Ingen aktive kampanjelinjer.</div>}
      {grouped.map(({customer,tasks:custTasks},groupIdx)=>{
        const accent=customer.colorPrimary||CUSTOMER_COLORS[groupIdx%CUSTOMER_COLORS.length];
        const lineCount=countLines(custTasks);
        return (
          <div key={customer.id}
            draggable
            onDragStart={e=>handleDragStart(e,customer.id)}
            onDragOver={e=>handleDragOver(e,customer.id)}
            onDrop={e=>handleDrop(e,customer.id)}
            onDragEnd={handleDragEnd}
            style={{marginBottom:14,background:customer.colorPrimary?customer.colorPrimary+"33":C.card,borderRadius:14,border:"1px solid "+(dragOver===customer.id?C.sand:customer.colorPrimary?customer.colorPrimary+"88":"rgba(43,47,54,.18)"),overflow:"hidden",boxShadow:"0 4px 16px rgba(43,47,54,.08), 0 1px 3px rgba(43,47,54,.12)",transition:"border .15s, box-shadow .2s",cursor:"grab"}}>
            <div style={{display:"flex",alignItems:"center",gap:16,padding:"16px 18px",borderBottom:"1px solid "+C.borderSoft,flexWrap:"wrap",background:customer.colorPrimary||C.cardAlt}}>
              <button className="btn" onClick={e=>{e.stopPropagation();toggleCollapse(customer.id);}}
                style={{background:"none",padding:"2px",color:customer.colorPrimary?"rgba(255,255,255,.7)":C.ink3,flexShrink:0}}>
                <ChevronDown size={18} style={{transform:collapsedCustomers[customer.id]?"rotate(-90deg)":"none",transition:"transform .2s"}}/>
              </button>
              <CustomerAvatar customer={customer} size={68} fontSize={22}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:600,cursor:"pointer",color:customer.colorSecondary||(customer.colorPrimary?"#fff":C.ink),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={()=>navigate("customer-detail",{customerId:customer.id})}>{customer.name}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,color:customer.colorSecondary||(customer.colorPrimary?"rgba(255,255,255,.85)":C.ink3),marginTop:4}}>{lineCount} aktive linje{lineCount!==1?"r":""}</div>
              </div>
              <div style={{display:"flex",gap:7,flexShrink:0,alignItems:"center"}}>
                <button className="action-btn" onClick={()=>onAddCampaign(customer,null)} style={{background:customer.colorPrimary?"rgba(255,255,255,.2)":C.sand,color:customer.colorPrimary?customer.colorSecondary||"#fff":"#fff",borderColor:customer.colorPrimary?"rgba(255,255,255,.3)":C.sand}}>
                  <Plus size={13}/> Kampanje
                </button>
              </div>
            </div>
            {!collapsedCustomers[customer.id]&&custTasks.map((task,taskIdx)=>(
              <TaskBlock key={task.id} task={task} taskIdx={taskIdx} custTasks={custTasks} accent={accent} updateCampaign={updateCampaign} deleteCampaign={deleteCampaign} navigate={navigate} adjustBank={adjustBank} onAddCampaign={(ch)=>onAddCampaign(customer,{task,channel:ch})} session={session}/>
            ))}
            {!collapsedCustomers[customer.id]&&custTasks.length>0&&(()=>{
              const allLines=custTasks.flatMap(t=>getChannelLines(t));
              const totalBudget=allLines.reduce((a,l)=>a+(l.budget||0),0);
              const totalSpent=allLines.reduce((a,l)=>a+(l.spent||0),0);
              const totalDayBudget=allLines.reduce((a,l)=>{
                const total=daysBetween(l.chStart,l.chEnd);
                const elapsed=Math.min(Math.max(daysBetween(l.chStart,today()),0),total);
                const left=total-elapsed;
                return a+(left>0?Math.max(0,(l.budget-l.spent)/left):0);
              },0);
              return (
                <div style={{display:"flex",gap:24,padding:"12px 18px",borderTop:"1px solid "+C.borderSoft,background:C.cardAlt}}>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>
                    Totalt budsjett: <strong style={{color:C.ink}}>{fmtNOK(totalBudget)}</strong>
                  </div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>
                    Totalt brukt: <strong style={{color:C.ink}}>{fmtNOK(totalSpent)}</strong>
                  </div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>
                    Dagsbudsjett: <strong style={{color:C.sand}}>{fmtNOK(Math.round(totalDayBudget))}/dag</strong>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}

// ══ Transfer Rest Modal ═══════════════════════════════════════════
function TransferModal({line, custTasks, currentTaskId, onClose, onTransfer, onReturnToBank}) {
  const [selected,setSelected]=useState(null);
  const diff=line.budget-line.spent;
  const isPositive=diff>=0;

  // All active lines across all campaigns for this customer, excluding current line
  const allLines=custTasks.flatMap(t=>
    Object.entries(t.channelBudgets||{}).map(([flatKey,budget])=>({
      flatKey, budget, taskId:t.id, taskTitle:t.title,
      lineName:flatKey.includes(" — ")?flatKey.split(" — ").slice(1).join(" — "):flatKey,
    }))
  ).filter(l=>l.flatKey!==line.flatKey);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:20,fontWeight:600,color:C.ink}}>Avslutt linje</h2>
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>

        <div style={{background:C.cardAlt,borderRadius:9,padding:"12px 14px",marginBottom:20,border:"1px solid "+C.borderSoft}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginBottom:4}}>{line.label}</div>
          <div style={{display:"flex",gap:16,fontFamily:"Roboto,sans-serif",fontSize:13}}>
            <span>Budsjett: <strong>{fmtNOK(line.budget)}</strong></span>
            <span>Brukt: <strong>{fmtNOK(line.spent)}</strong></span>
            <span style={{color:isPositive?C.okFg:C.badFg,fontWeight:600}}>{isPositive?"Rest: +":"Overspend: "}{fmtNOK(Math.abs(diff))}</span>
          </div>
        </div>

        <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,marginBottom:12}}>
          {isPositive?`Hva skal skje med ${fmtNOK(diff)}?`:`${fmtNOK(Math.abs(diff))} trekkes fra bank. Overfør underskudd til linje?`}
        </div>

        {/* Option 1: Return to bank */}
        <div onClick={()=>setSelected("bank")}
          style={{padding:"12px 14px",borderRadius:9,border:"1px solid "+(selected==="bank"?C.sand:C.border),background:selected==="bank"?C.sandBg:C.card,cursor:"pointer",marginBottom:8,transition:"all .15s"}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:selected==="bank"?C.sandDeep:C.ink}}>
            {isPositive?"Returner til kundebank":"Trekk fra kundebank"}
          </div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginTop:2}}>
            {isPositive?`Banken økes med ${fmtNOK(diff)}`:`Banken reduseres med ${fmtNOK(Math.abs(diff))}`}
          </div>
        </div>

        {/* Option 2: Transfer to line */}
        <div onClick={()=>setSelected("transfer")}
          style={{padding:"12px 14px",borderRadius:9,border:"1px solid "+(selected==="transfer"?C.sand:C.border),background:selected==="transfer"?C.sandBg:C.card,cursor:"pointer",marginBottom:selected==="transfer"?0:16,transition:"all .15s"}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:selected==="transfer"?C.sandDeep:C.ink}}>Overfør til kampanjelinje</div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginTop:2}}>
            {isPositive?"Resten legges til en annen linje sitt budsjett":"Underskuddet trekkes fra en annen linje sitt budsjett"}
          </div>
        </div>

        {selected==="transfer"&&(
          <div style={{border:"1px solid "+C.border,borderTop:"none",borderRadius:"0 0 9px 9px",padding:"10px 14px",marginBottom:16,background:C.cardAlt,maxHeight:200,overflowY:"auto"}}>
            {allLines.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen andre aktive linjer tilgjengelig.</div>}
            {allLines.map(l=>(
              <div key={l.flatKey} onClick={()=>setSelected(l.flatKey)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:7,cursor:"pointer",background:selected===l.flatKey?C.sandBg:"transparent",marginBottom:2}}>
                <div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.ink}}>{l.lineName}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3}}>{l.taskTitle}</div>
                </div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{fmtNOK(l.budget)}</div>
                {selected===l.flatKey&&<CircleCheck size={16} color={C.sand}/>}
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:8}}>
          <button className="btn" onClick={()=>{
            if(!selected) return alert("Velg et alternativ");
            if(selected==="bank") { onReturnToBank(); onClose(); }
            else {
              const targetLine=allLines.find(l=>l.flatKey===selected);
              if(targetLine) { onTransfer(targetLine); onClose(); }
            }
          }} style={{background:C.sand,color:"#fff",padding:"10px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:13,flex:1}}>
            Bekreft
          </button>
          <button className="btn" onClick={onClose} style={{background:C.borderSoft,color:C.ink,padding:"10px 16px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:13}}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}
function TaskBlock({task, taskIdx, custTasks, accent, updateCampaign, deleteCampaign, navigate, adjustBank, onAddCampaign, session}) {
  const [editingName,setEditingName]=useState(false);
  const [nameVal,setNameVal]=useState(task.title);
  const [editingMeta,setEditingMeta]=useState(false);
  const [meta,setMeta]=useState({start:task.start,end:task.end,budget:task.budget});
  const [showEndConfirm,setShowEndConfirm]=useState(false);
  const [transferLine,setTransferLine]=useState(null);
  const isEnded=task.end&&task.end<=today();

  const saveName=()=>{
    if(nameVal.trim()) updateCampaign(task.id,{title:nameVal.trim()});
    setEditingName(false);
  };
  const saveMeta=()=>{
    if(!meta.end) return;
    updateCampaign(task.id,{start:meta.start,end:meta.end,budget:+meta.budget||task.budget});
    setEditingMeta(false);
  };
  const handleEndCampaign=async()=>{
    const totalSpent=Object.values(task.spent||{}).reduce((a,b)=>a+b,0);
    const diff=task.budget-totalSpent;
    if(adjustBank) await adjustBank(task.customerId, diff);
    await updateCampaign(task.id,{end:today(),archived:true});
    setShowEndConfirm(false);
  };
  const handleEndChannel=(line)=>{
    setTransferLine(line);
  };

  const doEndChannel=(line, transferTarget=null)=>{
    const diff=line.budget-line.spent;
    const newBudgets={...task.channelBudgets};
    const newSpent={...task.spent};
    delete newBudgets[line.flatKey];
    delete newSpent[line.flatKey];
    const archivedLines=[...(task.archivedLines||[]),{
      flatKey:line.flatKey, label:line.label,
      budget:line.budget, spent:line.spent,
      start:line.chStart, end:today(), settledAt:today(),
    }];
    const remainingLines=Object.keys(newBudgets).length;
    const updates={channelBudgets:newBudgets,spent:newSpent,archivedLines,budget:Object.values(newBudgets).reduce((a,b)=>a+b,0)};
    if(remainingLines===0) updates.archived=true;
    updateCampaign(task.id,updates);

    if(transferTarget){
      // Transfer diff to target line's budget
      const targetTask=custTasks.find(t=>t.id===transferTarget.taskId);
      if(targetTask){
        const newTargetBudgets={...targetTask.channelBudgets};
        newTargetBudgets[transferTarget.flatKey]=(newTargetBudgets[transferTarget.flatKey]||0)+diff;
        updateCampaign(targetTask.id,{channelBudgets:newTargetBudgets,budget:Object.values(newTargetBudgets).reduce((a,b)=>a+b,0)});
      }
    } else {
      // Return to bank
      if(adjustBank&&diff!==0) adjustBank(task.customerId, diff);
    }
  };
  const handleDeleteLine=(flatKey)=>{
    if(!confirm(`Slett linjen "${flatKey}" permanent?`)) return;
    const lineBudget=task.channelBudgets?.[flatKey]||0;
    const lineSpent=task.spent?.[flatKey]||0;
    const diff=lineBudget-lineSpent;
    if(adjustBank&&diff!==0) adjustBank(task.customerId, diff);
    const newBudgets={...task.channelBudgets};
    const newSpent={...task.spent};
    const newDates={...task.channelDates};
    delete newBudgets[flatKey];
    delete newSpent[flatKey];
    delete newDates[flatKey];
    const base=flatKey.split(" — ")[0].split(" · ")[0];
    const remaining=Object.keys(newBudgets).filter(k=>k.split(" — ")[0].split(" · ")[0]===base);
    const newChannels={...task.channels};
    if(remaining.length===0) delete newChannels[base];
    updateCampaign(task.id,{channelBudgets:newBudgets,spent:newSpent,channelDates:newDates,channels:newChannels,budget:Object.values(newBudgets).reduce((a,b)=>a+b,0)});
  };

  const lines=getChannelLines(task);
  const grouped=groupLinesByChannel(lines);
  const isFromBrief=!!task.fromBriefId;

  return (
    <>
    <div style={{borderBottom:"1px solid "+C.borderSoft}}>
      {/* Campaign header — only shown if from a brief */}
      {isFromBrief&&(
      <div style={{background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",flexWrap:"wrap"}}>
          {editingName?(
            <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
              <input value={nameVal} onChange={e=>setNameVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName()}
                style={{flex:1,padding:"3px 8px",fontSize:13,fontWeight:600,borderRadius:7}} autoFocus/>
              <button className="btn" onClick={saveName} style={{background:C.sand,color:"#fff",padding:"3px 10px",borderRadius:7,fontSize:11}}>Lagre</button>
              <button className="btn" onClick={()=>setEditingName(false)} style={{background:C.borderSoft,color:C.ink2,padding:"3px 8px",borderRadius:7}}><X size={11}/></button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:6,flex:1,cursor:"pointer"}} onClick={()=>{setNameVal(task.title);setEditingName(true);}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:14,fontWeight:600,color:C.ink}}>{task.title}</div>
              <Pencil size={11} color={C.ink4}/>
            </div>
          )}
          {!editingName&&!showEndConfirm&&(
            <>
              {isEnded&&<button className="action-btn settle" onClick={()=>setShowEndConfirm(true)}><Wallet size={12}/> Avslutt kampanje</button>}
              <button className="action-btn danger" onClick={()=>{if(confirm("Slett kampanjen?"))deleteCampaign(task.id);}}><Trash2 size={12}/> Slett</button>
            </>
          )}
          {showEndConfirm&&(
            <div style={{display:"flex",alignItems:"center",gap:6,background:C.badBg,padding:"4px 10px",borderRadius:8,border:"1px solid "+C.badFg+"40"}}>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.badFg}}>Gjøre opp bank og arkivere?</span>
              <button className="action-btn settle" onClick={handleEndCampaign}>Ja, avslutt</button>
              <button className="action-btn" onClick={()=>setShowEndConfirm(false)}><X size={11}/></button>
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"0 16px 10px 16px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{task.start+" → "+task.end}</span>
          <span style={{color:C.border}}>·</span>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{fmtNOK(task.budget)}</span>
          {editingMeta?(
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <input type="date" value={meta.start} onChange={e=>setMeta(f=>({...f,start:e.target.value}))} style={{width:132,padding:"3px 7px",fontSize:11,borderRadius:7}}/>
              <span style={{color:C.ink3,fontSize:11}}>→</span>
              <input type="date" value={meta.end} onChange={e=>setMeta(f=>({...f,end:e.target.value}))} style={{width:132,padding:"3px 7px",fontSize:11,borderRadius:7}}/>
              <input type="number" value={meta.budget||""} onChange={e=>setMeta(f=>({...f,budget:e.target.value}))} style={{width:110,padding:"3px 7px",fontSize:11,textAlign:"right",borderRadius:7}} placeholder="Budsjett"/>
              <button className="action-btn" onClick={saveMeta}>Lagre</button>
              <button className="action-btn" onClick={()=>setEditingMeta(false)}><X size={11}/></button>
            </div>
          ):(
            <button className="action-btn" onClick={()=>{setMeta({start:task.start,end:task.end,budget:task.budget});setEditingMeta(true);}}>Rediger</button>
          )}
        </div>
      </div>
      )}

      {/* For non-brief campaigns: show subtle delete/end actions */}
      {!isFromBrief&&!showEndConfirm&&(isEnded)&&(
        <div style={{display:"flex",gap:6,padding:"8px 14px",background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,flex:1}}>{task.title} · {task.start} → {task.end}</span>
          {isEnded&&<button className="action-btn settle" onClick={()=>setShowEndConfirm(true)}><Wallet size={12}/> Avslutt kampanje</button>}
          <button className="action-btn danger" onClick={()=>{if(confirm("Slett kampanjen?"))deleteCampaign(task.id);}}><Trash2 size={12}/> Slett</button>
        </div>
      )}
      {!isFromBrief&&showEndConfirm&&(
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.badBg,padding:"8px 14px",borderBottom:"1px solid "+C.borderSoft}}>
          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.badFg,flex:1}}>Gjøre opp bank og arkivere?</span>
          <button className="action-btn settle" onClick={handleEndCampaign}>Ja, avslutt</button>
          <button className="action-btn" onClick={()=>setShowEndConfirm(false)}><X size={11}/></button>
        </div>
      )}

      <div style={{overflowX:"auto"}}>
        <div style={{minWidth:860,padding:"0 0 12px"}}>
          <div style={{display:"grid",gridTemplateColumns:LINE_GRID,gap:12,padding:"7px 12px",background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
            {["LINJE","FORBRUK MOT PLAN","BRUKT","BUDSJETT","KR/DAG","PACING",""].map(h=>(
              <div key={h} style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:C.ink4,whiteSpace:"nowrap"}}>{h}</div>
            ))}
          </div>
          <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:14}}>
            {Object.entries(grouped).map(([channelName, channelLines])=>{
              const icon=getChannelIcon(channelName);
              return (
                <div key={channelName}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      {icon&&<div style={{width:26,height:26,borderRadius:6,overflow:"hidden",flexShrink:0,background:"#fff"}}>
                        <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>}
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:600,color:C.ink}}>{channelName}</span>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{channelLines.length} linje{channelLines.length!==1?"r":""} · {fmtNOK(channelLines.reduce((a,l)=>a+l.budget,0))}</span>
                    </div>
                    <button className="action-btn" onClick={()=>onAddCampaign&&onAddCampaign(channelName)}><Plus size={12}/> Linje</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column"}}>
                    {channelLines.map(line=>(
                      <CampaignLineRow key={line.flatKey} line={line} task={task} updateCampaign={updateCampaign} onEndChannel={handleEndChannel} onDeleteLine={handleDeleteLine}
                        onBudgetAdjust={(diff)=>adjustBank&&adjustBank(task.customerId,diff)}
                        onAssignLine={async(staff)=>{
                          const {data:profile}=await sb.from("profiles").select("id").eq("email",staff.email).single();
                          if(!profile){alert(staff.name+" har ikke logget inn i AmiDesk ennå.");return;}
                          await updateCampaign(task.id,{ownerId:profile.id});
                          const senderName=session?.user?.user_metadata?.full_name||session?.user?.email||"Noen";
                          await sb.from("notifications").insert({id:uid(),user_id:profile.id,type:"campaign_given",message:senderName+" ga deg kampanjen \""+task.title+"\"",brief_id:null,read:false});
                        }}
                        onShareLine={async(staff)=>{
                          const {data:profile}=await sb.from("profiles").select("id").eq("email",staff.email).single();
                          if(!profile){alert(staff.name+" har ikke logget inn i AmiDesk ennå.");return;}
                          const newShared=[...(task.sharedWith||[])];
                          if(!newShared.includes(profile.id)) newShared.push(profile.id);
                          await updateCampaign(task.id,{sharedWith:newShared});
                          const senderName=session?.user?.user_metadata?.full_name||session?.user?.email||"Noen";
                          await sb.from("notifications").insert({id:uid(),user_id:profile.id,type:"campaign_shared",message:senderName+" delte kampanjen \""+task.title+"\" med deg",brief_id:null,read:false});
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    {transferLine&&<TransferModal
      line={transferLine}
      custTasks={custTasks}
      currentTaskId={task.id}
      onClose={()=>setTransferLine(null)}
      onReturnToBank={()=>doEndChannel(transferLine,null)}
      onTransfer={(target)=>doEndChannel(transferLine,target)}
    />}
  </>
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


const LINE_GRID = "minmax(186px,1.5fr) minmax(146px,1.2fr) 90px 92px 118px 104px 30px";

function PacingBadge({status}) {
  if(status==="ok")    return <span className="pacing-ok"><CircleCheck size={12} strokeWidth={2}/> Pacing OK</span>;
  if(status==="under") return <span className="pacing-warn"><TrendingDown size={12} strokeWidth={2}/> Underspend</span>;
  return <span className="pacing-bad"><TrendingUp size={12} strokeWidth={2}/> Overspend</span>;
}

function CampaignLineRow({line, task, updateCampaign, onEndChannel, onDeleteLine, onAssignLine, onShareLine, onBudgetAdjust}) {
  const [spentVal,setSpentVal]=useState(line.spent||"");
  const [editingName,setEditingName]=useState(false);
  const [nameVal,setNameVal]=useState(
    line.label.includes(" — ")?line.label.split(" — ").slice(1).join(" — "):line.label
  );
  const [editingBudget,setEditingBudget]=useState(false);
  const [budgetVal,setBudgetVal]=useState(line.budget||"");
  const [showActions,setShowActions]=useState(false);
  const [showDateEdit,setShowDateEdit]=useState(false);
  const [pickMode,setPickMode]=useState(null); // null | "assign" | "share"
  const [dateVal,setDateVal]=useState({start:line.chStart,end:line.chEnd});

  const total = daysBetween(line.chStart, line.chEnd);
  const elapsed = Math.min(Math.max(daysBetween(line.chStart, today()),0),total);
  const left = total - elapsed;
  const pct = line.budget>0 ? line.spent/line.budget : 0;
  const exp = total>0 ? elapsed/total : 0;
  let status = "ok";
  if(pct < exp-0.10) status="under";
  else if(pct > exp+0.08) status="over";
  const barColor = status==="ok"?C.okBar:status==="under"?C.warnBar:C.badBar;
  const krPerDag = left>0 ? Math.max(0,(line.budget-line.spent)/left) : 0;

  const lastUpdate = task.lastSpendUpdate ? new Date(task.lastSpendUpdate) : (line.chStart ? new Date(line.chStart) : null);
  const daysSince = lastUpdate ? Math.floor((new Date()-lastUpdate)/(1000*60*60*24)) : 999;
  const isStale = daysSince >= 7 && !(line.chEnd && line.chEnd <= today());

  const saveSpent=()=>{
    const v=spentVal===""?0:+spentVal;
    updateCampaign(task.id,{spent:{...task.spent,[line.flatKey]:v},lastSpendUpdate:new Date().toISOString()});
  };
  const saveName=()=>{
    if(!nameVal.trim()){setEditingName(false);return;}
    const base=line.flatKey.split(" — ")[0];
    const newKey=base+" — "+nameVal.trim();
    if(newKey===line.flatKey){setEditingName(false);return;}
    const nb={...task.channelBudgets}; nb[newKey]=nb[line.flatKey]; delete nb[line.flatKey];
    const ns={...task.spent}; if(ns[line.flatKey]!==undefined){ns[newKey]=ns[line.flatKey];delete ns[line.flatKey];}
    const nd={...(task.channelDates||{})}; if(nd[line.flatKey]){nd[newKey]=nd[line.flatKey];delete nd[line.flatKey];}
    updateCampaign(task.id,{channelBudgets:nb,spent:ns,channelDates:nd});
    setEditingName(false);
  };
  const saveBudget=()=>{
    const newBudget=budgetVal===""?0:+budgetVal;
    const oldBudget=line.budget||0;
    const diff=newBudget-oldBudget;
    updateCampaign(task.id,{
      channelBudgets:{...task.channelBudgets,[line.flatKey]:newBudget},
      budget:Object.values({...task.channelBudgets,[line.flatKey]:newBudget}).reduce((a,b)=>a+b,0),
    });
    if(diff!==0&&onBudgetAdjust) onBudgetAdjust(diff);
    setEditingBudget(false);
  };
  const saveDate=()=>{
    const nd={...(task.channelDates||{}),[line.flatKey]:{start:dateVal.start,end:dateVal.end}};
    updateCampaign(task.id,{channelDates:nd});setShowDateEdit(false);
  };

  const lineName=line.label.includes(" — ")?line.label.split(" — ").slice(1).join(" — "):line.label;
  const staleStyle = isStale ? {background:C.staleRow,boxShadow:"inset 3px 0 0 "+C.staleEdge} : {background:C.card};

  return (
    <div style={{borderRadius:10,border:"1px solid "+C.borderSoft,overflow:"hidden",marginBottom:4,...staleStyle}}>
      <div style={{display:"grid",gridTemplateColumns:LINE_GRID,gap:12,padding:"11px 12px",alignItems:"center"}}>

        <div style={{minWidth:0}}>
          {editingName?(
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <input value={nameVal} onChange={e=>setNameVal(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape")setEditingName(false);}}
                style={{flex:1,padding:"3px 8px",fontSize:12,fontWeight:500,borderRadius:6}} autoFocus/>
              <button className="btn" onClick={saveName} style={{background:C.sand,color:"#fff",padding:"3px 8px",borderRadius:6,fontSize:11}}>OK</button>
              <button className="btn" onClick={()=>setEditingName(false)} style={{background:C.borderSoft,color:C.ink2,padding:"3px 6px",borderRadius:6}}><X size={11}/></button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}} onClick={()=>{setNameVal(lineName);setEditingName(true);}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:600,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{lineName}</div>
              <Pencil size={11} color={C.ink4} style={{flexShrink:0}}/>
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,flexWrap:"wrap"}}>
            <span onClick={()=>setShowDateEdit(!showDateEdit)}
              style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:3,borderBottom:"1px dashed "+C.borderDash,paddingBottom:1}}>
              <Calendar size={10} color={C.ink4}/> {line.chStart+" → "+line.chEnd}
            </span>
            {isStale&&<span style={{display:"inline-flex",alignItems:"center",gap:3,background:C.warnBg,color:C.warnFg,padding:"1px 7px",borderRadius:99,fontSize:9.5,fontFamily:"Roboto,sans-serif",whiteSpace:"nowrap"}}>
              <Clock size={9} strokeWidth={2}/> {daysSince}d uten oppdatering
            </span>}
            {line.hunch&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.sandDeep,background:C.sandBg,padding:"1px 7px",borderRadius:99}}>Hunch −5%</span>}
          </div>
        </div>

        <div>
          <div style={{position:"relative",height:8,borderRadius:99,background:C.divider}}>
            <div style={{position:"absolute",inset:"0 auto 0 0",width:Math.min(pct*100,100)+"%",borderRadius:99,background:barColor,transition:"width .4s"}}/>
            {exp>0&&exp<1&&<div style={{position:"absolute",top:-3,bottom:-3,left:exp*100+"%",width:2,borderRadius:2,background:"#2B2F36",opacity:.42}}/>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,marginTop:4}}>
            <span>{Math.round(pct*100)}% brukt</span>
            <span>plan {Math.round(exp*100)}%</span>
          </div>
        </div>

        <div>
          <input type="number" value={spentVal} onChange={e=>setSpentVal(e.target.value)}
            onBlur={saveSpent} onKeyDown={e=>e.key==="Enter"&&(saveSpent(),e.target.blur())}
            placeholder="0" style={{width:"100%",padding:"5px 8px",fontSize:12,textAlign:"right",fontWeight:500,borderRadius:8}}/>
        </div>

        <div>
          {editingBudget?(
            <input type="number" value={budgetVal} onChange={e=>setBudgetVal(e.target.value)}
              onBlur={saveBudget} onKeyDown={e=>e.key==="Enter"&&saveBudget()}
              style={{width:"100%",padding:"5px 8px",fontSize:12,textAlign:"right",borderRadius:8}} autoFocus/>
          ):(
            <div onClick={()=>{setBudgetVal(line.budget||"");setEditingBudget(true);}}
              style={{cursor:"pointer",fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink2,textAlign:"right",borderBottom:"1px dashed "+C.borderDash,paddingBottom:1,whiteSpace:"nowrap"}}>
              {fmtNOK(line.hunch?line.netBudget:line.budget)}
            </div>
          )}
        </div>

        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:700,color:C.ink,whiteSpace:"nowrap"}}>{fmtNOK(krPerDag)}/dag</div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3}}>{left}d igjen</div>
        </div>

        <div><PacingBadge status={status}/></div>

        <div style={{display:"flex",justifyContent:"center"}}>
          <button className="btn" onClick={()=>setShowActions(!showActions)}
            style={{background:showActions?C.sandBg:"none",color:showActions?C.sand:C.ink3,padding:"4px",borderRadius:6,border:"1px solid "+(showActions?C.sandBd:C.borderSoft)}}>
            <MoreHorizontal size={16} strokeWidth={1.75}/>
          </button>
        </div>
      </div>

      {showDateEdit&&(
        <div className="action-stripe">
          <Calendar size={12} color={C.ink3}/>
          <input type="date" value={dateVal.start} onChange={e=>setDateVal(f=>({...f,start:e.target.value}))} style={{width:140,padding:"4px 8px",fontSize:11,borderRadius:7}}/>
          <span style={{color:C.ink3,fontSize:11}}>→</span>
          <input type="date" value={dateVal.end} onChange={e=>setDateVal(f=>({...f,end:e.target.value}))} style={{width:140,padding:"4px 8px",fontSize:11,borderRadius:7}}/>
          <button className="action-btn" onClick={saveDate}>Lagre datoer</button>
          <button className="action-btn" onClick={()=>setShowDateEdit(false)}><X size={12}/></button>
        </div>
      )}

      {showActions&&(
        <div className="action-stripe" style={{flexDirection:"column",alignItems:"stretch",gap:8}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button className={`action-btn${pickMode==="assign"?" settle":""}`} onClick={()=>setPickMode(pickMode==="assign"?null:"assign")}><UserPlus size={13} strokeWidth={1.75}/> Tildel ressurs</button>
            <button className={`action-btn${pickMode==="share"?" settle":""}`} onClick={()=>setPickMode(pickMode==="share"?null:"share")}><Share2 size={13} strokeWidth={1.75}/> Del med kollega</button>
            <button className="action-btn settle" onClick={()=>{setShowActions(false);setPickMode(null);onEndChannel&&onEndChannel(line);}}><Wallet size={13} strokeWidth={1.75}/> Avslutt — oppgjør til bank</button>
            <button className="action-btn danger" onClick={()=>{setShowActions(false);setPickMode(null);onDeleteLine&&onDeleteLine(line.flatKey);}}><Trash2 size={13} strokeWidth={1.75}/> Slett — rest tilbake</button>
            <button className="action-btn" onClick={()=>{setShowActions(false);setPickMode(null);}} style={{marginLeft:"auto"}}><X size={13}/></button>
          </div>
          {pickMode&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"6px 0"}}>
              <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,alignSelf:"center"}}>{pickMode==="assign"?"Gi til:":"Del med:"}</span>
              {staffForChannel(line.flatKey.split(" — ")[0]).map(s=>(
                <button key={s.id} className="action-btn" onClick={()=>{
                  if(pickMode==="assign") onAssignLine&&onAssignLine(s);
                  else onShareLine&&onShareLine(s);
                  setShowActions(false);setPickMode(null);
                }} style={{fontFamily:"Roboto,sans-serif",fontSize:11}}>
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
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
        <button className="btn" onClick={()=>navigate("campaigns")} style={{background:C.borderSoft,color:C.ink,padding:"6px 12px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:12}}>← Tilbake</button>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:30,fontWeight:500,flex:1}}>{task.title}</h1>
        <StatusDot status={task.status} onChange={s=>updateCampaign(task.id,{status:s})}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
        <div className="card" style={{padding:"20px 24px"}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:12}}>Kanaler</div>
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
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:2}}>{r.label}</div>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:13}}>{r.value}</div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={()=>{if(confirm("Arkiver kampanje?")){updateCampaign(task.id,{archived:true});navigate("campaigns");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:C.borderSoft,color:C.ink3,border:"none"}}>Arkiver kampanje</button>
          <button className="btn" onClick={()=>{if(confirm(`Slett kampanjen permanent?`)){deleteCampaign(task.id);navigate("campaigns");}}}
            style={{padding:"9px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:12,background:"none",color:C.badFg,border:`1px solid ${C.badFg}60`}}>Slett kampanje</button>
        </div>
      </div>
    </div>
  );
}

// ══ Customer List ══════════════════════════════════════════════════
function CustomerList({customers, tasks, briefs, navigate, setShowCreateCustomer, onAddCampaign, favoriteCustomers=[], toggleFavorite}) {
  const [search,setSearch]=useState("");
  const [showOnlyFavorites,setShowOnlyFavorites]=useState(favoriteCustomers.length>0);
  const hasFavorites=favoriteCustomers.length>0;

  const filtered=customers
    .filter(c=>showOnlyFavorites?favoriteCustomers.includes(c.id):true)
    .filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.industry||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:32,fontWeight:600,color:C.ink,letterSpacing:"-.02em"}}>Kunder</h1>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {hasFavorites&&(
            <div style={{display:"flex",background:C.borderSoft,borderRadius:99,padding:3}}>
              <button onClick={()=>setShowOnlyFavorites(false)}
                style={{padding:"5px 14px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:12,border:"none",cursor:"pointer",background:!showOnlyFavorites?C.card:"transparent",color:!showOnlyFavorites?C.ink:C.ink3,boxShadow:!showOnlyFavorites?"0 1px 3px rgba(43,47,54,.1)":"none",transition:"all .15s"}}>
                Alle kunder
              </button>
              <button onClick={()=>setShowOnlyFavorites(true)}
                style={{padding:"5px 14px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:12,border:"none",cursor:"pointer",background:showOnlyFavorites?C.card:"transparent",color:showOnlyFavorites?C.ink:C.ink3,boxShadow:showOnlyFavorites?"0 1px 3px rgba(43,47,54,.1)":"none",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
                ★ Mine kunder
              </button>
            </div>
          )}
          {setShowCreateCustomer&&<button className="btn" onClick={setShowCreateCustomer} style={{background:C.sand,color:"#fff",padding:"9px 18px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:13,display:"flex",alignItems:"center",gap:6}}><Plus size={14}/> Ny kunde</button>}
        </div>
      </div>
      <div style={{position:"relative",marginBottom:20}}>
        <Search size={14} color={C.ink3} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Søk på navn eller bransje..." style={{paddingLeft:36,borderRadius:10}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
        {filtered.map(c=>{
          const cTasks=tasks.filter(t=>t.customerId===c.id&&!t.archived);
          const cBriefs=briefs.filter(b=>b.customerId===c.id&&!b.archived);
          const isFav=favoriteCustomers.includes(c.id);
          return (
            <div key={c.id} className="card" style={{padding:"20px 22px",cursor:"pointer",position:"relative"}} onClick={()=>navigate("customer-detail",{customerId:c.id})}>
              {/* Favorite star */}
              <button className="btn" onClick={e=>{e.stopPropagation();toggleFavorite&&toggleFavorite(c.id);}}
                style={{position:"absolute",top:14,right:14,background:"none",color:isFav?"#E8B84B":C.ink4,fontSize:18,padding:"2px 4px",lineHeight:1,border:"none"}}>
                {isFav?<Star size={16} fill={C.sand} color={C.sand}/>:<Star size={16} color={C.ink4}/>}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingRight:28}}>
                <CustomerAvatar customer={c} size={44} fontSize={14}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:16,fontWeight:600,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginTop:1}}>{c.industry||"—"}</div>
                </div>
              </div>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:(c.bank||0)>0?C.okFg:C.ink3,marginBottom:12,fontWeight:(c.bank||0)>0?500:400}}>
                {(c.bank||0)>0 ? "Bank: "+fmtNOK(c.bank) : "Ikke fylt inn"}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{background:C.borderSoft,color:C.ink2,padding:"3px 10px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:11,whiteSpace:"nowrap"}}>{cTasks.length} kampanjer</span>
                {cBriefs.length>0&&<span style={{background:C.sandBg,color:C.sandDeep,padding:"3px 10px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:11,whiteSpace:"nowrap"}}>{cBriefs.length} oppgaver</span>}
                {onAddCampaign&&<button className="btn" onClick={e=>{e.stopPropagation();onAddCampaign(c);}}
                  style={{background:C.sand,color:"#fff",padding:"3px 11px",borderRadius:99,fontFamily:"Roboto,sans-serif",fontSize:11,marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><Plus size={11}/> Kampanje</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══ Customer Detail ════════════════════════════════════════════════
const DEPTS = [
  {key:"some", label:"SOME", channels:["Meta","Hunch - Meta","Snapchat","Hunch - Snapchat","TikTok","LinkedIn","Pinterest","Reddit","Apple Search Ads","TikTok Search Ads"]},
  {key:"sem",  label:"SEM",  channels:["Google Ads","Microsoft Ads"]},
  {key:"prog", label:"Programmatisk", channels:["DV360","Kobler","ReadPeak","Adnuntius","Hawk"]},
];

function DeptCard({dept, budget, spent, allTasks, onSave, canEdit}) {
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(budget||"");
  const rest=budget-spent;
  const pct=budget>0?Math.min(100,Math.round(spent/budget*100)):0;
  return (
    <div className="card" style={{padding:"18px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:16,fontWeight:600,color:C.ink}}>{dept.label}</div>
        {editing?(
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input type="number" value={val} onChange={e=>setVal(e.target.value)}
              style={{width:130,textAlign:"right",padding:"4px 8px",fontSize:12}} autoFocus
              onKeyDown={e=>{if(e.key==="Enter"){onSave(+val);setEditing(false);}if(e.key==="Escape")setEditing(false);}}/>
            <button className="action-btn settle" onClick={()=>{onSave(+val);setEditing(false);}}>Lagre</button>
            <button className="action-btn" onClick={()=>setEditing(false)}><X size={11}/></button>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:600,color:C.ink}}>{budget?fmtNOK(budget):"Ikke satt"}</span>
            {canEdit&&<button className="action-btn" onClick={()=>{setVal(budget||"");setEditing(true);}}>Sett budsjett</button>}
          </div>
        )}
      </div>
      {budget>0&&(
        <>
          <div style={{height:8,borderRadius:99,background:C.divider,marginBottom:6,position:"relative"}}>
            <div style={{position:"absolute",inset:"0 auto 0 0",width:pct+"%",borderRadius:99,background:rest<0?C.badBar:C.okBar,transition:"width .4s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>
            <span>Brukt + budsjettert: <strong style={{color:C.ink}}>{fmtNOK(spent)}</strong> ({pct}%)</span>
            <span style={{color:rest<0?C.badFg:C.okFg}}>Disponibelt: <strong>{fmtNOK(rest)}</strong></span>
          </div>
        </>
      )}
      {!budget&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Brukt så langt: {fmtNOK(spent)}</div>}
      <div style={{marginTop:12,borderTop:"1px solid "+C.borderSoft,paddingTop:10}}>
        <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.ink4,marginBottom:6}}>Kanaler</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {dept.channels.map(ch=>{
            const chSpent=allTasks.reduce((sum,t)=>{
              const activeSp=Object.entries(t.spent||{}).reduce((a,[key,v])=>
                key.split(" — ")[0].toLowerCase().includes(ch.toLowerCase())?a+v:a,0);
              const archivedSp=(t.archivedLines||[]).reduce((a,l)=>{
                const lch=(l.label||l.flatKey||"").split(" — ")[0];
                return lch.toLowerCase().includes(ch.toLowerCase())?a+(l.spent||0):a;
              },0);
              return sum+activeSp+archivedSp;
            },0);
            if(!chSpent) return null;
            return <span key={ch} style={{fontFamily:"Roboto,sans-serif",fontSize:11,background:C.borderSoft,color:C.ink2,padding:"3px 10px",borderRadius:99}}>{ch}: {fmtNOK(chSpent)}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

function BankTab({customer, activeTasks, archivedTasks, updateCustomer, editableDepts=[]}) {
  const allTasks=[...activeTasks,...archivedTasks];
  const deptBudgets=customer.deptBudgets||{};
  const spentPerDept={};
  DEPTS.forEach(dept=>{
    spentPerDept[dept.key]=allTasks.reduce((sum,t)=>{
      // Active line spent
      const activeSp=Object.entries(t.spent||{}).reduce((a,[key,val])=>{
        const ch=key.split(" — ")[0];
        return dept.channels.some(dc=>ch.toLowerCase().includes(dc.toLowerCase()))?a+val:a;
      },0);
      // Archived lines spent
      const archivedSp=(t.archivedLines||[]).reduce((a,l)=>{
        const ch=(l.label||l.flatKey||"").split(" — ")[0];
        return dept.channels.some(dc=>ch.toLowerCase().includes(dc.toLowerCase()))?a+(l.spent||0):a;
      },0);
      // Active budgeted (not yet spent) — already committed from bank
      const activeBudgeted=t.archived?0:Object.entries(t.channelBudgets||{}).reduce((a,[key,bud])=>{
        const ch=key.split(" — ")[0];
        const spent=t.spent?.[key]||0;
        return dept.channels.some(dc=>ch.toLowerCase().includes(dc.toLowerCase()))?a+(bud-spent):a;
      },0);
      return sum+activeSp+archivedSp+activeBudgeted;
    },0);
  });
  const totalDeptBudget=DEPTS.reduce((a,d)=>a+(deptBudgets[d.key]||0),0);
  const totalSpent=DEPTS.reduce((a,d)=>a+spentPerDept[d.key],0);
  const saveDept=(key,val)=>{
    updateCustomer&&updateCustomer(customer.id,{deptBudgets:{...deptBudgets,[key]:val}});
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"Total årsbudsjett",value:fmtNOK(totalDeptBudget),color:C.ink},
          {label:"Brukt + aktivt budsjettert",value:fmtNOK(totalSpent),color:C.badFg},
          {label:"Disponibelt",value:fmtNOK(totalDeptBudget-totalSpent),color:(totalDeptBudget-totalSpent)<0?C.badFg:C.okFg},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:"16px 18px"}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:C.ink3,marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:600,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>
      {DEPTS.map(dept=>(
        <DeptCard key={dept.key} dept={dept}
          budget={deptBudgets[dept.key]||0}
          spent={spentPerDept[dept.key]||0}
          allTasks={allTasks}
          onSave={val=>saveDept(dept.key,val)}
          canEdit={editableDepts.includes(dept.key)}/>
      ))}
    </div>
  );
}

function CustomerDetail({customer, tasks, briefs, updateCampaign, updateCustomer, navigate, onAddCampaign, session, teamMembers=[]}) {
  const [tab,setTab]=useState("active");
  const [bankMode,setBankMode]=useState(null); // null | "deposit"
  const [bankDept,setBankDept]=useState("");
  const [bankInput,setBankInput]=useState("");
  const [showEdit,setShowEdit]=useState(false);

  const userId=session?.user?.id;
  const userProfile=teamMembers.find(m=>m.id===userId);
  const isAdmin=ADMIN_EMAILS.includes(session?.user?.email||"");
  const userDepts=userProfile?.departments||[];

  // Which depts can this user edit
  const editableDepts=isAdmin
    ? DEPTS.map(d=>d.key)
    : DEPTS.filter(d=>userDepts.some(ud=>d.label.toLowerCase()===ud.toLowerCase())).map(d=>d.key);

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

  // Total spent (archived lines + active spent)
  const totalSpentHistorik = [...activeTasks,...archivedTasks].reduce((sum,t)=>{
    return sum + Object.values(t.spent||{}).reduce((a,b)=>a+b,0);
  },0);

  const saveBank=()=>{
    const val=+bankInput;
    if(isNaN(val)||val<=0||!bankDept) return;
    const dept=DEPTS.find(d=>d.key===bankDept);
    if(!dept) return;
    const newDeptBudgets={...(customer.deptBudgets||{}),[bankDept]:(customer.deptBudgets?.[bankDept]||0)+val};
    updateCustomer(customer.id,{deptBudgets:newDeptBudgets,bank:(customer.bank||0)+val});
    setBankMode(null);setBankInput("");setBankDept("");
  };

  return (
    <>
      <div>
      {/* Header */}
      <div style={{marginBottom:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <button className="btn" onClick={()=>navigate("customers")} style={{background:C.borderSoft,color:C.ink,padding:"6px 12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:12,flexShrink:0}}>← Tilbake</button>
          <CustomerAvatar customer={customer} size={48} fontSize={15}/>
          <div style={{flex:1,minWidth:0}}>
            <h1 style={{fontFamily:"'Montserrat',sans-serif",fontSize:36,fontWeight:600,color:C.ink,letterSpacing:"-.02em",lineHeight:1.1}}>{customer.name}</h1>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginTop:3}}>{customer.industry}{customer.contact?" · "+customer.contact:""}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            {updateCustomer&&<div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={()=>onAddCampaign&&onAddCampaign(customer)}
                style={{background:C.sand,color:"#fff",padding:"5px 12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:11}}>+ Lag kampanje</button>
              <button className="btn" onClick={()=>setShowEdit(true)} style={{background:C.borderSoft,color:C.ink,padding:"5px 12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:11,border:"1px solid "+C.border}}>Rediger kunde</button>
            </div>}
          {/* Bank */}
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:4}}>Kundebank</div>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
              <span style={{fontFamily:"'Montserrat',sans-serif",fontSize:26,fontWeight:600,color:(customer.bank||0)<0?C.badFg:C.okFg}}>{fmtNOK(customer.bank||0)}</span>
              {editableDepts.length>0&&!bankMode&&(
                <button className="action-btn" onClick={()=>{setBankMode("deposit");setBankDept(editableDepts.length===1?editableDepts[0]:"");}}>+ Innskudd</button>
              )}
            </div>
            {bankMode==="deposit"&&(
              <div style={{display:"flex",gap:6,alignItems:"center",marginTop:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                {editableDepts.length>1&&(
                  <select value={bankDept} onChange={e=>setBankDept(e.target.value)} style={{padding:"5px 8px",fontSize:12,width:"auto"}}>
                    <option value="">Velg avdeling...</option>
                    {DEPTS.filter(d=>editableDepts.includes(d.key)).map(d=><option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                )}
                {editableDepts.length===1&&(
                  <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.sandDeep,background:C.sandBg,padding:"4px 10px",borderRadius:99}}>
                    {DEPTS.find(d=>d.key===editableDepts[0])?.label}
                  </span>
                )}
                <input type="number" value={bankInput} onChange={e=>setBankInput(e.target.value)}
                  style={{width:130,textAlign:"right",padding:"5px 8px",fontSize:12}} placeholder="Beløp NOK" autoFocus
                  onKeyDown={e=>e.key==="Enter"&&saveBank()}/>
                <button className="action-btn settle" onClick={saveBank}>Lagre</button>
                <button className="action-btn" onClick={()=>{setBankMode(null);setBankInput("");setBankDept("");}}><X size={12}/></button>
              </div>
            )}
            {/* Tilgode */}
            {(()=>{
              const tilgodeHistorik=[...activeTasks,...archivedTasks].reduce((sum,t)=>{
                return sum+(t.archivedLines||[]).reduce((a,l)=>a+((l.budget||0)-(l.spent||0)),0);
              },0);
              const restspendBrukt=[...activeTasks,...archivedTasks].reduce((sum,t)=>sum+(t.restspendUsed||0),0)
                +briefs.filter(b=>b.customerId===customer.id).reduce((sum,b)=>sum+(b.restspendUsed||0),0);
              const netto=tilgodeHistorik-restspendBrukt;
              if(netto===0) return null;
              return (
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+C.borderSoft}}>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:2}}>Returnert fra avsluttede linjer</div>
                  <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:600,color:netto<0?C.badFg:C.okFg}}>{fmtNOK(netto)}</div>
                  <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,marginTop:2}}>
                    {fmtNOK(tilgodeHistorik)} returnert{restspendBrukt>0?" − "+fmtNOK(restspendBrukt)+" brukt som restspend":""} · ligger i kundebank
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <div style={{height:1,background:C.border,margin:"16px 0 0"}}/>
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        {["active","history","bank",...(hunchEntries.length>0?["hunch"]:[])].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="active"?"Aktive":t==="history"?"Historikk":t==="bank"?"Bank":"Hunch fees"}
          </div>
        ))}
      </div>

      {tab==="active"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20,alignItems:"start"}}>
          <div>
            {activeBriefs.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,letterSpacing:".07em",textTransform:"uppercase",color:C.ink3,marginBottom:8}}>Oppgaver</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {activeBriefs.map(b=>(
                    <div key={b.id} className="card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderLeft:"3px solid "+C.sand}} onClick={()=>navigate("brief-detail",{briefId:b.id})}>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:500,fontSize:14}}>{b.title}</div>
                        <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{b.start&&b.end?b.start+" → "+b.end:""}</div>
                      </div>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,background:C.borderSoft,padding:"2px 8px",borderRadius:8}}>{b.status==="startet"?"Startet":"Ny"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTasks.length>0&&(
              <div>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,fontWeight:600,color:C.ink,marginBottom:10}}>Aktive kampanjelinjer</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {activeTasks.flatMap(task=>{
                    const lines=getChannelLines(task);
                    return lines.map(line=>{
                      const icon=getChannelIcon(line.label.split(" — ")[0]);
                      const pct=line.budget>0?Math.min(100,Math.round(line.spent/line.budget*100)):0;
                      return (
                        <div key={line.flatKey} className="card" style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                          {icon&&<div style={{width:24,height:24,borderRadius:5,overflow:"hidden",flexShrink:0,background:"#fff"}}>
                            <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          </div>}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{line.label.includes(" — ")?line.label.split(" — ").slice(1).join(" — "):line.label}</div>
                            <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,marginTop:1}}>{line.chStart} → {line.chEnd}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink2}}>{fmtNOK(line.spent)} / {fmtNOK(line.budget)}</div>
                            <div style={{height:4,width:80,background:C.divider,borderRadius:99,marginTop:4}}>
                              <div style={{height:"100%",width:pct+"%",background:C.okBar,borderRadius:99}}/>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            )}
            {activeBriefs.length===0&&activeTasks.length===0&&<div style={{fontFamily:"Roboto,sans-serif",color:C.ink3,padding:"40px 0",textAlign:"center"}}>Ingen aktive oppgaver eller kampanjer.</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div className="card" style={{padding:"16px 18px"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:C.ink3,marginBottom:12}}>Merkevarefarger</div>
              <div style={{display:"flex",gap:20}}>
                <ColorSwatch color={customer.colorPrimary} label="Primær" onChange={v=>updateCustomer&&updateCustomer(customer.id,{colorPrimary:v})}/>
                <ColorSwatch color={customer.colorSecondary} label="Sekundær" onChange={v=>updateCustomer&&updateCustomer(customer.id,{colorSecondary:v})}/>
              </div>
            </div>
            <div className="card" style={{padding:"16px 18px"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Kundekontakt</div>
              {customer.contactName&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,marginBottom:6}}>{customer.contactName}</div>}
              {customer.contactPhone&&<div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginBottom:4}}><Phone size={12} color={C.ink4}/>{customer.contactPhone}</div>}
              {customer.contactEmail&&<div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}><Mail size={12} color={C.ink4}/>{customer.contactEmail}</div>}
              {!customer.contactName&&!customer.contactEmail&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen kontakt registrert.</div>}
            </div>
            <div className="card" style={{padding:"16px 18px"}}>
              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Rådgiver</div>
              {customer.advisorId?(()=>{const s=AMIDAYS_STAFF.find(x=>x.id===customer.advisorId);return s?<div><div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,marginBottom:4}}>{s.name}</div><div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}><Mail size={12} color={C.ink4}/>{s.email}</div></div>:null;})():<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink4}}>Ingen rådgiver tildelt.</div>}
            </div>
            {(customer.resources||[]).length>0&&(
              <div className="card" style={{padding:"16px 18px"}}>
                <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:C.ink3,marginBottom:10}}>Ressurser</div>
                {(customer.resources||[]).map((r,i)=>{
                  const s=AMIDAYS_STAFF.find(x=>x.id===r.staffId);
                  const profile=teamMembers.find(m=>m.email===s?.email);
                  if(!s) return null;
                  const initials=s.name.split(" ").map(w=>w[0]).join("").slice(0,2);
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      {profile?.avatar_url
                        ?<img src={profile.avatar_url} alt={s.name} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                        :<div style={{width:32,height:32,borderRadius:"50%",background:C.sandBg,color:C.sandDeep,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:600,flexShrink:0}}>{initials}</div>
                      }
                      <div>
                        <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.ink}}>{s.name}</div>
                        {r.department&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{r.department}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {tab==="history"&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {archivedBriefs.length===0&&[...activeTasks,...archivedTasks].every(t=>!(t.archivedLines||[]).length)&&
            <div style={{fontFamily:"Roboto,sans-serif",color:C.ink3,padding:"40px 0",textAlign:"center"}}>Ingen historikk ennå.</div>}

          {archivedBriefs.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,fontWeight:600,color:C.ink3,letterSpacing:".06em",textTransform:"uppercase",padding:"0 0 8px",borderBottom:"2px solid "+C.border,marginBottom:12}}>Oppgaver</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {archivedBriefs.map(b=>(
                  <div key={b.id} className="card" style={{padding:"12px 16px",opacity:.7}}>
                    <div style={{fontWeight:500,fontSize:14,color:C.ink}}>{b.title}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>Oppgave · Avsluttet</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(()=>{
            // Collect all archived lines with month
            const allLines=[...activeTasks,...archivedTasks].flatMap(task=>
              (task.archivedLines||[]).map(line=>({...line,taskId:task.id}))
            );
            if(allLines.length===0) return null;

            // Group by month (use settledAt or end date)
            const byMonth={};
            allLines.forEach(line=>{
              const dateStr=line.settledAt||line.end||"";
              const d=dateStr?new Date(dateStr):null;
              const key=d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`:"ukjent";
              const label=d?d.toLocaleString("nb-NO",{month:"long",year:"numeric"}):"Ukjent periode";
              if(!byMonth[key]) byMonth[key]={label,lines:[]};
              byMonth[key].lines.push(line);
            });

            // Sort newest first
            return Object.entries(byMonth)
              .sort(([a],[b])=>b.localeCompare(a))
              .map(([key,{label,lines}])=>{
                const monthTotal=lines.reduce((a,l)=>a+(l.spent||0),0);
                const monthBudget=lines.reduce((a,l)=>a+(l.budget||0),0);
                const monthRest=monthBudget-monthTotal;
                return (
                  <div key={key} style={{marginBottom:28}}>
                    <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",padding:"0 0 8px",borderBottom:"2px solid "+C.border,marginBottom:12}}>
                      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,fontWeight:600,color:C.ink,textTransform:"capitalize"}}>{label}</div>
                      <div style={{display:"flex",gap:16,fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>
                        <span>Brukt: <strong style={{color:C.ink}}>{fmtNOK(monthTotal)}</strong></span>
                        <span style={{color:monthRest>=0?C.okFg:C.badFg}}>Rest: <strong>{fmtNOK(monthRest)}</strong></span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {lines.map((line,i)=>{
                        const icon=getChannelIcon((line.label||line.flatKey||"").split(" — ")[0]);
                        const rest=(line.budget||0)-(line.spent||0);
                        const lineName=(line.label||line.flatKey||"").includes(" — ")
                          ?(line.label||line.flatKey).split(" — ").slice(1).join(" — ")
                          :(line.label||line.flatKey||"");
                        return (
                          <div key={i} className="card" style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                            {icon&&<div style={{width:24,height:24,borderRadius:5,overflow:"hidden",flexShrink:0,background:"#fff"}}>
                              <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            </div>}
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:500,color:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lineName}</div>
                              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3,marginTop:1}}>{line.start||""}{line.end?" → "+line.end:""}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink2}}>{fmtNOK(line.spent||0)} / {fmtNOK(line.budget||0)}</div>
                              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:rest>=0?C.okFg:C.badFg,marginTop:2}}>
                                {rest>=0?"Rest +":"Overspend "}{fmtNOK(Math.abs(rest))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      )}
      {tab==="bank"&&<BankTab customer={customer} activeTasks={activeTasks} archivedTasks={archivedTasks} updateCustomer={updateCustomer} editableDepts={editableDepts}/>}
      {tab==="hunch"&&(
        <div>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginBottom:16}}>5% tech fee trekkes automatisk fra budsjett på Hunch-kanaler.</div>
          {Object.entries(hunchByMonth).map(([month,entries])=>(
            <div key={month} style={{marginBottom:20}}>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:18,fontWeight:500,marginBottom:10,textTransform:"capitalize"}}>{month}</div>
              {entries.map((e,i)=>(
                <div key={i} className="card" style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500}}>{e.channel}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>{e.taskTitle}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.badFg}}>Hunch fee: {fmtNOK(e.fee)}</div>
                    <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>av {fmtNOK(e.spent)} forbruk</div>
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
              return <span key={key} style={{fontFamily:"Roboto,sans-serif",fontSize:11,background:`${C.sand}30`,color:C.sand,padding:"2px 8px",borderRadius:8,display:"flex",alignItems:"center",gap:4}}>
                {key}<span style={{cursor:"pointer",opacity:.7}} onClick={()=>sub?toggleSub(ch,sub):toggleChannel(ch)}><X size={11}/></span>
              </span>;
            });
          })}
        </div>
      )}
      {Object.entries(CHANNEL_COHORTS).map(([cohort,chans])=>(
        <div key={cohort} style={{marginBottom:6}}>
          <div onClick={()=>setOpenCohort(openCohort===cohort?null:cohort)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:C.bg,border:"1px solid "+C.border,borderRadius:openCohort===cohort?"4px 4px 0 0":"4px",cursor:"pointer"}}>
            <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink}}>{cohort}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {Object.keys(chans).filter(ch=>channels[ch]).length>0&&(
                <span style={{fontFamily:"Roboto,sans-serif",fontSize:10,background:`${C.sand}30`,color:C.sand,padding:"1px 7px",borderRadius:8}}>
                  {Object.keys(chans).filter(ch=>channels[ch]).length} valgt
                </span>
              )}
              <span style={{color:C.ink3,fontSize:12}}>{openCohort===cohort?"▲":"▼"}</span>
            </div>
          </div>
          {openCohort===cohort&&(
            <div style={{border:"1px solid "+C.border,borderTop:"none",borderRadius:"0 0 4px 4px",padding:"8px",display:"flex",flexDirection:"column",gap:4,background:C.cardAlt}}>
              {Object.entries(chans).map(([ch,subs])=>{
                const selected=!!channels[ch];
                return (
                  <div key={ch} style={{borderRadius:3,border:`1px solid ${selected?C.sand:C.border}`,background:selected?`${C.sand}10`:"transparent"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",cursor:"pointer"}} onClick={()=>toggleChannel(ch)}>
                      <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${selected?C.sand:C.border}`,background:selected?C.sand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {selected&&<span style={{color:"#fff",fontSize:9}}>✓</span>}
                      </div>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink,flex:1,display:"flex",alignItems:"center",gap:6}}>
                        {CHANNEL_ICONS[ch]&&<img src={CHANNEL_ICONS[ch]} alt="" style={{width:16,height:16,borderRadius:3,objectFit:"contain"}}/>}
                        {ch}
                      </span>
                      {isHunch(ch)&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.badFg}}>−5% fee</span>}
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
function CreateBriefModal({customers, tasks=[], onClose, onSave}) {
  const [form,setForm]=useState({customerId:"",title:"",description:"",start:today(),end:"",assignedTo:"",channels:{}});
  const [campaignLines,setCampaignLines]=useState([]);
  const [useRestspend,setUseRestspend]=useState(false);
  const [restspendAmount,setRestspendAmount]=useState("");

  const selectedCustomer=customers.find(c=>c.id===form.customerId);
  // Calculate available restspend for selected customer
  const allCustomerTasks=tasks.filter(t=>t.customerId===form.customerId);
  const tilgode=Math.max(0,
    allCustomerTasks.reduce((sum,t)=>{
      return sum+(t.archivedLines||[]).reduce((a,l)=>a+((l.budget||0)-(l.spent||0)),0);
    },0)
    - allCustomerTasks.reduce((sum,t)=>sum+(t.restspendUsed||0),0)
    - tasks.filter(b=>b.customerId===form.customerId).reduce((s,b)=>s+(b.restspendUsed||0),0)
  );

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
    setCampaignLines(prev=>[...prev,{id:uid(),flatKey,name:"Kampanje "+(count+1),budget:0,hunch:isHunch(flatKey)}]);
  };
  const removeLine=id=>setCampaignLines(prev=>prev.filter(cl=>cl.id!==id));
  const updateLine=(id,changes)=>setCampaignLines(prev=>prev.map(cl=>cl.id===id?{...cl,...changes}:cl));
  const baseBudget=campaignLines.reduce((a,cl)=>a+(cl.budget||0),0);
  const restAmount=useRestspend?(+restspendAmount||0):0;
  const total=baseBudget+restAmount;

  const save=()=>{
    if(!form.customerId||!form.title) return alert("Fyll inn kunde og tittel");
    if(!form.end) return alert("Fyll inn sluttdato");
    const channelBudgets={};
    campaignLines.forEach(cl=>{channelBudgets[cl.flatKey+" — "+cl.name]=cl.budget||0;});
    onSave({
      id:uid(),...form,
      assignedTo:form.assignedTo?[form.assignedTo]:[],
      channels:form.channels,channelBudgets,status:"ny",archived:false,
      restspendUsed:restAmount,
    });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:"92vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:600,color:C.ink}}>Ny oppgave</h2>
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div><label>Kunde</label>
            <select value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))} style={{width:"100%"}}>
              <option value="">Velg kunde...</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name} — Bank: {fmtNOK(c.bank||0)}</option>)}
            </select>
          </div>
          <div><label>Ressurs</label>
            <select value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))} style={{width:"100%"}}>
              <option value="">Ikke tildelt</option>
              {CHANNEL_STAFF.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {selectedCustomer&&(
          <div style={{background:C.cardAlt,borderRadius:9,padding:"10px 14px",marginBottom:12,border:"1px solid "+C.borderSoft,display:"flex",gap:20,fontFamily:"Roboto,sans-serif",fontSize:12}}>
            <span style={{color:C.ink3}}>Kundebank: <strong style={{color:C.ink}}>{fmtNOK(selectedCustomer.bank||0)}</strong></span>
            {tilgode!==0&&<span style={{color:tilgode>0?C.okFg:C.badFg}}>Tilgode: <strong>{fmtNOK(tilgode)}</strong></span>}
          </div>
        )}

        <div style={{marginBottom:12}}><label>Tittel</label>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="f.eks. Meta | Always On | Oktober 2026"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div><label>Startdato</label><input type="date" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/></div>
          <div><label>Sluttdato</label><input type="date" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/></div>
        </div>
        <div style={{marginBottom:12}}><label>Brief / Beskrivelse</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{minHeight:60,resize:"vertical"}} placeholder="Mål, målgruppe, budskap..."/>
        </div>
        <div style={{marginBottom:14}}><label>Kanaler</label>
          <ChannelDropdown channels={form.channels} onChange={handleChannelChange}/>
        </div>

        {selectedLines.length>0&&(
          <div style={{marginBottom:16}}>
            <label>Kampanjelinjer og budsjett</label>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
              {selectedLines.map(line=>{
                const linesForChannel=campaignLines.filter(cl=>cl.flatKey===line.flatKey);
                return (
                  <div key={line.flatKey} style={{background:C.cardAlt,borderRadius:9,border:"1px solid "+C.borderSoft,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:600,color:C.ink}}>
                        {line.label}{line.hunch&&<span style={{color:C.badFg,fontSize:10,marginLeft:6}}>−5% fee</span>}
                      </span>
                      <button className="action-btn" onClick={()=>addLine(line.flatKey)}><Plus size={11}/> Legg til linje</button>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {linesForChannel.map(cl=>(
                        <div key={cl.id} style={{display:"grid",gridTemplateColumns:"1fr 120px auto",gap:8,alignItems:"center"}}>
                          <input value={cl.name} onChange={e=>updateLine(cl.id,{name:e.target.value})} placeholder="Linjenavn"/>
                          <input type="number" value={cl.budget||""} onChange={e=>updateLine(cl.id,{budget:+e.target.value})} style={{textAlign:"right"}} placeholder="0"/>
                          {linesForChannel.length>1&&<button className="btn" onClick={()=>removeLine(cl.id)} style={{background:"none",color:C.badFg,padding:"2px 4px",border:"1px solid "+C.badBg,borderRadius:6}}><X size={13}/></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Restspend */}
            {selectedCustomer&&tilgode>0&&(
              <div style={{marginTop:10,padding:"10px 14px",background:C.sandBg,borderRadius:9,border:"1px solid "+C.sandBd}}>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:0}}>
                  <input type="checkbox" checked={useRestspend} onChange={e=>setUseRestspend(e.target.checked)} style={{width:"auto"}}/>
                  <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.sandDeep}}>Bruk av restspend (tilgjengelig: {fmtNOK(tilgode)})</span>
                </label>
                {useRestspend&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                    <input type="number" value={restspendAmount} onChange={e=>setRestspendAmount(e.target.value)}
                      placeholder={"Maks "+fmtNOK(Math.min(tilgode,tilgode))} style={{flex:1,textAlign:"right"}}
                      max={tilgode}/>
                    <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.sandDeep}}>NOK fra restspend</span>
                  </div>
                )}
              </div>
            )}

            {total>0&&(
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:13,marginTop:10,padding:"10px 14px",background:C.cardAlt,borderRadius:9,border:"1px solid "+C.borderSoft}}>
                <span style={{color:C.ink3}}>Totalt budsjett{restAmount>0&&<span style={{color:C.sandDeep}}> (inkl. {fmtNOK(restAmount)} restspend)</span>}</span>
                <strong style={{color:C.ink}}>{fmtNOK(total)}</strong>
              </div>
            )}
          </div>
        )}

        <button className="btn" onClick={save} style={{background:C.sand,color:"#fff",padding:"12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>Opprett oppgave</button>
      </div>
    </div>
  );
}

// ══ Add Campaign Modal (standalone, no brief) ════════════════════
function AddCampaignModal({customer, presetChannel, onClose, onSave, tasks=[]}) {
  const [form,setForm]=useState({title:"",start:today(),end:""});
  const [openCohort,setOpenCohort]=useState(null);
  const [channelLines,setChannelLines]=useState(
    presetChannel ? {[presetChannel]:[{id:uid(),name:"",budget:"",restspend:"",useAdGroups:false,adGroups:[{id:uid(),name:"",budget:""}]}]} : {}
  );

  // Ad group nomenclature per channel type
  const adGroupLabel=(ch)=>{
    if(CHANNEL_DEPT_MAP["SEM"]?.some(c=>ch.includes(c))) return "Ad sets";
    if(CHANNEL_DEPT_MAP["Programmatisk"]?.some(c=>ch.includes(c))) return "Line items";
    return "Ad groups";
  };

  // Tilgode for this customer — include archived tasks' archivedLines
  const allCustomerTasks=tasks.filter(t=>t.customerId===customer?.id);
  const tilgode=Math.max(0,
    allCustomerTasks.reduce((sum,t)=>{
      return sum+(t.archivedLines||[]).reduce((a,l)=>a+((l.budget||0)-(l.spent||0)),0);
    },0)
    - allCustomerTasks.reduce((sum,t)=>sum+(t.restspendUsed||0),0)
    - tasks.filter(b=>b.customerId===customer?.id).reduce((s,b)=>s+(b.restspendUsed||0),0)
  );

  const selectedChannels=Object.keys(channelLines);
  const baseBudget=Object.values(channelLines).flat().reduce((a,l)=>a+(+l.budget||0),0);
  const restAmount=Object.values(channelLines).flat().reduce((a,l)=>a+(+l.restspend||0),0);
  const total=baseBudget+restAmount;
  const bankAfter=(customer?.bank||0)-total;

  const toggleChannel=(ch)=>{
    setChannelLines(prev=>{
      if(prev[ch]){
        const next={...prev};
        delete next[ch];
        return next;
      }
      return {...prev,[ch]:[{id:uid(),name:"",budget:"",restspend:"",useAdGroups:false,adGroups:[{id:uid(),name:"",budget:""}]}]};
    });
    setOpenCohort(null);
  };

  const addLine=(ch)=>setChannelLines(prev=>({...prev,[ch]:[...prev[ch],{id:uid(),name:"",budget:"",restspend:"",useAdGroups:false,adGroups:[{id:uid(),name:"",budget:""}]}]}));
  const removeLine=(ch,id)=>setChannelLines(prev=>({...prev,[ch]:prev[ch].filter(l=>l.id!==id)}));
  const updateLine=(ch,id,field,val)=>setChannelLines(prev=>({
    ...prev,[ch]:prev[ch].map(l=>l.id===id?{...l,[field]:val}:l)
  }));

  const save=()=>{
    if(!form.title) return alert("Fyll inn kampanjenavn");
    if(!form.end) return alert("Fyll inn sluttdato");
    if(selectedChannels.length===0) return alert("Velg minst én kanal");
    if(baseBudget<=0&&restAmount<=0) return alert("Legg inn budsjett på minst én linje");
    const channelBudgets={};
    const channels={};
    selectedChannels.forEach(ch=>{
      const base=ch.split(" · ")[0];
      channels[base]=[];
      channelLines[ch].forEach(l=>{
        const lineBudget=(+l.budget||0)+(+l.restspend||0);
        if(lineBudget>0) {
          const lineKey=ch+" — "+(l.name||form.title);
          channelBudgets[lineKey]=lineBudget;
          // Store ad groups as sub-keys
          if(l.useAdGroups&&l.adGroups?.length>0) {
            l.adGroups.forEach(g=>{
              if(+g.budget>0) channelBudgets[lineKey+" / "+(g.name||"Ad group")]=+g.budget;
            });
          }
        }
      });
    });
    onSave({
      id:uid(),customerId:customer.id,title:form.title,
      start:form.start,end:form.end,budget:total,
      status:"green",channels,channelBudgets,
      spent:{},channelDates:{},archived:false,fromBriefId:null,
      restspendUsed:restAmount,
    });
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:"92vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:22,fontWeight:600,color:C.ink}}>Ny kampanje — {customer.name}</h2>
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>

        {/* Bank */}
        <div style={{background:C.cardAlt,borderRadius:9,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:12,border:"1px solid "+C.borderSoft}}>
          <span style={{color:C.ink3}}>Kundebank: <strong style={{color:C.ink}}>{fmtNOK(customer.bank||0)}</strong></span>
          <span style={{color:bankAfter<0?C.badFg:C.okFg}}>Etter kampanje: <strong>{fmtNOK(bankAfter)}</strong></span>
        </div>

        {/* Kampanjenavn + datoer */}
        <div style={{marginBottom:12}}>
          <label>Kampanjenavn</label>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            placeholder="f.eks. Meta | Always On | September 2026" autoFocus/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          <div><label>Startdato</label>
            <input type="date" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value}))}/>
          </div>
          <div><label>Sluttdato</label>
            <input type="date" value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/>
          </div>
        </div>

        {/* Valgte kanaler med linjer */}
        {selectedChannels.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
            {selectedChannels.map(ch=>{
              const icon=CHANNEL_ICONS[ch];
              const hunch=isHunch(ch);
              return (
                <div key={ch} style={{border:"1px solid "+C.border,borderRadius:12,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.cardAlt,borderBottom:"1px solid "+C.borderSoft}}>
                    {icon&&<div style={{width:22,height:22,borderRadius:5,overflow:"hidden",background:"#fff",flexShrink:0}}>
                      <img src={icon} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                    </div>}
                    <span style={{fontFamily:"Roboto,sans-serif",fontSize:13,fontWeight:600,color:C.ink,flex:1}}>{ch}</span>
                    {hunch&&<span style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.badFg,background:C.badBg,padding:"2px 8px",borderRadius:99}}>−5% fee</span>}
                    <button className="btn" onClick={()=>toggleChannel(ch)} style={{background:"none",color:C.ink3,padding:"2px 6px",fontSize:12}}>✕</button>
                  </div>
                  <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
                    {tilgode>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 120px 120px auto",gap:6,alignItems:"center",marginBottom:4,padding:"0 0 4px"}}>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.ink4,letterSpacing:".08em",textTransform:"uppercase"}}>Linjenavn</div>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.ink4,letterSpacing:".08em",textTransform:"uppercase",textAlign:"right"}}>Budsjett</div>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.sandDeep,letterSpacing:".08em",textTransform:"uppercase",textAlign:"right"}}>+ Restspend</div>
                      <div/>
                    </div>}
                    {!tilgode&&<div style={{display:"grid",gridTemplateColumns:"1fr 120px auto",gap:6,alignItems:"center",marginBottom:4,padding:"0 0 4px"}}>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.ink4,letterSpacing:".08em",textTransform:"uppercase"}}>Linjenavn</div>
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:9.5,color:C.ink4,letterSpacing:".08em",textTransform:"uppercase",textAlign:"right"}}>Budsjett</div>
                      <div/>
                    </div>}
                    {channelLines[ch].map((l,idx)=>(
                      <div key={l.id} style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginBottom:6}}>
                        {/* Line row */}
                        <div style={{display:"grid",gridTemplateColumns:tilgode>0?"1fr 120px 120px auto":"1fr 120px auto",gap:8,alignItems:"center",marginBottom:6}}>
                          <input value={l.name} onChange={e=>updateLine(ch,l.id,"name",e.target.value)}
                            placeholder={form.title||"Linjenavn"}/>
                          <input type="number" value={l.useAdGroups?l.adGroups.reduce((a,g)=>a+(+g.budget||0),0)||"":l.budget}
                            onChange={e=>!l.useAdGroups&&updateLine(ch,l.id,"budget",e.target.value)}
                            placeholder="0" style={{textAlign:"right",background:l.useAdGroups?C.borderSoft:"",color:l.useAdGroups?C.ink3:C.ink}}
                            readOnly={l.useAdGroups}/>
                          {tilgode>0&&<div>
                            <input type="number" value={l.restspend||""} onChange={e=>updateLine(ch,l.id,"restspend",e.target.value)}
                              placeholder="0" style={{textAlign:"right",background:C.sandBg,borderColor:C.sandBd}}/>
                          </div>}
                          {channelLines[ch].length>1&&(
                            <button className="btn" onClick={()=>removeLine(ch,l.id)}
                              style={{background:"none",color:C.badFg,padding:"4px 8px",border:"1px solid "+C.badBg,borderRadius:8}}><X size={12}/></button>
                          )}
                        </div>
                        {/* Ad groups toggle */}
                        <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:l.useAdGroups?8:0}}>
                          <input type="checkbox" checked={l.useAdGroups||false}
                            onChange={e=>updateLine(ch,l.id,"useAdGroups",e.target.checked)}
                            style={{width:"auto"}}/>
                          <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>Legg til {adGroupLabel(ch).toLowerCase()}</span>
                        </label>
                        {/* Ad groups */}
                        {l.useAdGroups&&(
                          <div style={{marginLeft:16,display:"flex",flexDirection:"column",gap:6}}>
                            <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink4,letterSpacing:".07em",textTransform:"uppercase",marginBottom:2}}>{adGroupLabel(ch)}</div>
                            {(l.adGroups||[]).map((g,gi)=>(
                              <div key={g.id} style={{display:"grid",gridTemplateColumns:"1fr 110px auto",gap:6,alignItems:"center"}}>
                                <input value={g.name} onChange={e=>{
                                  const newGroups=l.adGroups.map((ag,ai)=>ai===gi?{...ag,name:e.target.value}:ag);
                                  updateLine(ch,l.id,"adGroups",newGroups);
                                }} placeholder={adGroupLabel(ch).slice(0,-1)+" "+(gi+1)} style={{fontSize:12}}/>
                                <input type="number" value={g.budget||""} onChange={e=>{
                                  const newGroups=l.adGroups.map((ag,ai)=>ai===gi?{...ag,budget:e.target.value}:ag);
                                  updateLine(ch,l.id,"adGroups",newGroups);
                                  // Sync total budget
                                  const newTotal=newGroups.reduce((a,ag)=>a+(+ag.budget||0),0);
                                  updateLine(ch,l.id,"budget",newTotal||"");
                                }} placeholder="0" style={{textAlign:"right",fontSize:12}}/>
                                {(l.adGroups||[]).length>1&&<button className="btn" onClick={()=>{
                                  const newGroups=l.adGroups.filter((_,ai)=>ai!==gi);
                                  updateLine(ch,l.id,"adGroups",newGroups);
                                  updateLine(ch,l.id,"budget",newGroups.reduce((a,ag)=>a+(+ag.budget||0),0)||"");
                                }} style={{background:"none",color:C.badFg,padding:"2px 6px",border:"1px solid "+C.badBg,borderRadius:6}}><X size={10}/></button>}
                              </div>
                            ))}
                            <button className="action-btn" style={{alignSelf:"flex-start"}} onClick={()=>{
                              updateLine(ch,l.id,"adGroups",[...(l.adGroups||[]),{id:uid(),name:"",budget:""}]);
                            }}><Plus size={11}/> Legg til</button>
                            {l.adGroups?.reduce((a,g)=>a+(+g.budget||0),0)>0&&(
                              <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.ink3}}>
                                Total: <strong style={{color:C.ink}}>{fmtNOK(l.adGroups.reduce((a,g)=>a+(+g.budget||0),0))}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {tilgode>0&&(+channelLines[ch].reduce((a,l)=>a+(+l.restspend||0),0)>0)&&(
                      <div style={{fontFamily:"Roboto,sans-serif",fontSize:10,color:C.sandDeep,marginTop:4}}>
                        Restspend for denne kanalen: {fmtNOK(channelLines[ch].reduce((a,l)=>a+(+l.restspend||0),0))} — trekkes fra tilgode
                      </div>
                    )}
                    <button className="action-btn" onClick={()=>addLine(ch)} style={{alignSelf:"flex-start"}}>
                      <Plus size={12}/> Legg til linje
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Kanal-velger */}
        <div style={{marginBottom:16}}>
          <label>Legg til kanal</label>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {Object.entries(CHANNEL_COHORTS).map(([cohort,chans])=>(
              <div key={cohort}>
                <div onClick={()=>setOpenCohort(openCohort===cohort?null:cohort)}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:C.cardAlt,border:"1px solid "+C.border,borderRadius:openCohort===cohort?"9px 9px 0 0":"9px",cursor:"pointer"}}>
                  <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,fontWeight:500,color:C.ink}}>{cohort}</span>
                  <ChevronDown size={14} color={C.ink3} style={{transform:openCohort===cohort?"rotate(180deg)":"none",transition:"transform .2s"}}/>
                </div>
                {openCohort===cohort&&(
                  <div style={{border:"1px solid "+C.border,borderTop:"none",borderRadius:"0 0 9px 9px",overflow:"hidden"}}>
                    {Object.keys(chans).map(ch=>{
                      const selected=!!channelLines[ch];
                      return (
                        <div key={ch} onClick={()=>toggleChannel(ch)}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",cursor:"pointer",background:selected?C.sandBg:C.card,borderBottom:"1px solid "+C.borderSoft}}>
                          {CHANNEL_ICONS[ch]&&<img src={CHANNEL_ICONS[ch]} alt="" style={{width:16,height:16,borderRadius:3,objectFit:"contain"}}/>}
                          <span style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:selected?C.sandDeep:C.ink,fontWeight:selected?600:400,flex:1}}>{ch}</span>
                          {isHunch(ch)&&<span style={{fontSize:10,color:C.badFg}}>−5% fee</span>}
                          {selected&&<CircleCheck size={14} color={C.sand}/>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {tilgode>0&&selectedChannels.length>0&&(
          <div style={{marginBottom:14,padding:"8px 14px",background:C.sandBg,borderRadius:9,border:"1px solid "+C.sandBd,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.sandDeep}}>
            Tilgode: <strong>{fmtNOK(tilgode)}</strong> — legg inn restspend-beløp per linje
          </div>
        )}

        {total>0&&<div style={{display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:13,marginBottom:14,padding:"10px 14px",background:C.cardAlt,borderRadius:9,border:"1px solid "+C.borderSoft}}>
          <span style={{color:C.ink3}}>Totalt budsjett{restAmount>0&&<span style={{color:C.sandDeep}}> (inkl. {fmtNOK(restAmount)} restspend)</span>}</span>
          <strong style={{color:C.ink}}>{fmtNOK(total)}</strong>
        </div>}

        <button className="btn" onClick={save}
          style={{background:C.sand,color:"#fff",padding:"12px",borderRadius:9,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>
          Opprett kampanje
        </button>
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
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>
        {cust&&(
          <div style={{background:C.bg,borderRadius:4,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",fontFamily:"Roboto,sans-serif",fontSize:12}}>
            <span style={{color:C.ink3}}>Kundebank: <strong style={{color:C.ink}}>{fmtNOK(cust.bank||0)}</strong></span>
            <span style={{color:bankAfter<0?C.badFg:C.okFg}}>Etter kampanje: <strong>{fmtNOK(bankAfter)}</strong></span>
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
                  <div key={key} style={{display:"flex",alignItems:"center",gap:10,background:C.bg,borderRadius:3,padding:"8px 12px",border:"1px solid "+C.border}}>
                    <div style={{flex:1,fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink2,display:"flex",alignItems:"center",gap:6}}>
                      {icon&&<img src={icon} alt="" style={{width:16,height:16,borderRadius:3,objectFit:"contain"}}/>}
                      {key}
                      {hunch&&<span style={{color:C.badFg,fontSize:10,marginLeft:4}}>−5% fee</span>}
                    </div>
                    <input type="number" value={val||""} onChange={e=>setChannelBudgets(p=>({...p,[key]:+e.target.value}))} style={{width:120,textAlign:"right"}} placeholder="0"/>
                    <span style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3}}>NOK</span>
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"flex-end",fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,paddingRight:36}}>
                Totalt: <strong style={{color:C.ink,marginLeft:6}}>{fmtNOK(total)}</strong>
              </div>
            </div>
          </div>
        )}
        {lineEntries.length===0&&(
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3,marginBottom:18,padding:"12px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
            Ingen kampanjelinjer satt opp på oppgaven. Opprett kampanjen og legg til linjer manuelt.
          </div>
        )}
        <button className="btn" onClick={save} style={{background:C.sand,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>Opprett kampanje</button>
      </div>
    </div>
  );
}

// ══ Create Customer Modal ══════════════════════════════════════════
function CreateCustomerModal({onClose, onSave}) {
  const [form,setForm]=useState({
    name:"",industry:"",contact:"",logo:"",bank:0,
    colorPrimary:null,colorSecondary:null,
    contactName:"",contactPhone:"",contactEmail:"",
    advisorId:"",resources:[],
  });

  const addResource=()=>setForm(f=>({...f,resources:[...f.resources,{staffId:"",department:""}]}));
  const updateResource=(i,changes)=>setForm(f=>({...f,resources:f.resources.map((r,idx)=>idx===i?{...r,...changes}:r)}));
  const removeResource=i=>setForm(f=>({...f,resources:f.resources.filter((_,idx)=>idx!==i)}));

  const save=()=>{
    if(!form.name) return alert("Fyll inn kundenavn");
    const logo=form.logo||form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    onSave({id:uid(),...form,logo,bank:+form.bank||0});
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:"92vh"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"'Montserrat',sans-serif",fontSize:24,fontWeight:600}}>Ny kunde</h2>
          <button className="btn" onClick={onClose} style={{background:"none",color:C.ink3,padding:"4px"}}><X size={20}/></button>
        </div>

        {/* Farger */}
        <div style={{display:"flex",gap:20,alignItems:"flex-start",marginBottom:16,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,letterSpacing:".05em",textTransform:"uppercase",width:100,paddingTop:4}}>Merkevarefarger</div>
          <ColorSwatch color={form.colorPrimary} label="Primær" onChange={v=>setForm(f=>({...f,colorPrimary:v}))}/>
          <ColorSwatch color={form.colorSecondary} label="Sekundær" onChange={v=>setForm(f=>({...f,colorSecondary:v}))}/>
        </div>

        {/* Grunninfo */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[{key:"name",label:"Kundenavn",placeholder:"f.eks. Oris Dental"},{key:"industry",label:"Bransje",placeholder:"f.eks. Tannhelse"},{key:"contact",label:"Nettside",placeholder:"f.eks. orisdental.no"},{key:"logo",label:"Initialer (valgfritt)",placeholder:"f.eks. OD"}].map(f=>(
            <div key={f.key}><label>{f.label}</label>
              <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{width:"100%"}} placeholder={f.placeholder}/>
            </div>
          ))}
          <div><label>Startkapital i bank (NOK)</label>
            <input type="number" value={form.bank} onChange={e=>setForm(p=>({...p,bank:e.target.value}))} style={{width:"100%"}} placeholder="0"/>
          </div>
        </div>

        {/* Kundekontakt */}
        <div style={{marginBottom:16,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginBottom:10,letterSpacing:".05em",textTransform:"uppercase"}}>Kundekontakt</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label>Navn</label><input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} style={{width:"100%"}} placeholder="Kontaktperson"/></div>
            <div><label>Telefon</label><input value={form.contactPhone} onChange={e=>setForm(f=>({...f,contactPhone:e.target.value}))} style={{width:"100%"}} placeholder="+47 xxx xx xxx"/></div>
            <div><label>E-post</label><input value={form.contactEmail} onChange={e=>setForm(f=>({...f,contactEmail:e.target.value}))} style={{width:"100%"}} placeholder="navn@selskap.no"/></div>
          </div>
        </div>

        {/* Rådgiver */}
        <div style={{marginBottom:16,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,marginBottom:10,letterSpacing:".05em",textTransform:"uppercase"}}>Rådgiver</div>
          <select value={form.advisorId} onChange={e=>setForm(f=>({...f,advisorId:e.target.value}))} style={{width:"100%"}}>
            <option value="">Velg rådgiver...</option>
            {ADVISORS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Ressurser */}
        <div style={{marginBottom:20,padding:"14px",background:C.bg,borderRadius:4,border:"1px solid "+C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"Roboto,sans-serif",fontSize:11,color:C.ink3,letterSpacing:".05em",textTransform:"uppercase"}}>Ressurser</div>
            <button className="btn" onClick={addResource} style={{background:C.borderSoft,color:C.ink,padding:"4px 10px",borderRadius:3,fontFamily:"Roboto,sans-serif",fontSize:11}}>+ Legg til</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {form.resources.map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"center"}}>
                <select value={r.staffId} onChange={e=>updateResource(i,{staffId:e.target.value})} style={{width:"100%"}}>
                  <option value="">Velg person...</option>
                  {CHANNEL_STAFF.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={r.department} onChange={e=>updateResource(i,{department:e.target.value})} style={{width:"100%"}}>
                  <option value="">Velg avdeling...</option>
                  {["SOME","SEM","Programmatisk","SEO","Data & Analyse","Rådgiver","Design","Økonomi"].map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <button className="btn" onClick={()=>removeResource(i)} style={{background:"none",color:C.badFg,border:"1px solid "+C.badFg+"40",padding:"4px 8px",borderRadius:3}}><Trash2 size={14}/></button>
              </div>
            ))}
            {form.resources.length===0&&<div style={{fontFamily:"Roboto,sans-serif",fontSize:12,color:C.ink3}}>Ingen ressurser lagt til.</div>}
          </div>
        </div>

        <button className="btn" onClick={save} style={{background:C.sand,color:"#fff",padding:"12px",borderRadius:4,fontFamily:"Roboto,sans-serif",fontSize:13,width:"100%"}}>Opprett kunde</button>
      </div>
    </div>
  );
}
