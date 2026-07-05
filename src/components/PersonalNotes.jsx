import { useState, useEffect } from 'react'

export default function PersonalNotes({ roomCode, playerId }) {
  const key = `notes_${roomCode}_${playerId}`
  const [notes, setNotes] = useState(() => localStorage.getItem(key) ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(key, notes)
  }, [notes, key])

  return (
    <div className="card">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          📝 Mis pistas sobre mí
        </p>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anota aquí lo que crees que eres… ¿Senderismo o Videojuegos? ¿Madrugador?"
            rows={4}
            className="w-full text-xs text-gray-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
          />
          <p className="text-xs text-gray-400 mt-1">Solo tú ves esto — se guarda automáticamente</p>
        </div>
      )}
    </div>
  )
}
