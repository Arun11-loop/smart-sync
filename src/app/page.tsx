'use client'

import React, { useState, useEffect } from 'react'
import DashboardMap from '@/components/ui/DashboardMap'
import VoiceDispatch from '@/components/ui/VoiceDispatch'
import { AlertTriangle, UserCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [needs, setNeeds] = useState<any[]>([])
  const [matchingNeedId, setMatchingNeedId] = useState<string | null>(null)
  const [matchResults, setMatchResults] = useState<Record<string, any>>({})

  const handleVoiceDispatch = (newNeed: any, matchData: any) => {
    setNeeds(prev => [newNeed, ...prev]);
    setMatchResults(prev => ({ ...prev, [newNeed.id]: matchData }));
  }

  useEffect(() => {
    fetchNeeds()
  }, [])

  const fetchNeeds = async () => {
    const { data, error } = await supabase.from('needs_reports').select('*').order('created_at', { ascending: false })
    if (data) setNeeds(data)
  }

  const handleMatch = async (needId: string, description: string) => {
    setMatchingNeedId(needId)
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needDescription: description })
      })
      const data = await response.json()
      if (response.ok) {
        setMatchResults(prev => ({ ...prev, [needId]: data.match }))
      }
    } catch (error) {
      console.error("Match failed", error)
    } finally {
      setMatchingNeedId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-8 bg-background text-foreground">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Command Center</h1>
          <p className="text-gray-400">Real-time crisis visualization and AI volunteer matching.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-full min-h-[600px]">
        {/* Left Panel: Map */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-2 relative h-[600px] lg:h-auto focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background" tabIndex={-1}>
          <DashboardMap 
            needs={needs} 
            matchResults={matchResults} 
            onMatch={handleMatch} 
            matchingNeedId={matchingNeedId} 
          />
        </div>

        {/* Right Panel: Data & Matching UI */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-6">
          <h2 className="text-xl font-semibold border-b border-border pb-4">Urgent Needs</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4">
             {needs.length === 0 && <p className="text-gray-500 text-sm italic">No urgent needs reported yet.</p>}
             {needs.map((need) => (
               <div key={need.id} className="p-4 bg-background border border-border rounded-lg" role="region" aria-label={`Urgent Need: ${need.description}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${need.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'}`}>
                      <AlertTriangle size={12} aria-hidden="true" /> {need.urgency} Priority
                    </span>
                    <span className="text-xs text-gray-500">{need.location}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 text-white">{need.description}</h3>
                  
                  {matchResults[need.id] ? (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md" aria-live="polite">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <UserCheck size={16} />
                        <span className="font-semibold text-sm">Matched: {matchResults[need.id].bestMatchName}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{matchResults[need.id].reasoning}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleMatch(need.id, need.description)}
                      disabled={matchingNeedId === need.id}
                      className="mt-3 w-full bg-primary hover:bg-accent disabled:bg-primary/50 text-primary-foreground py-2 text-sm rounded-md transition-colors flex justify-center items-center gap-2"
                      aria-label="Match Volunteer via AI"
                    >
                      {matchingNeedId === need.id ? (
                         <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                         "Match Volunteer via AI"
                      )}
                    </button>
                  )}
               </div>
             ))}
          </div>
        </div>
      </div>
      
      <VoiceDispatch onDispatchComplete={handleVoiceDispatch} />
    </div>
  )
}
