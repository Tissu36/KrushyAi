"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Model = { id:string; name:string; maker:string; tag:string; task:string };
type Message = { role:"user"|"assistant"; content:string };
const starters = ["Build me a responsive website","Explain this code and fix the bugs","Create a React component","Help me plan my next project"];
export default function Home() {
  const [models,setModels] = useState<Model[]>([]);
  const [model,setModel] = useState("openai/gpt-6.2-sol");
  const [mode,setMode] = useState<"chat"|"code">("chat");
  const [messages,setMessages] = useState<Message[]>([]);
  const [input,setInput] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [listening,setListening] = useState(false);
  const [speaking,setSpeaking] = useState(false);
  const [sidebar,setSidebar] = useState(false);
  const [history,setHistory] = useState<string[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const selected = useMemo(()=>models.find(m=>m.id===model),[models,model]);
  useEffect(()=>{ fetch("/api/models").then(r=>r.json()).then(d=>{setModels(d.models||[])}).catch(()=>{}); try { const h=JSON.parse(localStorage.getItem("krushy-history")||"[]"); setHistory(h); } catch {} },[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
  useEffect(()=>{if(messages.length){const h=[messages.filter(m=>m.role==="user").at(-1)?.content||"New chat",...history].slice(0,12);setHistory(h);localStorage.setItem("krushy-history",JSON.stringify(h));}},[messages.length]);
  async function send(text=input) {
    const value=text.trim(); if(!value||busy)return;
    const next=[...messages,{role:"user" as const,content:value}]; setMessages(next);setInput("");setError("");setBusy(true);
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,mode,messages:next})});
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||"Request failed");}
      if(!res.body)throw new Error("Streaming is not supported by this response.");
      const reader=res.body.getReader();const decoder=new TextDecoder();let answer="";
      setMessages([...next,{role:"assistant",content:""}]);
      while(true){const {value,done}=await reader.read();if(done)break;const chunk=decoder.decode(value,{stream:true});for(const line of chunk.split("\n")){if(!line.startsWith("data: "))continue;const raw=line.slice(6).trim();if(raw==="[DONE]")continue;try{const json=JSON.parse(raw);answer+=json.choices?.[0]?.delta?.content||"";setMessages([...next,{role:"assistant",content:answer}]);}catch{}}}
    }catch(e){setError(e instanceof Error?e.message:"Something went wrong.");setMessages(next);}finally{setBusy(false);}
  }
  function voiceInput(){
    const w=window as Window & {webkitSpeechRecognition?:new()=>any;SpeechRecognition?:new()=>any};
    const C=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!C){setError("Voice input is not supported in this browser. Try Chrome.");return;}
    const recognition=new C();recognition.lang="en-CA";recognition.interimResults=true;recognition.onstart=()=>setListening(true);recognition.onend=()=>setListening(false);recognition.onerror=()=>{setListening(false);setError("Microphone unavailable. Check browser permissions.");};recognition.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setInput(t);};recognition.start();
  }
  function speak(text:string){if(!("speechSynthesis" in window)){setError("Speech playback is unavailable.");return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.onstart=()=>setSpeaking(true);u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);window.speechSynthesis.speak(u);}
  function fresh(){setMessages([]);setError("");setInput("");setSidebar(false);}
  return <main className="shell">
    <aside className={`sidebar ${sidebar?"open":""}`}>
      <div className="brand"><div className="brand-mark">K<span>.</span></div><div><b>KRUSHY<span> AI</span></b><small>YOUR AI WORKSPACE</small></div><button className="mobile-close" onClick={()=>setSidebar(false)}>×</button></div>
      <button className="new-chat" onClick={fresh}><span>＋</span> New chat</button>
      <div className="side-label">WORKSPACE</div>
      <button className={mode==="chat"?"nav active":"nav"} onClick={()=>setMode("chat")}><span>◉</span> AI Chat</button>
      <button className={mode==="code"?"nav active":"nav"} onClick={()=>setMode("code")}><span>⌘</span> Code Studio <em>PRO</em></button>
      <button className="nav" onClick={()=>setError("Voice mode: use the microphone beside the message box to talk, then tap the speaker on an answer.")}><span>◖</span> Voice chat</button>
      <div className="side-label history-label">RECENT CHATS</div>
      <div className="history">{history.map((h,i)=><button key={i} onClick={()=>{setInput(h);setSidebar(false)}}>◦ <span>{h}</span></button>)}</div>
      <div className="side-bottom"><div className="profile"><div className="avatar">K</div><div><b>KRUSHY</b><small>Personal workspace</small></div><span className="online-dot"/></div><div className="powered">POWERED BY MULTI-MODEL AI</div></div>
    </aside>
    <section className="main">
      <header className="topbar"><button className="menu-btn" onClick={()=>setSidebar(!sidebar)}>☰</button><div className="crumb">Workspace <span>/</span> <b>{mode==="code"?"Code Studio":"AI Chat"}</b></div><div className="top-right"><span className="status-dot"/> <span className="status-text">SYSTEM ONLINE</span><button className="icon-btn" onClick={fresh} title="New chat">＋</button></div></header>
      <div className="content">
        <div className="hero-kicker"><span/> KRUSHY AI V1 <span className="line"/></div>
        {messages.length===0?<div className="welcome"><div className="orb"><div className="orb-core">K</div><i/><i/><i/></div><h1>{mode==="code"?"LET'S BUILD.":"WHAT'S ON YOUR MIND?"}</h1><p>{mode==="code"?"Your AI coding partner. Plan, write, debug and understand code.":"One workspace. The world's leading AI models. Your next big idea starts here."}</p>
          <div className="model-strip"><span className="model-pulse"/> SELECTED MODEL <b>{selected?.name||"GPT-6.2 Sol"}</b><span className="model-maker">{selected?.maker||"OpenAI"}</span></div>
          <div className="quick-grid">{(mode==="code"?["Build a full website","Debug my code","Explain a function","Design an app UI"]:starters).map((s,i)=><button key={s} className="quick" onClick={()=>send(s)}><span>{["↗","⌘","✳","◇"][i]}</span>{s}<b>↗</b></button>)}</div>
        </div>:<div className="conversation">{messages.map((m,i)=><article className={`message ${m.role}`} key={i}><div className="message-avatar">{m.role==="user"?"YOU":"K"}</div><div className="message-body"><div className="message-head">{m.role==="user"?"YOU":"KRUSHY AI"}{m.role==="assistant"&&<button className="speak" onClick={()=>speak(m.content)}>▶ Listen</button>}</div><div className="message-text">{m.content||" "}</div></div></article>)}{busy&&messages.at(-1)?.role==="user"&&<div className="thinking"><span/> KRUSHY AI IS THINKING</div>}<div ref={bottom}/></div>}
        {error&&<div className="error"><b>!</b> {error}<button onClick={()=>setError("")}>×</button></div>}
        <div className="composer-wrap"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask KRUSHY AI to write, debug or explain code...":"Message KRUSHY AI..."} rows={2}/><div className="composer-bottom"><div className="composer-tools"><button className={mode==="code"?"tool selected":"tool"} onClick={()=>setMode(mode==="code"?"chat":"code")}>⌘ <span>Code</span></button><button className={listening?"tool selected":"tool"} onClick={voiceInput}>{listening?"●":"◖"} <span>{listening?"Listening":"Voice"}</span></button><span className="hint">Enter to send · Shift + Enter for new line</span></div><button className="send" onClick={()=>send()} disabled={busy||!input.trim()}>{busy?"…":"↑"}</button></div></div><div className="composer-note">KRUSHY AI can make mistakes. Check important information.</div></div>
      </div>
    </section>
    <aside className="model-panel"><div className="panel-title">MODEL SELECTOR <span>● LIVE</span></div><p>Choose the intelligence for your task.</p><div className="model-list">{models.map((m,i)=><button key={m.id} className={model===m.id?"model-option chosen":"model-option"} onClick={()=>setModel(m.id)}><div className="model-icon">{m.maker==="OpenAI"?"◎":m.maker==="Anthropic"?"A":m.maker==="Google"?"✦":m.maker==="xAI"?"X":m.maker==="DeepSeek"?"D":m.maker==="Qwen"?"Q":"✳"}</div><div className="model-info"><b>{m.name}</b><small>{m.maker} · {m.task}</small></div><span className="radio">{model===m.id?"●":"○"}</span></button>)}</div><div className="panel-footer"><div className="secure">♢ <span><b>PRIVATE CONNECTION</b><small>API keys stay on the server</small></span></div><a href="https://openrouter.ai/models" target="_blank" rel="noreferrer">Browse model catalog ↗</a></div></aside>
    {sidebar&&<button className="scrim" onClick={()=>setSidebar(false)}/>}
  </main>;
}
