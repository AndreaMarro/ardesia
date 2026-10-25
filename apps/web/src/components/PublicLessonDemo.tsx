import {useEffect, useRef, useState} from "react";
import {publicLessonDemo} from "../publicPreview";

export function PublicLessonDemo({onShowFormula}: {onShowFormula: () => void}) {
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
    try {await audio.play();}
    catch {setError("L’audio locale non è disponibile. Puoi leggere lo stesso passaggio nella trascrizione.");}
    finally {setLoading(false);}
  }
  return <div className="lesson-demo" data-testid="lesson-demo">
    <p className="lesson-demo-label">Voce sintetica dimostrativa</p>
    <button type="button" disabled={loading} aria-pressed={playing} onClick={() => void toggle()}>{loading ? "Apro l’audio…" : playing ? "Pausa audio" : "Ascolta il passaggio"}</button>
    <audio ref={player} controls preload="none" aria-label="Ascolta il passaggio sul vincolo" src={import.meta.env.BASE_URL + publicLessonDemo.audioPath}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    {error && <p role="alert">{error}</p>}
    <blockquote>{publicLessonDemo.transcript}</blockquote>
    <p className="fine-print">{publicLessonDemo.authorship}. <a href={"#" + publicLessonDemo.objectId} onClick={onShowFormula}>Ritrova la formula collegata</a>.</p>
  </div>;
}
