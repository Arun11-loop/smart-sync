'use client'

import React, { useState } from 'react'
import { Camera, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function FieldReportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.')
      return
    }

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data.data)
      // TODO: Save to Supabase
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Field Reporter</h1>
          <p className="text-gray-400 text-sm">Snap a photo of the paper survey. AI will digitize it instantly.</p>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Upload survey image"
              data-testid="file-upload"
            />
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-500 bg-background'}`}>
              {file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mb-3" />
                  <span className="text-sm font-medium text-white">{file.name}</span>
                  <span className="text-xs text-gray-400 mt-1">Ready to process</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-gray-500 mb-3 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-white mb-1">Tap to open camera</span>
                  <span className="text-xs text-gray-400">or select from gallery</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-primary hover:bg-accent disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            aria-label={isUploading ? "Processing image with AI" : "Process Image"}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Form...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Process Form
              </>
            )}
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-8 p-4 bg-background border border-border rounded-lg" aria-live="polite">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">AI Extracted Data</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 block">Urgency</span>
                  <span className={`text-sm font-medium ${result.urgency === 'High' ? 'text-destructive' : 'text-white'}`}>{result.urgency}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Location</span>
                  <span className="text-sm text-white">{result.location}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Description</span>
                  <span className="text-sm text-white">{result.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
