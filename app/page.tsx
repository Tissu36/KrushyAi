"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Model = { id:string; plan?:"free"|"pro"; name:string; maker:string; tag:string; task:string; category?:"chat"|"code"|"both"; configured?:boolean; github?:string };
type Message = { role:"user"|"assistant"; content:string; imageUrl?:string; imageSize?:number; modelUsed?:string; fallbackAttempted?:boolean };
type ImageAttachment = { dataUrl:string; name:string; size:number };
const LOCAL_MODELS: Model[] = [
  {id:"local-fast",plan:"free",name:"KRUSHY FAST",maker:"Llama 3.2 · Local",tag:"FREE · Everyday chat & writing",task:"Quick answers, summaries and natural writing",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
  {id:"local-code",plan:"free",name:"KRUSHY CODE",maker:"Llama 3.2 · Local",tag:"FREE · Coding & reasoning",task:"Code, debugging, logic and math",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
  {id:"local-vision",plan:"free",name:"KRUSHY VISION",maker:"Gemma 3 · Local",tag:"FREE · Research & documents (text)",task:"Long-form analysis and pasted document text",category:"both",configured:true,github:"https://github.com/mlc-ai/web-llm"},
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
  const [modelProgress,setModelProgress] = useState("");
  const dailyLimit = 20;
  const usageKey = `krushy-usage-${new Date().toISOString().slice(0,10)}`;
  const [compressing,setCompressing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const selected = useMemo(()=>models.find(m=>m.id===model),[models,model]);
  const activeModels = useMemo(()=>models.filter(m=>m.category==="both"||m.category===mode),[models,mode]);
  function changeMode(next:"chat"|"code"){setMode(next);const current=models.find(m=>m.id===model);if(current&&current.category!=="both"&&current.category!==next){const best=models.find(m=>m.category===next&&m.configured);setModel(best?.id||models.find(m=>m.plan==="free"&&m.configured)?.id||"");}}
  useEffect(()=>{setModels(LOCAL_MODELS);setModel("local-fast");fetch("/api/models").then(r=>r.json()).then(d=>{const available=d.models||[];setModels([...available,...LOCAL_MODELS]);}).catch(()=>{}); try { const h=JSON.parse(localStorage.getItem("krushy-history")||"[]"); setHistory(h); const used=Number(localStorage.getItem(usageKey)||"0"); setDailyUsage(Number.isFinite(used)?used:0); } catch {} },[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
  useEffect(()=>{if(messages.length){const h=[messages.filter(m=>m.role==="user").at(-1)?.content||"New chat",...history].slice(0,12);setHistory(h);localStorage.setItem("krushy-history",JSON.stringify(h));}},[messages.length]);
  async function send(text=input) {
    const value=text.trim(); if((!value&&!attachment)||busy)return;
    const chosen=models.find(m=>m.id===model);
    if(!chosen?.configured){setError("This model is not connected yet.");return;}
    if(model.startsWith("local-")&&attachment){setError("The free local specialists are text-only right now. KRUSHY VISION can analyze text you paste, but image/PDF upload needs a separate vision or document engine.");return;}
    if(chosen?.plan!=="pro"){const nextUsage=dailyUsage+1;setDailyUsage(nextUsage);localStorage.setItem(usageKey,String(nextUsage));}
    const imageForSend=attachment;
    const priorImageBytes=messages.reduce((total,message)=>total+(message.imageSize||0),0);
    if(priorImageBytes+(imageForSend?.size||0)>MAX_UPLOAD_BYTES){setError("Images in this conversation exceed the 3 MB combined limit. Start a new chat before attaching another image.");return;}
    const next=[...messages,{role:"user" as const,content:value,imageUrl:imageForSend?.dataUrl,imageSize:imageForSend?.size}]; setMessages(next);setInput("");setAttachment(null);setError("");setBusy(true);
    try {
      if(model.startsWith("local-")){
        setModelProgress("Checking browser GPU support…");
        const { getLocalEngine } = await import("@/lib/local-engine");
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
          max_tokens:700,
        });
        let answer="";
        setMessages([...next,{role:"assistant",content:"",modelUsed:model==="local-fast"?"KRUSHY FAST · Llama 3.2 Local":model==="local-code"?"KRUSHY CODE · Llama 3.2 Local":"KRUSHY VISION · Gemma 3 Local"}]);
        for await (const chunk of stream) {
          answer += chunk.choices?.[0]?.delta?.content || "";
          setMessages([...next,{role:"assistant",content:answer,modelUsed:model==="local-llama"?"Llama 3.2 · Local":"Gemma 3 · Local"}]);
        }
        setModelProgress("");
        return;
      }
      const apiMessages=next.map(m=>m.imageUrl?{role:m.role,content:[{type:"text",text:m.content},{type:"image_url",image_url:{url:m.imageUrl}}]}:{role:m.role,content:m.content});
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,mode,messages:apiMessages})});
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"Request failed");}
      if(!res.body)throw new Error("Streaming is not supported by this response.");
      const reader=res.body.getReader();const decoder=new TextDecoder();let answer="";
      const modelUsed=res.headers.get("X-Krushy-Model-Used")||undefined;const fallbackAttempted=res.headers.get("X-Krushy-Fallback-Attempted")==="true";
      setMessages([...next,{role:"assistant",content:"",modelUsed,fallbackAttempted}]);
      while(true){const {value,done}=await reader.read();if(done)break;const chunk=decoder.decode(value,{stream:true});for(const line of chunk.split("\n")){if(!line.startsWith("data: "))continue;const raw=line.slice(6).trim();if(raw==="[DONE]")continue;try{const json=JSON.parse(raw);answer+=json.choices?.[0]?.delta?.content||"";setMessages([...next,{role:"assistant",content:answer,modelUsed,fallbackAttempted}]);}catch{}}}
    }catch(e){setError(e instanceof Error?e.message:"Something went wrong.");setMessages(next);}finally{setModelProgress("");setBusy(false);}
  }
  function voiceInput(){
    const w=window as Window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
    const C=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!C){setError("Voice input is not supported in this browser. Try Chrome.");return;}
    const recognition=new C();recognition.lang="en-CA";recognition.interimResults=true;recognition.onstart=()=>setListening(true);recognition.onend=()=>setListening(false);recognition.onerror=()=>{setListening(false);setError("Microphone unavailable. Check browser permissions.");};recognition.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setInput(t);};recognition.start();
  }
  function speak(text:string){if(!("speechSynthesis" in window)){setError("Speech playback is unavailable.");return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(u);}
  async function pickImage(event:React.ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;const vision=models.find(m=>m.id==="slot-1-flagship"&&m.configured)||models.find(m=>m.id==="slot-7-vision"&&m.configured)||models.find(m=>m.id==="slot-3-multimodal"&&m.configured);if(mode==="code")setMode("chat");if(model!=="krushy-max"&&model!=="slot-1-flagship"&&model!=="slot-3-multimodal"&&model!=="slot-7-vision"){if(vision){setModel(vision.id);setError(`Switched to ${vision.name} for image understanding.`);}else{setError("Connect Slot 3 or Slot 7 before sending images.");return;}}else if(model!=="krushy-max"&&!selected?.configured){setError("Connect this vision model before uploading images.");return;}setCompressing(true);setError("");try{setAttachment(await prepareImage(file));}catch(e){setError(e instanceof Error?e.message:"Image processing failed.");}finally{setCompressing(false);}}
  function fresh(){setMessages([]);setError("");setInput("");setAttachment(null);setSidebar(false);}
  return <main className="shell">
    <aside className={`sidebar ${sidebar?"open":""}`}>
      <div className="brand"><div className="brand-mark">K<span>.</span></div><div><b>KRUSHY<span> AI</span></b><small>YOUR AI WORKSPACE</small></div><button className="mobile-close" onClick={()=>setSidebar(false)}>×</button></div>
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
      <header className="topbar"><button className="menu-btn" onClick={()=>setSidebar(!sidebar)}>☰</button><div className="crumb">Workspace <span>/</span> <b>{mode==="code"?"KRUSHY CODE":"AI Chat"}</b></div><div className="top-right"><span className="status-dot"/> <span className="status-text">SYSTEM ONLINE</span><button className="icon-btn" onClick={fresh} title="New chat">＋</button></div></header>
      <div className="content">
        <div className="hero-kicker"><span/> KRUSHY Ω · MODEL LAB <span className="line"/></div>
        {modelProgress&&<div className="model-loading">{modelProgress}</div>}
        <select className="mobile-model" value={model} onChange={e=>setModel(e.target.value)} aria-label="Choose AI model">{activeModels.map(m=><option key={m.id} value={m.id} disabled={!m.configured}>{m.name} — {m.configured?"Connected":"Not connected"}</option>)}</select>
        {messages.length===0?<div className="welcome"><div className="orb"><div className="orb-core">K</div><i/><i/><i/></div><h1>{mode==="code"?"LET'S BUILD.":"WHAT'S ON YOUR MIND?"}</h1><p>{mode==="code"?"Your AI coding partner. Plan, write, debug and understand code.":"Choose one of three free local specialists. No external provider account or API key is needed."}</p>
          <div className="model-strip"><span className="model-pulse"/> SELECTED MODEL <b>{selected?.name||"KRUSHY MAX"}</b><span className="model-maker">{selected?.tag||"Connect model gateway"}</span></div>
          <div className="quick-grid">{(mode==="code"?["Build a full website","Debug my code","Explain a function","Design an app UI"]:starters).map((s,i)=><button key={s} className="quick" onClick={()=>send(s)}><span>{["↗","⌘","✳","◇"][i]}</span>{s}<b>↗</b></button>)}</div>
        </div>:<div className="conversation">{messages.map((m,i)=><article className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==="user"?"YOU":"K"}</div><div className="message-body"><div className="message-head">{m.role==="user"?"YOU":"KRUSHY AI"}{m.role==="assistant"&&<button className="speak" onClick={()=>speak(m.content)}>▶ Listen</button>}</div><div className="message-text">{m.content||" "}</div>{m.imageUrl&&<img className="message-image" src={m.imageUrl} alt="User attachment"/>}{m.role==="assistant"&&m.modelUsed&&<div className="message-meta">{m.modelUsed}{m.fallbackAttempted&&<span>FALLBACK USED</span>}</div>}</div></article>)}{busy&&messages.at(-1)?.role==="user"&&<div className="thinking"><span/> KRUSHY AI IS THINKING</div>}<div ref={bottom}/></div>}
        {error&&<div className="error"><b>!</b> {error}<button onClick={()=>setError("")}>×</button></div>}
        <div className="composer-wrap"><div className="composer">{attachment&&<div className="attachment-preview"><img src={attachment.dataUrl} alt="Selected upload"/><span>{attachment.name} · {(attachment.size/1024).toFixed(0)} KB</span><button type="button" onClick={()=>setAttachment(null)} aria-label="Remove image">×</button></div>}<textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask KRUSHY AI to write, debug or explain code...":"Message KRUSHY AI..."} rows={2}/><div className="composer-bottom"><div className="composer-tools"><input ref={fileInput} className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickImage}/><button className="tool" type="button" onClick={()=>fileInput.current?.click()} disabled={compressing||busy} title="Attach image">▧ <span>{compressing?"Preparing":"Image"}</span></button><button className={mode==="code"?"tool selected":"tool"} onClick={()=>changeMode(mode==="code"?"chat":"code")}>⌘ <span>Code</span></button><button className={listening?"tool selected":"tool"} onClick={voiceInput}>{listening?"●":"◖"} <span>{listening?"Listening":"Voice"}</span></button><span className="hint">Enter to send · Shift + Enter for new line</span></div><button className="send" onClick={()=>send()} disabled={busy||(!input.trim()&&!attachment)}>{busy?"…":"↑"}</button></div></div><div className="composer-note">{model==="krushy-max"||model==="slot-1-flagship"||model==="slot-3-multimodal"||model==="slot-7-vision"?"Images supported · PNG, JPEG, WebP, GIF · compressed to max 3 MB":"Attach an image to switch to a vision-capable model"} · KRUSHY AI can make mistakes.</div></div>
      </div>
    </section>
    <aside className="model-panel"><div className="panel-title">MODEL SELECTOR <span>● LIVE</span></div><div className="plan-usage"><b>FREE</b> {Math.max(0,dailyLimit-dailyUsage)} / 20 messages left today</div><p>Three free specialists run locally in your browser using Llama 3.2 and Gemma 3. No external model API key. First download needs Wi-Fi, storage and WebGPU. Vision currently analyzes pasted text only.</p><div className="model-list">{activeModels.map((m,i)=><button key={m.id} disabled={!m.configured} className={model===m.id?"model-option chosen":"model-option"} onClick={()=>setModel(m.id)}><div className="model-icon">{m.id==="krushy-max"?"✦":m.maker==="OpenAI"?"◎":m.maker==="Google"?"✦":m.maker==="DeepSeek"?"D":m.maker==="Qwen"?"Q":m.maker==="Meta"?"M":"✳"}</div><div className="model-info"><b>{m.name}</b><small>{m.maker} · {m.task}</small><small>{m.plan==="pro"?(m.configured?"PRO · Preview / plan access":"PRO · Configure free endpoint"):m.tag}</small></div><span className="radio">{model===m.id?"●":"○"}</span></button>)}</div><div className="panel-footer"><div className="secure">♢ <span><b>PRIVATE CONNECTION</b><small>Local models run on your device</small></span></div><a href="https://github.com/Tissu36/KrushyAi/blob/main/training/README.md" target="_blank" rel="noreferrer">Open-source model collection ↗</a></div></aside>
    {sidebar&&<button className="scrim" onClick={()=>setSidebar(false)}/>}
  </main>;
}
