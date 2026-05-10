"use client";
// ─── panels/PanneauDroite.tsx v2 ──────────────────────────────────────────────
// Compact sur mobile : petits compteurs, pas de grandes cartes
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

interface CircleIntention {
  id: string; text: string; user: {name:string;image:string|null}|null; prayCount: number; at: string;
}

interface PanneauDroiteProps {
  people:               string[];
  onOpenPeoplePage:     () => void;
  onOpenIntentionsList: () => void;
  onOpenIntentionModal: () => void;
}

export default function PanneauDroite({
  people, onOpenPeoplePage, onOpenIntentionsList, onOpenIntentionModal,
}: PanneauDroiteProps) {
  const [intentions, setIntentions]   = useState<CircleIntention[]>([]);
  const [loadingInt, setLoadingInt]   = useState(true);
  const [prayingId, setPrayingId]     = useState<string|null>(null);

  useEffect(() => {
    setLoadingInt(true);
    fetch("/api/intentions?filter=all&page=1")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.intentions) setIntentions(data.intentions.slice(0,5)); })
      .catch(() => {})
      .finally(() => setLoadingInt(false));
  }, []);

  const handlePray = async (id: string) => {
    setPrayingId(id);
    try {
      await fetch(`/api/intentions/${id}/pray`, {method:"POST"});
      setIntentions(prev => prev.map(i => i.id===id ? {...i,prayCount:i.prayCount+1} : i));
    } catch {} finally { setPrayingId(null); }
  };

  return (
    <aside id="intentions" className="intentions-panel fu" style={{animationDelay:".12s"}}>

      {/* ── Personnes à porter — compact ── */}
      <div style={{marginBottom:14}}>
        <p className="pk" style={{marginBottom:6}}>Liste de prière</p>

        {people.length === 0 ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <span style={{fontSize:13,color:"var(--ink50)"}}>Aucune personne ajoutée</span>
            <button className="btn-dark-small" onClick={onOpenPeoplePage} style={{fontSize:11,padding:"7px 12px"}}>
              Ajouter →
            </button>
          </div>
        ) : (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontFamily:"var(--serif)",fontSize:16,fontWeight:400,color:"var(--ink)"}}>
                {people.length} personne{people.length>1?"s":""}
              </span>
              <button onClick={onOpenPeoplePage} style={{fontSize:11,fontWeight:600,color:"var(--gold)",background:"none",border:"none",cursor:"pointer"}}>
                Gérer →
              </button>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {people.slice(0,4).map((p,i) => (
                <span key={i} style={{fontSize:11,background:"var(--cream3)",border:"1px solid var(--gold-b)",borderRadius:99,padding:"3px 8px",color:"var(--ink65)"}}>{p}</span>
              ))}
              {people.length > 4 && <span style={{fontSize:11,color:"var(--ink35)"}}>+{people.length-4}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Séparateur */}
      <div style={{height:1,background:"var(--ink12)",marginBottom:14}}/>

      {/* ── Intentions du cercle — compact ── */}
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <p className="pk" style={{marginBottom:0}}>Intentions du cercle</p>
          <button onClick={onOpenIntentionModal} style={{fontSize:11,fontWeight:600,color:"var(--gold)",background:"none",border:"none",cursor:"pointer"}}>
            + Partager
          </button>
        </div>

        {loadingInt ? (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[1,2].map(i=><div key={i} style={{height:40,borderRadius:10,background:"rgba(17,16,9,.06)"}}/>)}
          </div>
        ) : intentions.length === 0 ? (
          <div style={{textAlign:"center",padding:"14px 0"}}>
            <p style={{fontSize:12,color:"var(--ink35)",marginBottom:10}}>Aucune intention partagée</p>
            <button className="btn-int" onClick={onOpenIntentionModal} style={{fontSize:12}}>
              Partager une intention →
            </button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
              {intentions.map(intent => (
                <div key={intent.id} style={{background:"var(--cream3)",border:"1px solid var(--gold-b)",borderRadius:12,padding:"10px 12px"}}>
                  <p style={{fontFamily:"var(--serif)",fontSize:13,fontStyle:"italic",color:"var(--ink80)",lineHeight:1.45,marginBottom:6}}>
                    {intent.text}
                  </p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,color:"var(--ink35)"}}>{intent.user?.name??"Anonyme"}</span>
                    <button
                      style={{fontSize:11,fontWeight:600,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",opacity:prayingId===intent.id?0.5:1}}
                      onClick={()=>handlePray(intent.id)} disabled={prayingId===intent.id}
                    >
                      🙏 {intent.prayCount>0?intent.prayCount:""} Je prie
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onOpenIntentionsList} style={{width:"100%",fontSize:12,fontWeight:600,color:"var(--ink50)",background:"none",border:"1px solid var(--ink12)",borderRadius:99,padding:"8px",cursor:"pointer"}}>
              Voir toutes les intentions →
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
