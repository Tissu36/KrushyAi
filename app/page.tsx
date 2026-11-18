"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Model = { id:string; name:string; maker:string; tag:string; task:string; category?:"chat"|"code"|"both"; configured?:boolean; github?:string };
type Message = { role:"user"|"assistant"; content:string; imageUrl?:string; modelUsed?:string; fallbackAttempted?:boolean };
type ImageAttachment = { dataUrl:string; name:string; size:number };
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
async function prepareImage(file:File):Promise<ImageAttachment>{
  const allowed = ["image/png","image/jpeg","image/webp","image/gif"];
  if(!allowed.includes(file.type)) throw new Error("Use a PNG, JPEG, WebP, or GIF image.");
  if(file.size>20*1024*1024) throw new Error("That image is too large to process. Choose an image under 20 MB.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1,2048/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext("2d");if(!context){bitmap.close();throw new Error("Your browser could not process this image.");}
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  let blob:Blob|null=null;
  for(let attempt=0;attempt<7;attempt++){
    const quality=Math.max(.48,.86-attempt*.07);
    blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",quality));
    if(blob&&blob.size<=MAX_UPLOAD_BYTES)break;
    if(attempt===3){canvas.width=Math.max(1,Math.round(canvas.width*.82));canvas.height=Math.max(1,Math.round(canvas.height*.82));}
  }
  if(!blob||blob.size>MAX_UPLOAD_BYTES)throw new Error("Could not compress this image below 4 MB. Try a smaller image.");
  const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not read the image."));reader.readAsDataURL(blob!);});
  return {dataUrl,name:file.name,size:blob.size};
}
const starters = ["Build me a responsive website","Explain this code and fix the bugs","Create a React component","Help me plan my next project"];
export default function Home() {
  const [models,setModels] = useState<Model[]>([]);
  const [model,setModel] = useState("krushy-max");
  const [mode,setMode] = useState<"chat"|"code">("chat");
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [listening,setListening] = useState(false);
  const [speaking,setSpeaking] = useState(false);
  const [sidebar,setSidebar] = useState(false);
  const [history,setHistory] = useState<string[]>([]);\n  const [attachment,setAttachment] = useState<ImageAttachment|null>(null);\n  const [compressing,setCompressing] = useState(false);\n  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const selected = useMemo(()=>models.find(m=>m.id===model),[models,model]);
  const activeModels = useMemo(()=>models.filter(m=>m.category==="both"||m.category===mode),[models,mode]);
  function changeMode(next:"chat"|"code"){setMode(next);const current=models.find(m=>m.id===model);if(current&&current.category!=="both"&&current.category!==next){const best=models.find(m=>m.category===next&&m.configured);setModel(best?.id||"krushy-max");}}
  useEffect(()=>{ fetch("/api/models").then(r=>r.json()).then(d=>{const available=d.models||[];setModels(available);if(available.some((m:Model)=>m.id==="krushy-max"&&m.configured))setModel("krushy-max")}).catch(()=>{}); try { const h=JSON.parse(localStorage.getItem("krushy-history")||"[]"); setHistory(h); } catch {} },[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
  useEffect(()=>{if(messages.length){const h=[messages.filter(m=>m.role==="user").at(-1)?.content||"New chat",...history].slice(0,12);setHistory(h);localStorage.setItem("krushy-history",JSON.stringify(h));}},[messages.length]);
  async function send(text=input) {
    const value=text.trim(); if(!value||busy)return;
    const chosen=models.find(m=>m.id===model);
    if(!chosen?.configured){setError("This model is not connected yet. Configure your model gateway first.");return;}
    const imageForSend=attachment;\n    const next=[...messages,{role:"user" as const,content:value,imageUrl:imageForSend?.dataUrl}]; setMessages(next);setInput("");setAttachment(null);setError("");setBusy(true);
    try {
      const apiMessages=next.map((m,i)=>i===next.length-1&&imageForSend?{role:m.role,content:[{type:"text",text:m.content},{type:"image_url",image_url:{url:imageForSend.dataUrl}}]}:{role:m.role,content:m.content});\n      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,mode,messages:apiMessages})});
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"Request failed");}
      if(!res.body)throw new Error("Streaming is not supported by this response.");
      const reader=res.body.getReader();const decoder=new TextDecoder();let answer="";
      setMessages([...next,{role:"assistant",content:""}]);
      while(true){const {value,done}=await reader.read();if(done)break;const chunk=decoder.decode(value,{stream:true});for(const line of chunk.split("\n")){if(!line.startsWith("data: "))continue;const raw=line.slice(6).trim();if(raw==="[DONE]")continue;try{const json=JSON.parse(raw);answer+=json.choices?.[0]?.delta?.content||"";setMessages([...next,{role:"assistant",content:answer,modelUsed,fallbackAttempted}]);}catch{}}}
    }catch(e){setError(e instanceof Error?e.message:"Something went wrong.");setMessages(next);}finally{setBusy(false);}
  }
  function voiceInput(){
    const w=window as Window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
    const C=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!C){setError("Voice input is not supported in this browser. Try Chrome.");return;}
    const recognition=new C();recognition.lang="en-CA";recognition.interimResults=true;recognition.onstart=()=>setListening(true);recognition.onend=()=>setListening(false);recognition.onerror=()=>{setListening(false);setError("Microphone unavailable. Check browser permissions.");};recognition.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setInput(t);};recognition.start();
  }
  function speak(text:string){if(!("speechSynthesis" in window)){setError("Speech playback is unavailable.");return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(u);}
  async function pickImage(event:React.ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;const vision=models.find(m=>m.id==="slot-7-vision"&&m.configured)||models.find(m=>m.id==="slot-3-multimodal"&&m.configured);if(model!=="krushy-max"&&model!=="slot-3-multimodal"&&model!=="slot-7-vision"){if(vision){setModel(vision.id);setError(`Switched to ${vision.name} for image understanding.`);}else{setError("Connect Slot 3 or Slot 7 before sending images.");return;}}else if(model!=="krushy-max"&&!selected?.configured){setError("Connect this vision model before uploading images.");return;}setCompressing(true);setError("");try{setAttachment(await prepareImage(file));}catch(e){setError(e instanceof Error?e.message:"Image processing failed.");}finally{setCompressing(false);}}\n  function fresh(){setMessages([]);setError("");setInput("");setAttachment(null);setSidebar(false);}
  return <main className="shell">
    <aside className={`sidebar ${sidebar?"open":""}`}>
      <div className="brand"><div className="brand-mark">K<span>.</span></div><div><b>KRUSHY<span> AI</span></b><small>YOUR AI WORKSPACE</small></div><button className="mobile-close" onClick={()=>setSidebar(false)}>×</button></div>
      <button className="new-chat" onClick={fresh}><span>＋</span> New chat</button>
      <div className="side-label">WORKSPACE</div>
      <button className={mode==="chat"?"nav active":"nav"} onClick={()=>changeMode("chat")}><span>◉</span> AI Chat</button>
      <button className={mode==="code"?"nav active":"nav"} onClick={()=>changeMode("code")}><span>⌘</span> KRUSHY CODE <em>PRO</em></button>
      <button className="nav" onClick={()=>setError("Voice mode: use the microphone beside the message box to talk, then tap the speaker on an answer.")}><span>◖</span> Voice chat</button>
      <div className="side-label history-label">RECENT CHATS</div>
      <div className="history">{history.map((h,i)=><button key={i} onClick={()=>{setInput(h);setSidebar(false)}}>◦ <span>{h}</span></button>)}</div>
      <div className="side-bottom"><div className="profile"><div className="avatar">K</div><div><b>KRUSHY</b><small>Personal workspace</small></div><span className="online-dot"/></div><div className="powered">KRUSHY MODEL FAMILY</div></div>
    </aside>
    <section className="main">
      <header className="topbar"><button className="menu-btn" onClick={()=>setSidebar(!sidebar)}>☰</button><div className="crumb">Workspace <span>/</span> <b>{mode==="code"?"KRUSHY CODE":"AI Chat"}</b></div><div className="top-right"><span className="status-dot"/> <span className="status-text">SYSTEM ONLINE</span><button className="icon-btn" onClick={fresh} title="New chat">＋</button></div></header>
      <div className="content">
        <div className="hero-kicker"><span/> KRUSHY Ω · MODEL LAB <span className="line"/></div>
        <select className="mobile-model" value={model} onChange={e=>setModel(e.target.value)} aria-label="Choose AI model">{activeModels.map(m=><option key={m.id} value={m.id} disabled={!m.configured}>{m.name} — {m.configured?"Connected":"Not connected"}</option>)}</select>
        {messages.length===0?<div className="welcome"><div className="orb"><div className="orb-core">K</div><i/><i/><i/></div><h1>{mode==="code"?"LET'S BUILD.":"WHAT'S ON YOUR MIND?"}</h1><p>{mode==="code"?"Your AI coding partner. Plan, write, debug and understand code.":"Five chat candidates. Five coding specialists. One combined intelligence."}</p>
          <div className="model-strip"><span className="model-pulse"/> SELECTED MODEL <b>{selected?.name||"KRUSHY MAX"}</b><span className="model-maker">{selected?.tag||"Connect model gateway"}</span></div>
          <div className="quick-grid">{(mode==="code"?["Build a full website","Debug my code","Explain a function","Design an app UI"]:starters).map((s,i)=><button key={s} className="quick" onClick={()=>send(s)}><span>{["↗","⌘","✳","◇"][i]}</span>{s}<b>↗</b></button>)}</div>
        </div>:<div className="conversation">{messages.map((m,i)=><article className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==="user"?"YOU":"K"}</div><div className="message-body"><div className="message-head">{m.role==="user"?"YOU":"KRUSHY AI"}{m.role==="assistant"&&<button className="speak" onClick={()=>speak(m.content)}>▶ Listen</button>}</div><div className="message-text">{m.content||" "}</div>{m.imageUrl&&<img className="message-image" src={m.imageUrl} alt="User attachment"/>}{m.role==="assistant"&&m.modelUsed&&<div className="message-meta">{m.modelUsed}{m.fallbackAttempted&&<span>FALLBACK USED</span>}</div>}</div></article>)}{busy&&messages.at(-1)?.role==="user"&&<div className="thinking"><span/> KRUSHY AI IS THINKING</div>}<div ref={bottom}/></div>}
        {error&&<div className="error"><b>!</b> {error}<button onClick={()=>setError("")}>×</button></div>}
        <div className="composer-wrap"><div className="composer">{attachment&&<div className="attachment-preview"><img src={attachment.dataUrl} alt="Selected upload"/><span>{attachment.name} · {(attachment.size/1024).toFixed(0)} KB</span><button type="button" onClick={()=>setAttachment(null)} aria-label="Remove image">×</button></div>}<textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask KRUSHY AI to write, debug or explain code...":"Message KRUSHY AI..."} rows={2}/><div className="composer-bottom"><div className="composer-tools"><input ref={fileInput} className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickImage}/><button className="tool" type="button" onClick={()=>fileInput.current?.click()} disabled={compressing||busy} title="Attach image">▧ <span>{compressing?"Preparing":"Image"}</span></button><button className={mode==="code"?"tool selected":"tool"} onClick={()=>changeMode(mode==="code"?"chat":"code")}>⌘ <span>Code</span></button><button className={listening?"tool selected":"tool"} onClick={voiceInput}>{listening?"●":"◖"} <span>{listening?"Listening":"Voice"}</span></button><span className="hint">Enter to send · Shift + Enter for new line</span></div><button className="send" onClick={()=>send()} disabled={busy||!input.trim()}>{busy?"…":"↑"}</button></div></div><div className="composer-note">{model==="krushy-max"||model==="slot-3-multimodal"||model==="slot-7-vision"?"Images supported · PNG, JPEG, WebP, GIF · compressed to max 4 MB":"Attach an image to switch to a vision-capable model"} · KRUSHY AI can make mistakes.</div></div>
      </div>
    </section>
    <aside className="model-panel"><div className="panel-title">MODEL SELECTOR <span>● LIVE</span></div><p>Choose a model for {mode==="code"?"coding":"chat"}. KRUSHY MAX combines multiple specialists.</p><div className="model-list">{activeModels.map((m,i)=><button key={m.id} disabled={!m.configured} className={model===m.id?"model-option chosen":"model-option"} onClick={()=>setModel(m.id)}><div className="model-icon">{m.id==="krushy-max"?"✦":m.maker==="OpenAI"?"◎":m.maker==="Google"?"✦":m.maker==="DeepSeek"?"D":m.maker==="Qwen"?"Q":m.maker==="Meta"?"M":"✳"}</div><div className="model-info"><b>{m.name}</b><small>{m.maker} · {m.task}</small><small>{m.tag}</small></div><span className="radio">{model===m.id?"●":"○"}</span></button>)}</div><div className="panel-footer"><div className="secure">♢ <span><b>PRIVATE CONNECTION</b><small>API keys stay on the server</small></span></div><a href="https://github.com/Tissu36/KrushyAi/blob/main/training/README.md" target="_blank" rel="noreferrer">Open-source model collection ↗</a></div></aside>
    {sidebar&&<button className="scrim" onClick={()=>setSidebar(false)}/>}
  </main>;
}
