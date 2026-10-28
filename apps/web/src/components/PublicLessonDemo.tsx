import {useEffect, useRef, useState} from "react";
import {publicLessonDemo} from "../publicPreview";

export function PublicLessonDemo({onShowFormula,lesson}: {onShowFormula: () => void;lesson?:{audioPath:string;transcript:string;authorship:string;objectId?:string}}) {
  const demo=lesson||publicLessonDemo;
  const player = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    const audio = player.current;
    return () => {if (audio && !audio.paused) audio.pause();};
  }, []);
  async function toggle() {
    const audio = player.current;
    if (!audio || loading) return;
    if (!audio.paused) {audio.pause(); return;}
    setLoading(true); setError("");
    try {
      if (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) audio.load();
      await audio.play();
    }
    catch {setError("L’audio non è disponibile al momento. Puoi riprovare. Puoi leggere lo stesso passaggio nella trascrizione.");}
    finally {setLoading(false);}
  }
  return <div className="lesson-demo" data-testid="lesson-demo">
    <p className="lesson-demo-label">Voce sintetica dimostrativa</p>
    <button type="button" disabled={loading} aria-pressed={playing} onClick={() => void toggle()}>{loading ? "Apro l’audio…" : playing ? "Pausa audio" : "Ascolta il passaggio"}</button>
    <audio ref={player} controls preload="none" aria-label={lesson ? "Ascolta il passaggio della lezione" : "Ascolta il passaggio sul vincolo"} src={import.meta.env.BASE_URL + demo.audioPath}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    {error && <p role="alert">{error}</p>}
    <blockquote>{demo.transcript}</blockquote>
    <p className="fine-print">{demo.authorship}. {demo.objectId&&<a href={"#" + demo.objectId} onClick={onShowFormula}>Ritrova la formula collegata</a>}.</p>
  </div>;
}
