"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Model = { id:string; plan?:"free"|"pro"; name:string; maker:string; tag:string; task:string; category?:"chat"|"code"|"both"; configured?:boolean; github?:string };
type Message = { role:"user"|"assistant"; content:string; imageUrl?:string; imageSize?:number; modelUsed?:string; modelProfile?:string; modelProvider?:string; fallbackAttempted?:boolean };
type ImageAttachment = { dataUrl:string; name:string; size:number };
const LOCAL_MODELS: Model[] = [
  {id:"local-fast",plan:"free",name:"KRUSHY FAST",maker:"On-device AI",tag:"FREE · Everyday chat & writing",task:"Quick answers, summaries and natural writing",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
  {id:"local-code",plan:"free",name:"KRUSHY CODE",maker:"Llama 3.2 · Local",tag:"FREE · Coding & reasoning",task:"Code, debugging, logic and math",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
  {id:"local-vision",plan:"free",name:"KRUSHY VISION",maker:"On-device AI",tag:"FREE · Research & documents (text)",task:"Long-form analysis and pasted document text",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
];
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
async function prepareImage(file:File):Promise<ImageAttachment>{
  const allowed = ["image/png","image/jpeg","image/webp","image/gif"];
  if(!allowed.includes(file.type)) throw new Error("Use a PNG, JPEG, WebP, or GIF image.");
  if(file.size>20*1024*1024) throw new Error("That image is too large to process. Choose an image under 20 MB.");
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1,2048/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");
  let blob:Blob|null=null;
  try {
    for(let attempt=0;attempt<9;attempt++){
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));
      canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const context=canvas.getContext("2d");
      if(!context) throw new Error("Your browser could not process this image.");
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const quality=Math.max(.42,.86-attempt*.055);
      blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
      if(blob&&blob.size<=MAX_UPLOAD_BYTES) break;
      scale*=.82;
    }
  } finally {
    bitmap.close();
  }
  if(!blob||blob.size>MAX_UPLOAD_BYTES) throw new Error("Could not compress this image below 3 MB. Try a smaller image.");
  const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not read the image."));reader.readAsDataURL(blob!);});
  return {dataUrl,name:file.name,size:blob.size};
}
const starters = ["Build me a responsive website","Explain this code and fix the bugs","Create a React component","Help me plan my next project"];
export default function Home() {
  const [models,setModels] = useState<Model[]>([]);
  const [model,setModel] = useState("local-fast");
  const [mode,setMode] = useState<"chat"|"code">("chat");
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [listening,setListening] = useState(false);
  const [speaking,setSpeaking] = useState(false);
  const [sidebar,setSidebar] = useState(false);
  const [history,setHistory] = useState<string[]>([]);
  const [attachment,setAttachment] = useState<ImageAttachment|null>(null);
  const [dailyUsage,setDailyUsage] = useState(0);
  const [proTool,setProTool] = useState<"none"|"search"|"research"|"image"|"files"|"voice"|"projects">("none");
  const [proExpanded,setProExpanded] = useState(true);
  const [modelProgress,setModelProgress] = useState("");
  const [accountOpen,setAccountOpen] = useState(false);
  const [authMode,setAuthMode] = useState<"signin"|"signup">("signin");
  const [authEmail,setAuthEmail] = useState("");
  const [authPassword,setAuthPassword] = useState("");
  const [authName,setAuthName] = useState("");
  const [authBusy,setAuthBusy] = useState(false);
  const [authMessage,setAuthMessage] = useState("");
  const [authUser,setAuthUser] = useState<User|null>(null);
  const dailyLimit = 20;
  const usageKey = `krushy-usage-${new Date().toISOString().slice(0,10)}`;
  const [compressing,setCompressing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const selected = useMemo(()=>models.find(m=>m.id===model),[models,model]);
  const activeModels = useMemo(()=>models.filter(m=>m.category==="both"||m.category===mode),[models,mode]);
  function changeMode(next:"chat"|"code"){setMode(next);const current=models.find(m=>m.id===model);if(current&&current.category!=="both"&&current.category!==next){const best=models.find(m=>m.category===next&&m.configured);setModel(best?.id||models.find(m=>m.plan==="free"&&m.configured)?.id||"");}}
  useEffect(()=>{const supabase=getSupabaseBrowserClient();if(!supabase)return;supabase.auth.getUser().then(({data})=>setAuthUser(data.user));const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setAuthUser(session?.user??null));return ()=>subscription.unsubscribe();},[]);
  useEffect(()=>{setModels(LOCAL_MODELS);setModel("local-fast");fetch("/api/models").then(r=>r.json()).then(d=>{const available=d.models||[];setModels([...available,...LOCAL_MODELS]);}).catch(()=>{}); try { const h=JSON.parse(localStorage.getItem("krushy-history")||"[]"); setHistory(h); const used=Number(localStorage.getItem(usageKey)||"0"); setDailyUsage(Number.isFinite(used)?used:0); } catch {} },[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
  useEffect(()=>{if(messages.length){const h=[messages.filter(m=>m.role==="user").at(-1)?.content||"New chat",...history].slice(0,12);setHistory(h);localStorage.setItem("krushy-history",JSON.stringify(h));}},[messages.length]);
  async function submitAuth(){
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setAuthMessage("Authentication is not configured yet. Add the Supabase URL and anon key to Vercel environment variables.");return;}
    if(!authEmail.trim()||!authPassword){setAuthMessage("Enter your email and password.");return;}
    if(authMode==="signup"&&authPassword.length<8){setAuthMessage("Use a password with at least 8 characters.");return;}
    setAuthBusy(true);setAuthMessage("");
    try{if(authMode==="signup"){const {data,error}=await supabase.auth.signUp({email:authEmail.trim(),password:authPassword,options:{data:{full_name:authName.trim()},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session){setAuthUser(data.user);setAccountOpen(false);setAuthPassword("");}else setAuthMessage("Account created. Check your email for the confirmation link, then sign in.");}else{const {data,error}=await supabase.auth.signInWithPassword({email:authEmail.trim(),password:authPassword});if(error)throw error;setAuthUser(data.user);setAccountOpen(false);setAuthPassword("");}}catch(e){setAuthMessage(e instanceof Error?e.message:"Sign-in failed. Please try again.");}finally{setAuthBusy(false);}
  }
  async function signInGoogle(){const supabase=getSupabaseBrowserClient();if(!supabase){setAuthMessage("Add the Supabase URL and anon key to Vercel environment variables first.");return;}setAuthBusy(true);setAuthMessage("");const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});if(error){setAuthMessage(error.message);setAuthBusy(false);}}
  async function signOut(){const supabase=getSupabaseBrowserClient();if(supabase)await supabase.auth.signOut();setAuthUser(null);}
  async function downloadSelectedModel(){
    if(!model.startsWith("local-")){setError("This model is managed by the connected provider.");return;}
    setError("");
    try{const {getLocalEngine}=await import("@/lib/local-engine");await getLocalEngine(model,setModelProgress);}
    catch(e){const {resetLocalEngine}=await import("@/lib/local-engine");resetLocalEngine();setError(e instanceof Error?e.message:"Model download failed. Check WebGPU and try again.");}
  }
  async function send(text=input) {
    const value=text.trim(); if((!value&&!attachment)||busy)return;
    const chosen=models.find(m=>m.id===model);
    if(!chosen?.configured){setError("This model is not connected yet.");return;}
    if(model.startsWith("local-")&&attachment){setError("Image understanding is not enabled on the free on-device models yet. No image was attached. Choose a connected cloud vision model when one is configured. Pasting text from the image will work with the local models.");return;}
    if(chosen?.plan!=="pro"){const nextUsage=dailyUsage+1;setDailyUsage(nextUsage);localStorage.setItem(usageKey,String(nextUsage));}
    const imageForSend=attachment;
    const priorImageBytes=messages.reduce((total,message)=>total+(message.imageSize||0),0);
    if(priorImageBytes+(imageForSend?.size||0)>MAX_UPLOAD_BYTES){setError("Images in this conversation exceed the 3 MB combined limit. Start a new chat before attaching another image.");return;}
    const next=[...messages,{role:"user" as const,content:value,imageUrl:imageForSend?.dataUrl,imageSize:imageForSend?.size}]; setMessages(next);setInput("");setAttachment(null);setError("");setBusy(true);
    try {
      if(model.startsWith("local-")){
        setModelProgress("Checking browser GPU support…");
        const { getLocalEngine, resetLocalEngine } = await import("@/lib/local-engine");
        const engine = await getLocalEngine(model, (progress)=>setModelProgress(progress));
        const persona = model === "local-fast"
          ? "You are KRUSHY FAST, an original everyday assistant inspired by the strengths people value in fast conversational models. Write naturally and warmly. Prioritize concise, useful answers, emails, summaries, brainstorming and everyday questions. Ask only necessary clarifying questions. Do not claim to be Claude or any proprietary model."
          : model === "local-code"
          ? "You are KRUSHY CODE, an original coding, logic and math specialist inspired by the strengths people value in advanced reasoning models. Analyze requirements carefully, give correct runnable code, explain debugging steps, use structured outputs when requested, show calculations, and state assumptions. Do not claim to be GPT or any proprietary model."
          : "You are KRUSHY VISION, an original research and document-analysis specialist inspired by the strengths people value in multimodal research assistants. You can analyze text and document contents pasted into the chat, organize long material, compare sources supplied by the user, extract key points and produce thorough research plans. You cannot see images or read files that have not been pasted as text; say so plainly. Do not claim to be Gemini or any proprietary model.";
        const stream = await engine.chat.completions.create({
          messages:[{role:"system",content:persona},...next.map(m=>({role:m.role,content:m.content}))],
          stream:true,
          temperature:0.7,
          max_tokens:320,
        });
        let answer="";
        setMessages([...next,{role:"assistant",content:"",modelUsed:"SmolLM2-360M-Instruct-q4f16_1 (local)",modelProfile:chosen.name,modelProvider:"MLC WebGPU · On-device"}]);
        for await (const chunk of stream) {
          answer += chunk.choices?.[0]?.delta?.content || "";
          setMessages([...next,{role:"assistant",content:answer,modelUsed:"SmolLM2-360M-Instruct-q4f16_1 (local)",modelProfile:chosen.name,modelProvider:"MLC WebGPU · On-device"}]);
        }
        setModelProgress("");
        return;
      }
      const apiMessages=next.map(m=>m.imageUrl?{role:m.role,content:[{type:"text",text:m.content},{type:"image_url",image_url:{url:m.imageUrl}}]}:{role:m.role,content:m.content});
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,mode,messages:apiMessages})});
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"Request failed");}
      if(!res.body)throw new Error("Streaming is not supported by this response.");
      const reader=res.body.getReader();const decoder=new TextDecoder();let answer="";
      const modelUsed=res.headers.get("X-Krushy-Model-Used")||chosen.name;const modelProvider=chosen.maker||"Connected provider";const fallbackAttempted=res.headers.get("X-Krushy-Fallback-Attempted")==="true";
      setMessages([...next,{role:"assistant",content:"",modelUsed,modelProfile:chosen.name,modelProvider,fallbackAttempted}]);
      while(true){const {value,done}=await reader.read();if(done)break;const chunk=decoder.decode(value,{stream:true});for(const line of chunk.split("\n")){if(!line.startsWith("data: "))continue;const raw=line.slice(6).trim();if(raw==="[DONE]")continue;try{const json=JSON.parse(raw);answer+=json.choices?.[0]?.delta?.content||"";setMessages([...next,{role:"assistant",content:answer,modelUsed,modelProfile:chosen.name,modelProvider,fallbackAttempted}]);}catch{}}}
    }catch(e){const message=e instanceof Error?e.message:"Something went wrong.";
      if(model.startsWith("local-")&&(/disposed|mapAsync|GPUBuffer|external Instance|device lost|device was lost/i.test(message))){const {resetLocalEngine}=await import("@/lib/local-engine");resetLocalEngine();setError("Your phone/browser lost its WebGPU session. KRUSHY cleared the failed model safely. Reload this page, close other tabs, then try Download / load selected model again. KRUSHY now uses a much smaller 360M model to reduce GPU memory use. If it happens again, WebGPU is unstable on this browser/device and local AI cannot run reliably here.");}
      else setError(message);
      setMessages(next);}finally{setModelProgress("");setBusy(false);}
  }
  function voiceInput(){
    const w=window as Window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
    const C=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!C){setError("Voice input is not supported in this browser. Try Chrome.");return;}
    const recognition=new C();recognition.lang="en-CA";recognition.interimResults=true;recognition.onstart=()=>setListening(true);recognition.onend=()=>setListening(false);recognition.onerror=()=>{setListening(false);setError("Microphone unavailable. Check browser permissions.");};recognition.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setInput(t);};recognition.start();
  }
  function speak(text:string){if(!("speechSynthesis" in window)){setError("Speech playback is unavailable.");return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(u);}
  async function pickImage(event:React.ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;const vision=models.find(m=>m.id==="slot-1-flagship"&&m.configured)||models.find(m=>m.id==="slot-3-multimodal"&&m.configured)||models.find(m=>m.id==="slot-7-vision"&&m.configured);if(mode==="code")setMode("chat");if(model!=="krushy-max"&&model!=="slot-1-flagship"&&model!=="slot-3-multimodal"&&model!=="slot-7-vision"){if(vision){setModel(vision.id);setError(`Switched to ${vision.name} for image understanding.`);}else{setError("No cloud vision provider is connected. The local free models cannot inspect image pixels yet. Connect a supported vision provider before sending this image.");return;}}else if(model!=="krushy-max"&&!selected?.configured){setError("This vision provider is not connected yet. Configure its provider credentials first.");return;}setCompressing(true);setError("");try{setAttachment(await prepareImage(file));}catch(e){setError(e instanceof Error?e.message:"Image processing failed.");}finally{setCompressing(false);}}
  function fresh(){setMessages([]);setError("");setInput("");setAttachment(null);setSidebar(false);setProTool("none");}
  function previewProTool(tool: "search"|"research"|"image"|"files"|"voice"|"projects", label: string){setProTool(tool);setError(`${label} is visible in Pro Preview. It will activate when the model gateway and the required provider are connected. Your message has not been sent to an external service.`);}
  return <main className="shell">
    <aside className={`sidebar ${sidebar?"open":""}`}>
      <div className="brand"><div className="brand-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 7h7v11L26 7h9L21 20l14 13h-9L15 22v11H8z" fill="currentColor"/><path d="M29 29h5v5h-5z" fill="#ff303b"/></svg></div><div><b>KRUSHY<span> AI</span></b><small>YOUR AI WORKSPACE</small></div><button className="mobile-close" onClick={()=>setSidebar(false)}>×</button></div>
      <button className="new-chat" onClick={fresh}><span>＋</span> New chat</button>
      <div className="side-label">WORKSPACE</div>
      <button className={mode==="chat"?"nav active":"nav"} onClick={()=>changeMode("chat")}><span>◉</span> AI Chat</button>
      <button className={mode==="code"?"nav active":"nav"} onClick={()=>changeMode("code")}><span>⌘</span> KRUSHY CODE <em>FREE</em></button>
      <button className="nav" onClick={()=>setError("Voice mode: use the microphone beside the message box to talk, then tap the speaker on an answer.")}><span>◖</span> Voice chat</button>
      <div className="side-label history-label">RECENT CHATS</div>
      <div className="history">{history.map((h,i)=><button key={i} onClick={()=>{setInput(h);setSidebar(false)}}>◦ <span>{h}</span></button>)}</div>
      <div className="side-bottom"><div className="profile"><div className="avatar">K</div><div><b>KRUSHY</b><small>Personal workspace</small></div><span className="online-dot"/></div><div className="powered">KRUSHY MODEL FAMILY</div></div>
    </aside>
    <section className="main">
      <header className="topbar"><button className="menu-btn" onClick={()=>setSidebar(!sidebar)}>☰</button><div className="crumb">Workspace <span>/</span> <b>{mode==="code"?"KRUSHY CODE":"AI Chat"}</b></div><div className="top-right"><button className="pro-top-button" onClick={()=>setProExpanded(!proExpanded)}>✦ PRO</button>{authUser?<button className="account-btn" onClick={signOut}>{authUser.email?.split("@")[0]||"Account"} · Sign out</button>:<button className="account-btn" onClick={()=>{setAuthMessage("");setAccountOpen(true)}}>Sign in</button>}<span className="status-dot"/> <span className="status-text">SYSTEM ONLINE</span><button className="icon-btn" onClick={fresh} title="New chat">＋</button></div></header>
      <div className="content">
        <div className="hero-kicker"><span/> KRUSHY Ω · MODEL LAB <span className="line"/></div>
        {modelProgress&&<div className="model-loading"><div className="download-heading"><span className="download-spin"/> MODEL SETUP</div><b>{modelProgress}</b><div className="download-track"><i/></div><small>First download can take a few minutes. Keep this tab open; the model is cached on this device.</small></div>}
        <select className="mobile-model" value={model} onChange={e=>setModel(e.target.value)} aria-label="Choose AI model">{activeModels.map(m=><option key={m.id} value={m.id} disabled={!m.configured}>{m.id.startsWith("local-")?"On-device · download required":m.configured?"Connected":"Not connected"}</option>)}</select>
        {messages.length===0?<div className="welcome"><div className="orb"><div className="orb-core">K</div><i/><i/><i/></div><h1>{mode==="code"?"LET'S BUILD.":"WHAT'S ON YOUR MIND?"}</h1><p>{mode==="code"?"Your AI coding partner. Plan, write, debug and understand code.":"Choose one of three free local specialists. No external provider account or API key is needed."}</p>
          <div className="model-strip"><span className="model-pulse"/> SELECTED MODEL <b>{selected?.name||"KRUSHY MAX"}</b><span className="model-maker">{selected?.tag||"Connect model gateway"}</span></div>
          <div className="quick-grid">{(mode==="code"?["Build a full website","Debug my code","Explain a function","Design an app UI"]:starters).map((s,i)=><button key={s} className="quick" onClick={()=>send(s)}><span>{["↗","⌘","✳","◇"][i]}</span>{s}<b>↗</b></button>)}</div>
        </div>:<div className="conversation">{messages.map((m,i)=><article className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==="user"?"YOU":"K"}</div><div className="message-body"><div className="message-head">{m.role==="user"?"YOU":"KRUSHY AI"}{m.role==="assistant"&&<button className="speak" onClick={()=>speak(m.content)}>▶ Listen</button>}</div><div className="message-text">{m.content||" "}</div>{m.imageUrl&&<img className="message-image" src={m.imageUrl} alt="User attachment"/>}{m.role==="assistant"&&m.modelUsed&&<div className="model-confirmation"><div className="model-confirmation-title">✓ MODEL CONFIRMATION</div><b>Actual model:</b> {m.modelUsed}<br/><b>Provider:</b> {m.modelProvider||"Provider not reported"}<br/><b>KRUSHY profile:</b> {m.modelProfile||"Selected model profile"}<p>Style profile active: KRUSHY is following the selected model profile’s task and writing style. This is an imitation, not the proprietary model itself. Safety limits still apply; “unrestricted” mode is not claimed.{m.fallbackAttempted?" A fallback provider/model was used during this response.":""}</p></div>}</div></article>)}{busy&&messages.at(-1)?.role==="user"&&<div className="thinking"><span/> KRUSHY AI IS THINKING</div>}<div ref={bottom}/></div>}
        {error&&<div className="error"><b>!</b> {error}<button onClick={()=>setError("")}>×</button></div>}
        <div className="composer-wrap"><div className="composer">{attachment&&<div className="attachment-preview"><img src={attachment.dataUrl} alt="Selected upload"/><span>{attachment.name} · {(attachment.size/1024).toFixed(0)} KB</span><button type="button" onClick={()=>setAttachment(null)} aria-label="Remove image">×</button></div>}<textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask KRUSHY AI to write, debug or explain code...":"Message KRUSHY AI..."} rows={2}/><div className="composer-bottom"><div className="composer-tools"><input ref={fileInput} className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickImage}/><button className="tool" type="button" onClick={()=>fileInput.current?.click()} disabled={compressing||busy} title="Attach image">▧ <span>{compressing?"Preparing":"Image"}</span></button><button className={mode==="code"?"tool selected":"tool"} onClick={()=>changeMode(mode==="code"?"chat":"code")}>⌘ <span>Code</span></button><button className={listening?"tool selected":"tool"} onClick={voiceInput}>{listening?"●":"◖"} <span>{listening?"Listening":"Voice"}</span></button><span className="hint">Enter to send · Shift + Enter for new line</span></div><button className="send" onClick={()=>send()} disabled={busy||(!input.trim()&&!attachment)}>{busy?"…":"↑"}</button></div></div><div className="composer-note">{(model==="krushy-max"||model==="slot-1-flagship"||model==="slot-3-multimodal"||model==="slot-7-vision")&&selected?.configured?"Images supported · PNG, JPEG, WebP, GIF · compressed to max 3 MB":"Image analysis requires a connected vision model"} · KRUSHY AI can make mistakes.</div></div>
      </div>
    </section>
    <aside className="model-panel"><div className="panel-title">MODEL SELECTOR <span>● LIVE</span></div><div className="plan-usage"><b>FREE</b> {Math.max(0,dailyLimit-dailyUsage)} / 20 messages left today</div>{proExpanded&&<section className="pro-preview-card"><div className="pro-preview-heading"><span>✦ KRUSHY PRO</span><em>PREVIEW</em></div><h3>More ways to work</h3><p>Explore the premium workspace while provider setup is pending.</p><div className="pro-feature-grid"><button onClick={()=>previewProTool("search","Web Search")}><span>⌕</span><b>Web search</b><small>Find current information</small></button><button onClick={()=>previewProTool("research","Deep Research")}><span>◉</span><b>Deep research</b><small>Multi-step research</small></button><button onClick={()=>previewProTool("image","Image generation")}><span>✧</span><b>Image studio</b><small>Create visual concepts</small></button><button onClick={()=>previewProTool("files","File analysis")}><span>▤</span><b>File analysis</b><small>Work with documents</small></button><button onClick={()=>previewProTool("voice","Advanced voice")}><span>◖</span><b>Advanced voice</b><small>Natural voice sessions</small></button><button onClick={()=>previewProTool("projects","Projects")}><span>▦</span><b>Projects</b><small>Organize ongoing work</small></button></div><div className="pro-preview-note">UI PREVIEW ONLY · NO PRO SUBSCRIPTION OR PROVIDER IS ACTIVE</div></section>}<button className="download-model" onClick={downloadSelectedModel} disabled={!!modelProgress}>{modelProgress?"Preparing model…":"↓  Download / load selected model"}</button><p>Three free text specialists run on your device. Select one, then download it. They need a supported browser with WebGPU and enough free memory. Local models do not inspect image pixels; cloud vision stays unavailable until a valid provider is connected.</p><div className="provider-model-picker"><label htmlFor="krushy-model-select">CHOOSE MODEL</label><select id="krushy-model-select" value={model} onChange={e=>setModel(e.target.value)}>{activeModels.map(m=><option key={m.id} value={m.id} disabled={!m.configured}>{m.name} · {m.maker}{m.configured?"":" · NOT CONNECTED"}</option>)}</select><div className="provider-readout"><span>PROVIDER</span><b>{selected?.maker||"No provider selected"}</b><small>{selected?.configured?(selected.id.startsWith("local-")?"Runs locally on this device":"Provider credentials detected"):"Provider setup required before use"}</small></div></div><div className="model-list">{activeModels.map((m,i)=><button key={m.id} disabled={!m.configured} className={model===m.id?"model-option chosen":"model-option"} onClick={()=>setModel(m.id)}><div className="model-icon">{m.id==="krushy-max"?"✦":m.maker==="OpenAI"?"◎":m.maker==="Google"?"✦":m.maker==="DeepSeek"?"D":m.maker==="Qwen"?"Q":m.maker==="Meta"?"M":"✳"}</div><div className="model-info"><b>{m.name}</b><small>{m.maker} · {m.task}</small><small>{m.id.startsWith("local-")?"ON-DEVICE · DOWNLOAD REQUIRED":m.plan==="pro"?(m.configured?"PRO · Provider connected":"PRO · Provider not connected"):m.tag}</small></div><span className="radio">{model===m.id?"●":"○"}</span></button>)}</div><div className="panel-footer"><div className="secure">♢ <span><b>PRIVATE CONNECTION</b><small>Local models run on your device</small></span></div><a href="https://github.com/Tissu36/KrushyAi/blob/main/training/README.md" target="_blank" rel="noreferrer">Open-source model collection ↗</a></div></aside>
    {accountOpen&&<div className="account-backdrop" onClick={()=>setAccountOpen(false)}><section className="account-modal" onClick={e=>e.stopPropagation()}><button className="account-close" onClick={()=>setAccountOpen(false)}>×</button><div className="account-logo">K<span>.</span></div><h2>{authMode==="signin"?"Welcome back":"Create your KRUSHY account"}</h2><p>{authMode==="signin"?"Sign in to your personal AI workspace.":"Create an account to keep your workspace connected."}</p><button className="google-auth" onClick={signInGoogle} disabled={authBusy}><b>G</b> Continue with Google</button><div className="auth-divider"><span/>OR CONTINUE WITH EMAIL<span/></div>{authMode==="signup"&&<input className="auth-input" value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Your name" autoComplete="name"/>}<input className="auth-input" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email address" autoComplete="email"/><input className="auth-input" type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Password (at least 8 characters)" autoComplete={authMode==="signin"?"current-password":"new-password"}/>{authMessage&&<div className="auth-message">{authMessage}</div>}<button className="account-primary" onClick={submitAuth} disabled={authBusy}>{authBusy?"Please wait…":authMode==="signin"?"Sign in":"Create account"}</button><div className="auth-switch">{authMode==="signin"?"New to KRUSHY AI?":"Already have an account?"} <button onClick={()=>{setAuthMode(authMode==="signin"?"signup":"signin");setAuthMessage("");}}>{authMode==="signin"?"Create account":"Sign in"}</button></div><button className="guest-link" onClick={()=>setAccountOpen(false)}>Continue as guest</button></section></div>}{sidebar&&<button className="scrim" onClick={()=>setSidebar(false)}/>}
  </main>;
}
