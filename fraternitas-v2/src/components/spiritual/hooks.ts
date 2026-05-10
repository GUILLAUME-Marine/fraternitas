"use client";
// ─── hooks.ts ─────────────────────────────────────────────────────────────────
// Hooks React pour la persistence locale.
// Les clés localStorage sont scopées par userId pour isoler les données
// entre utilisateurs sur le même navigateur.
// Compatible avec la clé existante "fraternitas_rosary_v3" de chapelet/page.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { getTodayMystery } from "./data";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RosaryProgress {
  mysteryType: string;
  decadeIndex: number;
  grainIndex: number; // -1 = Notre Père, 0-9 = Ave Maria, 10 = Gloire
  intention: string;
  startedAt?: string;
}

export interface PersonalIntention {
  id: string;
  text: string;
  at: string;
  updatedAt?: string;
}

// ── Helpers localStorage sécurisés ───────────────────────────────────────────

function lsGet(key: string): string {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}
function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* silencieux */ }
}
function lsRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* silencieux */ }
}

// ── Clés localStorage ─────────────────────────────────────────────────────────
// Note : ROSARY_KEY reste sans userId pour rester compatible avec chapelet/page.tsx existant

function rosaryKey(): string            { return "fraternitas_rosary_v3"; }
function intentionsKey(uid: string): string { return `fraternitas_intentions_v1_${uid}`; }
function peopleKey(uid: string): string { return `fraternitas_prayer_people_v1_${uid}`; }

// ── useRosary ─────────────────────────────────────────────────────────────────

const DEFAULT_ROSARY: RosaryProgress = {
  mysteryType: "glorieux",
  decadeIndex: 0,
  grainIndex: -1,
  intention: "",
};

export function useRosary() {
  const [progress, setProgress] = useState<RosaryProgress>(DEFAULT_ROSARY);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const raw = lsGet(rosaryKey());
    if (raw) {
      try {
        const p = JSON.parse(raw) as RosaryProgress;
        setProgress(p);
        setHasProgress(p.decadeIndex > 0 || p.grainIndex >= 0);
      } catch {
        setProgress({ ...DEFAULT_ROSARY, mysteryType: getTodayMystery() });
      }
    } else {
      setProgress({ ...DEFAULT_ROSARY, mysteryType: getTodayMystery() });
    }
  }, []);

  const save = useCallback((p: RosaryProgress) => {
    setProgress(p);
    setHasProgress(p.decadeIndex > 0 || p.grainIndex >= 0);
    lsSet(rosaryKey(), JSON.stringify(p));
  }, []);

  const clear = useCallback(() => {
    const fresh: RosaryProgress = { mysteryType: getTodayMystery(), decadeIndex: 0, grainIndex: -1, intention: "" };
    setProgress(fresh);
    setHasProgress(false);
    lsRemove(rosaryKey());
  }, []);

  const changeMystery = useCallback(() => {
    const keys = ["joyeux", "lumineux", "douloureux", "glorieux"];
    const next = keys[(keys.indexOf(progress.mysteryType) + 1) % keys.length];
    const fresh: RosaryProgress = { mysteryType: next, decadeIndex: 0, grainIndex: -1, intention: "" };
    setProgress(fresh);
    setHasProgress(false);
    lsRemove(rosaryKey());
  }, [progress.mysteryType]);

  const percent = Math.max(0, Math.min(100,
    Math.round(((progress.decadeIndex * 11 + (progress.grainIndex + 1)) / 55) * 100)
  ));

  const humanPosition = (): string => {
    const labels: Record<string, string> = {
      joyeux: "Mystères Joyeux", lumineux: "Mystères Lumineux",
      douloureux: "Mystères Douloureux", glorieux: "Mystères Glorieux",
    };
    const label = labels[progress.mysteryType] ?? "";
    const d = progress.decadeIndex + 1;
    const g = progress.grainIndex;
    if (g < 0)  return `${label} · ${d}e mystère · Notre Père`;
    if (g <= 9) return `${label} · ${d}e mystère · grain ${g + 1}/10`;
    return `${label} · ${d}e mystère · Gloire au Père`;
  };

  return { progress, hasProgress, percent, save, clear, changeMystery, humanPosition };
}

// ── usePersonalIntentions ─────────────────────────────────────────────────────
// Intentions personnelles (localStorage) — distinct des intentions du cercle (Prisma)

export function usePersonalIntentions(userId: string) {
  const [items, setItems] = useState<PersonalIntention[]>([]);

  useEffect(() => {
    if (!userId) return;
    const raw = lsGet(intentionsKey(userId));
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch { setItems([]); }
    }
  }, [userId]);

  const save = useCallback((list: PersonalIntention[]) => {
    setItems(list);
    lsSet(intentionsKey(userId), JSON.stringify(list.slice(0, 20)));
  }, [userId]);

  const add = useCallback((text: string) => {
    const item: PersonalIntention = { id: Date.now().toString(), text, at: new Date().toISOString() };
    save([item, ...items]);
  }, [items, save]);

  const update = useCallback((id: string, text: string) => {
    save(items.map(i => i.id === id ? { ...i, text, updatedAt: new Date().toISOString() } : i));
  }, [items, save]);

  const remove = useCallback((id: string) => {
    save(items.filter(i => i.id !== id));
  }, [items, save]);

  return { items, add, update, remove };
}

// ── usePeople ─────────────────────────────────────────────────────────────────
// Personnes à porter dans la prière — liste de prénoms

export function usePeople(userId: string) {
  const [people, setPeople] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const raw = lsGet(peopleKey(userId));
    if (raw) {
      try { setPeople(JSON.parse(raw)); } catch { setPeople([]); }
    }
  }, [userId]);

  const save = useCallback((list: string[]) => {
    setPeople(list);
    lsSet(peopleKey(userId), JSON.stringify(list.slice(0, 80)));
  }, [userId]);

  const add = useCallback((names: string) => {
    const current = people;
    const toAdd = names.split(",").map(n => n.trim()).filter(n => n && !current.includes(n));
    if (toAdd.length) save([...current, ...toAdd]);
  }, [people, save]);

  const remove = useCallback((index: number) => {
    save(people.filter((_, i) => i !== index));
  }, [people, save]);

  return { people, add, remove };
}
