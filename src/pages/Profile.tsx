import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  FiEdit2, FiCheck, FiX, FiLogOut, FiUser, FiMail,
  FiCalendar, FiShield, FiStar, FiBookmark, FiEye,
  FiCamera, FiUpload, FiTrash2, FiUsers, FiLock,
  FiChevronRight, FiSettings, FiZap, FiTv,
} from 'react-icons/fi'
import { useAuth, UserRole, RegisteredUser } from '../contexts/FirebaseAuthContext'
import { useProfile, AVATAR_COLORS } from '../hooks/useProfile'
import { useWatchlist } from '../contexts/WatchlistContext'
import { useBreakpoint } from '../hooks/useBreakpoint'

/* ── role meta ──────────────────────────────────────────────────────────── */
const ROLE_META: Record<UserRole, { label:string; symbol:string; bg:string; color:string; border:string; glow:string }> = {
  admin:   { label:'Admin',   symbol:'★', bg:'rgba(251,191,36,0.12)', color:'#fde68a', border:'rgba(251,191,36,0.3)',  glow:'#f59e0b' },
  brother: { label:'Brother', symbol:'◆', bg:'rgba(99,102,241,0.12)', color:'#c7d2fe', border:'rgba(99,102,241,0.3)',  glow:'#6366f1' },
  guest:   { label:'Guest',   symbol:'○', bg:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.4)', border:'rgba(255,255,255,0.1)', glow:'#6b7280' },
}

const TABS_BY_ROLE: Record<UserRole, { id:string; icon:React.ReactNode; label:string; desc:string }[]> = {
  admin: [
    { id:'overview',   icon:<FiUser size={15}/>,     label:'Overview',   desc:'Your profile info' },
    { id:'appearance', icon:<FiCamera size={15}/>,   label:'Appearance', desc:'Avatar & theme'    },
    { id:'security',   icon:<FiLock size={15}/>,     label:'Security',   desc:'Access & safety'   },
    { id:'admin',      icon:<FiUsers size={15}/>,    label:'Admin',      desc:'User management'   },
  ],
  brother: [
    { id:'overview',   icon:<FiUser size={15}/>,     label:'Overview',   desc:'Your profile info' },
    { id:'appearance', icon:<FiCamera size={15}/>,   label:'Appearance', desc:'Avatar & theme'    },
    { id:'security',   icon:<FiLock size={15}/>,     label:'Security',   desc:'Access & safety'   },
  ],
  guest: [
    { id:'overview',   icon:<FiUser size={15}/>,     label:'Overview',   desc:'Your profile info' },
  ],
}

/* ── animated counter ───────────────────────────────────────────────────── */
function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (to === 0) { setVal(0); return }
    let start = 0
    const step = Math.ceil(to / 20)
    const t = setInterval(() => {
      start += step
      if (start >= to) { setVal(to); clearInterval(t) }
      else setVal(start)
    }, 30)
    return () => clearInterval(t)
  }, [to])
  return <>{val}</>
}

/* ── avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ photo, initial, from, to, size=80 }: { photo:string|null; initial:string; from:string; to:string; size?:number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', flexShrink:0,
      background: photo ? 'transparent' : `linear-gradient(135deg,${from},${to})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.38, fontWeight:900, color:'white', userSelect:'none',
    }}>
      {photo ? <img src={photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initial}
    </div>
  )
}

/* ── glass card ─────────────────────────────────────────────────────────── */
function GlassCard({ children, style, accent }: { children:React.ReactNode; style?: React.CSSProperties; accent?: string }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.03)',
      border:`1px solid ${accent ? accent+'28' : 'rgba(255,255,255,0.07)'}`,
      borderRadius:18,
      backdropFilter:'blur(16px)',
      boxShadow: accent ? `0 0 0 1px ${accent}10 inset, 0 8px 32px rgba(0,0,0,0.3)` : '0 8px 32px rgba(0,0,0,0.3)',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ── section heading ────────────────────────────────────────────────────── */
function SectionHead({ icon, title, accent }: { icon:React.ReactNode; title:string; accent:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', color:accent, flexShrink:0 }}>
        {icon}
      </div>
      <h3 style={{ margin:0, fontSize:'0.78rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.5)' }}>{title}</h3>
    </div>
  )
}

/* ── field label ────────────────────────────────────────────────────────── */
const FL = ({ children }: { children:React.ReactNode }) => (
  <p style={{ margin:'0 0 5px', fontSize:'0.64rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.28)' }}>{children}</p>
)

/* ── editable field ─────────────────────────────────────────────────────── */
function EditField({ label, value, onSave, disabled }: { label:string; value:string; onSave:(v:string)=>void; disabled?:boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)

  const commit = () => {
    const t = draft.trim()
    if (t && t !== value) onSave(t)
    else setDraft(value)
    setEditing(false)
  }

  return (
    <div style={{ marginBottom:14 }}>
      <FL>{label}</FL>
      {editing && !disabled ? (
        <div style={{ display:'flex', gap:6 }}>
          <input autoFocus value={draft}
            onChange={e=>setDraft(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') commit(); if(e.key==='Escape'){setDraft(value);setEditing(false)} }}
            style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(229,9,20,0.4)', borderRadius:10, padding:'9px 13px', fontSize:'0.88rem', fontWeight:600, color:'white', outline:'none', fontFamily:'inherit' }}
          />
          <button onClick={commit} style={{ width:34, height:34, borderRadius:9, border:'none', background:'linear-gradient(135deg,#e50914,#ff5a1f)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><FiCheck size={14} color="white"/></button>
          <button onClick={()=>{setDraft(value);setEditing(false)}} style={{ width:34, height:34, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><FiX size={14} color="rgba(255,255,255,0.35)"/></button>
        </div>
      ) : (
        <div onClick={()=>!disabled&&setEditing(true)}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 13px', cursor:disabled?'default':'pointer', transition:'background 0.15s, border-color 0.15s' }}
          onMouseEnter={e=>{ if(!disabled){ const d=e.currentTarget as HTMLDivElement; d.style.background='rgba(255,255,255,0.07)'; d.style.borderColor='rgba(255,255,255,0.14)' } }}
          onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.background='rgba(255,255,255,0.04)'; d.style.borderColor='rgba(255,255,255,0.07)' }}
        >
          <span style={{ fontSize:'0.88rem', fontWeight:600, color:disabled?'rgba(255,255,255,0.3)':'white' }}>{value}</span>
          {!disabled && <FiEdit2 size={12} color="rgba(255,255,255,0.22)"/>}
        </div>
      )}
    </div>
  )
}

/* ── photo uploader ─────────────────────────────────────────────────────── */
function PhotoUploader({ current, onUpload, onRemove }: { current:string|null; onUpload:(d:string)=>void; onRemove:()=>void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const process = useCallback((file:File) => {
    if (!file.type.startsWith('image/')) return
    const r = new FileReader()
    r.onload = e => { if(e.target?.result) onUpload(e.target.result as string) }
    r.readAsDataURL(file)
  }, [onUpload])

  return (
    <div style={{ display:'flex', gap:16, alignItems:'stretch' }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{ const f=e.target.files?.[0]; if(f) process(f); e.target.value='' }}/>

      {/* preview */}
      <div style={{ width:80, height:80, borderRadius:18, overflow:'hidden', flexShrink:0, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {current ? <img src={current} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <FiUser size={24} color="rgba(255,255,255,0.18)"/>}
      </div>

      {/* drop zone */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        <div onClick={()=>inputRef.current?.click()}
          onDragOver={e=>{ e.preventDefault(); setDrag(true) }}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{ e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f) process(f) }}
          style={{ flex:1, borderRadius:12, padding:'14px 18px', cursor:'pointer', border:`2px dashed ${drag?'#e50914':'rgba(255,255,255,0.1)'}`, background:drag?'rgba(229,9,20,0.05)':'rgba(255,255,255,0.02)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, transition:'all 0.2s' }}
        >
          <FiUpload size={16} color={drag?'#e50914':'rgba(255,255,255,0.28)'}/>
          <p style={{ margin:0, fontSize:'0.75rem', fontWeight:600, color:drag?'#fca5a5':'rgba(255,255,255,0.4)' }}>Drop image here or click to browse</p>
          <p style={{ margin:0, fontSize:'0.62rem', color:'rgba(255,255,255,0.2)' }}>PNG · JPG · WEBP · max 5MB</p>
        </div>
        {current && (
          <button onClick={onRemove} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, height:32, background:'rgba(229,9,20,0.07)', border:'1px solid rgba(229,9,20,0.18)', borderRadius:9, cursor:'pointer', fontSize:'0.72rem', fontWeight:700, color:'#f87171', transition:'background 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.14)'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.07)'}
          ><FiTrash2 size={12}/> Remove photo</button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Admin Panel Component
══════════════════════════════════════════════════════════════════════════ */
function AdminPanel({ allUsers, currentUid }: { allUsers: RegisteredUser[]; currentUid: string }) {
  const { adminCreateUser, adminRemoveUser, adminUpdateRole, adminUpdateName } = useAuth()
  const { isMobile } = useBreakpoint()

  /* create form */
  const [showCreate,  setShowCreate]  = useState(false)
  const [newEmail,    setNewEmail]    = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [newName,     setNewName]     = useState('')
  const [newRole,     setNewRole]     = useState<UserRole>('brother')
  const [createErr,   setCreateErr]   = useState('')
  const [creating,    setCreating]    = useState(false)

  /* inline edit */
  const [editingUid,  setEditingUid]  = useState<string|null>(null)
  const [editName,    setEditName]    = useState('')

  /* confirm delete */
  const [deleteUid,   setDeleteUid]   = useState<string|null>(null)

  const handleCreate = async () => {
    if (!newEmail || !newPass || !newName) { setCreateErr('All fields are required.'); return }
    setCreating(true); setCreateErr('')
    try { await adminCreateUser(newEmail, newPass, newName, newRole); setShowCreate(false); setNewEmail(''); setNewPass(''); setNewName(''); setNewRole('brother') }
    catch (e: any) { setCreateErr(e.message) }
    finally { setCreating(false) }
  }

  const handleDelete = async () => {
    if (!deleteUid) return
    await adminRemoveUser(deleteUid)
    setDeleteUid(null)
  }

  const handleRoleChange = async (uid: string, role: UserRole) => {
    await adminUpdateRole(uid, role)
  }

  const handleNameSave = async (uid: string) => {
    if (editName.trim()) await adminUpdateName(uid, editName.trim())
    setEditingUid(null)
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:10, padding:'9px 12px', fontSize:'0.83rem', fontWeight:500, color:'white',
    outline:'none', fontFamily:'inherit', boxSizing:'border-box',
  }

  const stats = {
    total:   allUsers.length,
    admins:  allUsers.filter(u=>u.role==='admin').length,
    brothers:allUsers.filter(u=>u.role==='brother').length,
    guests:  allUsers.filter(u=>u.role==='guest').length,
  }

  return (
    <div style={{ display: 'flex', flexDirection:'column', gap:16 }}>

      {/* heading */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ margin:'0 0 3px', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em', background:'linear-gradient(90deg, white 30%, #fbbf24)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Admin Panel</h1>
          <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(255,255,255,0.32)' }}>Full user management — create, edit roles, and remove accounts.</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={()=>setShowCreate(true)}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', borderRadius:11, cursor:'pointer', fontSize:'0.78rem', fontWeight:800, color:'white', boxShadow:'0 4px 16px rgba(245,158,11,0.3)', flexShrink:0 }}
        >
          <FiUsers size={14}/> Create User
        </motion.button>
      </div>

      {/* stat strip */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:10 }}>
        {[
          { label:'Total Users',  val:stats.total,    color:'#fbbf24', bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.15)' },
          { label:'Admins',       val:stats.admins,   color:'#f87171', bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.15)' },
          { label:'Brothers',     val:stats.brothers, color:'#a78bfa', bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.15)' },
          { label:'Guests',       val:stats.guests,   color:'#94a3b8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.15)' },
        ].map(({ label, val, color, bg, border }) => (
          <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:13, padding:'13px 14px', textAlign:'center' }}>
            <p style={{ margin:'0 0 3px', fontSize:'1.4rem', fontWeight:900, color:'white', lineHeight:1 }}><Counter to={val}/></p>
            <p style={{ margin:0, fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color }}>{label}</p>
          </div>
        ))}
      </div>

      {/* user table */}
      <GlassCard style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX: isMobile ? 'auto' : 'visible', minWidth: isMobile ? 0 : 'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '140px 130px 90px 70px' : 'minmax(0,1.8fr) minmax(0,1.6fr) 110px 84px 72px', gap:10, padding:'10px 18px', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.07)', minWidth: isMobile ? 430 : 0 }}>
          {['User','Email','Role','Joined','Actions'].map(h=>(
            <span key={h} style={{ fontSize:'0.58rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.28)' }}>{h}</span>
          ))}
        </div>

        {allUsers.map((u, i) => {
          const rm = ROLE_META[u.role]
          const isMe = u.uid === currentUid
          const isEditing = editingUid === u.uid

          return (
            <div key={u.uid}
              style={{ display:'grid', gridTemplateColumns: isMobile ? '140px 130px 90px 70px' : 'minmax(0,1.8fr) minmax(0,1.6fr) 110px 84px 72px', gap:10, padding:'12px 18px', borderBottom: i<allUsers.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems:'center', transition:'background 0.15s', minWidth: isMobile ? 430 : 0 }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.025)'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}
            >
              {/* name */}
              <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                  background: u.role==='admin'?'linear-gradient(135deg,#f59e0b,#ef4444)':u.role==='brother'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.08)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:900, color:'white',
                  boxShadow: u.role==='admin'?'0 0 10px rgba(245,158,11,0.25)':u.role==='brother'?'0 0 10px rgba(99,102,241,0.25)':'none',
                }}>
                  {u.displayName[0].toUpperCase()}
                </div>
                <div style={{ minWidth:0 }}>
                  {isEditing ? (
                    <div style={{ display:'flex', gap:5 }}>
                      <input value={editName} onChange={e=>setEditName(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter') handleNameSave(u.uid); if(e.key==='Escape') setEditingUid(null) }}
                        autoFocus
                        style={{ ...inputStyle, padding:'5px 9px', fontSize:'0.78rem', width:110 }}
                      />
                      <button onClick={()=>handleNameSave(u.uid)} style={{ width:26, height:26, borderRadius:7, border:'none', background:'#22c55e', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><FiCheck size={12} color="white"/></button>
                      <button onClick={()=>setEditingUid(null)} style={{ width:26, height:26, borderRadius:7, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><FiX size={12} color="rgba(255,255,255,0.35)"/></button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.displayName}</span>
                      {isMe && <span style={{ fontSize:'0.55rem', fontWeight:800, color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', padding:'1px 6px', borderRadius:5, flexShrink:0 }}>YOU</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* email */}
              <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>

              {/* role selector */}
              <select
                value={u.role}
                disabled={isMe}
                onChange={e=>handleRoleChange(u.uid, e.target.value as UserRole)}
                style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${rm.border}`, borderRadius:8, padding:'5px 8px', fontSize:'0.7rem', fontWeight:700, color: rm.color, cursor: isMe ? 'default' : 'pointer', fontFamily:'inherit', outline:'none', opacity: isMe ? 0.5 : 1 }}
              >
                <option value="admin"   style={{ background:'#1a1a1a', color:'#fde68a' }}>★ Admin</option>
                <option value="brother" style={{ background:'#1a1a1a', color:'#c7d2fe' }}>◆ Brother</option>
                <option value="guest"   style={{ background:'#1a1a1a', color:'#94a3b8' }}>○ Guest</option>
              </select>

              {/* joined */}
              <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.22)', whiteSpace:'nowrap' }}>
                {new Date(u.joinedAt).toLocaleDateString('en-US',{month:'short',year:'2-digit'})}
              </span>

              {/* actions */}
              <div style={{ display:'flex', gap:5 }}>
                <motion.button whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
                  onClick={()=>{ setEditingUid(u.uid); setEditName(u.displayName) }}
                  title="Edit name"
                  style={{ width:28, height:28, borderRadius:8, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                >
                  <FiEdit2 size={12} color="rgba(255,255,255,0.4)"/>
                </motion.button>
                {!isMe && (
                  <motion.button whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
                    onClick={()=>setDeleteUid(u.uid)}
                    title="Remove user"
                    style={{ width:28, height:28, borderRadius:8, border:'1px solid rgba(229,9,20,0.2)', background:'rgba(229,9,20,0.07)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                  >
                    <FiTrash2 size={12} color="#f87171"/>
                  </motion.button>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </GlassCard>

      {/* ── create user modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={()=>{ setShowCreate(false); setCreateErr('') }}
            style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          >
            <motion.div initial={{ scale:0.88, y:24, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.88, y:24, opacity:0 }} transition={{ duration:0.28, ease:[0.22,1,0.36,1] }} onClick={e=>e.stopPropagation()}
              style={{ background:'rgba(10,10,14,0.98)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, padding:32, maxWidth:400, width:'100%', backdropFilter:'blur(20px)', boxShadow:'0 40px 80px rgba(0,0,0,0.9)' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
                <div>
                  <h2 style={{ margin:0, fontSize:'1.05rem', fontWeight:900, letterSpacing:'-0.02em' }}>Create New User</h2>
                  <p style={{ margin:'3px 0 0', fontSize:'0.7rem', color:'rgba(255,255,255,0.32)' }}>Admin-created accounts are active immediately.</p>
                </div>
                <button onClick={()=>{ setShowCreate(false); setCreateErr('') }} style={{ width:32, height:32, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FiX size={15} color="rgba(255,255,255,0.4)"/>
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { label:'Display Name', val:newName, set:setNewName, placeholder:'John Doe',            type:'text'     },
                  { label:'Email',        val:newEmail,set:setNewEmail,placeholder:'user@example.com',    type:'email'    },
                  { label:'Password',     val:newPass, set:setNewPass, placeholder:'Min. 6 characters',   type:'password' },
                ].map(({ label, val, set, placeholder, type }) => (
                  <div key={label}>
                    <FL>{label}</FL>
                    <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
                      style={{ ...inputStyle, '::placeholder':{ color:'rgba(255,255,255,0.2)' } } as React.CSSProperties}
                    />
                  </div>
                ))}

                <div>
                  <FL>Role</FL>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {(['admin','brother','guest'] as UserRole[]).map(r => {
                      const rm = ROLE_META[r]
                      const active = newRole===r
                      return (
                        <button key={r} onClick={()=>setNewRole(r)}
                          style={{ padding:'9px 6px', borderRadius:10, border:`1px solid ${active ? rm.border : 'rgba(255,255,255,0.07)'}`, background: active ? rm.bg : 'rgba(255,255,255,0.03)', cursor:'pointer', transition:'all 0.15s' }}
                        >
                          <p style={{ margin:'0 0 2px', fontSize:'0.88rem' }}>{rm.symbol}</p>
                          <p style={{ margin:0, fontSize:'0.64rem', fontWeight:800, color: active ? rm.color : 'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{rm.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {createErr && <p style={{ margin:0, fontSize:'0.73rem', color:'#f87171', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:9, padding:'8px 12px' }}>{createErr}</p>}

                <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                  onClick={handleCreate} disabled={creating}
                  style={{ marginTop:4, padding:'12px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#f59e0b,#ef4444)', color:'white', fontWeight:800, fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(245,158,11,0.3)', opacity: creating ? 0.6 : 1 }}
                >
                  {creating ? 'Creating…' : 'Create Account'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── confirm delete modal ── */}
      <AnimatePresence>
        {deleteUid && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={()=>setDeleteUid(null)}
            style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          >
            <motion.div initial={{ scale:0.88, y:24, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.88, y:24, opacity:0 }} transition={{ duration:0.26, ease:[0.22,1,0.36,1] }} onClick={e=>e.stopPropagation()}
              style={{ background:'rgba(10,10,14,0.98)', border:'1px solid rgba(229,9,20,0.2)', borderRadius:22, padding:32, maxWidth:340, width:'100%', textAlign:'center', backdropFilter:'blur(20px)', boxShadow:'0 40px 80px rgba(0,0,0,0.9)' }}
            >
              <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(229,9,20,0.12)', border:'1px solid rgba(229,9,20,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'0 0 20px rgba(229,9,20,0.15)' }}>
                <FiTrash2 size={20} color="#e50914"/>
              </div>
              <h2 style={{ margin:'0 0 8px', fontSize:'1rem', fontWeight:900 }}>Remove User?</h2>
              <p style={{ margin:'0 0 24px', fontSize:'0.77rem', color:'rgba(255,255,255,0.38)', lineHeight:1.7 }}>
                {`This will permanently delete the account: `}
                <strong style={{ color:'white' }}>{allUsers.find(u=>u.uid===deleteUid)?.email}</strong>
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setDeleteUid(null)} style={{ flex:1, padding:'10px', borderRadius:11, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', fontWeight:700, cursor:'pointer', fontSize:'0.82rem', fontFamily:'inherit' }}>Cancel</button>
                <button onClick={handleDelete} style={{ flex:1, padding:'10px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#e50914,#c8000f)', color:'white', fontWeight:800, cursor:'pointer', fontSize:'0.82rem', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(229,9,20,0.3)' }}>Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Profile Page
══════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { logout, role, allUsers, user } = useAuth()
  const { profile, update, setAvatarPhoto, avatarGradient, initial, joinedDate, email } = useProfile()
  const { watchlist, watched }        = useWatchlist()
  const navigate                      = useNavigate()
  const location                      = useLocation()
  const { isMobile, isTablet }        = useBreakpoint()
  const tabs                          = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.guest
  const [activeTab, setActiveTab]     = useState(tabs[0].id)
  const [showSignOut, setShowSignOut] = useState(false)
  const rm                            = ROLE_META[role]


  useEffect(() => {
    const t = new URLSearchParams(location.search).get('tab')?.toLowerCase()
    if (t && tabs.some(x=>x.id===t)) setActiveTab(t)
  }, [location.search])

  return (
    <div style={{ minHeight:'100vh', background:'#060608', color:'white', fontFamily:'inherit' }}>

      {/* ── layered bg ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 80% 60% at -5% -10%, ${avatarGradient.from}22 0%, transparent 55%)` }}/>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 60% 50% at 105% 110%, ${avatarGradient.to}18 0%, transparent 55%)` }}/>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)' }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:1080, margin:'0 auto', padding: isMobile ? '72px 16px 100px' : isTablet ? '72px 20px 80px' : '72px 28px 80px', display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 22, alignItems:'flex-start' }}>

        {/* ══════════════════════════
            SIDEBAR
        ══════════════════════════ */}
        <motion.div
          initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ width: isMobile ? '100%' : isTablet ? 220 : 256, flexShrink:0, position: isMobile ? 'relative' : 'sticky', top: isMobile ? 0 : 84, display:'flex', flexDirection:'column', gap:10 }}
        >

          {/* ── identity card ── */}
          <GlassCard accent={avatarGradient.from} style={{ padding:'24px 18px', overflow:'hidden', position:'relative' }}>
            {/* inner glow */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${avatarGradient.from},${avatarGradient.to})`, borderRadius:'18px 18px 0 0' }}/>
            <div style={{ position:'absolute', top:-60, left:-40, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle, ${avatarGradient.from}18, transparent 65%)`, pointerEvents:'none' }}/>

            <div style={{ display:'flex', flexDirection: isMobile ? 'row' : 'column', alignItems:'center', textAlign: isMobile ? 'left' : 'center', gap: isMobile ? 14 : 0 }}>
              {/* avatar */}
              <div style={{ position:'relative', marginBottom: isMobile ? 0 : 14, flexShrink:0 }}>
                <motion.div
                  animate={{ rotate:360 }}
                  transition={{ duration:8, repeat:Infinity, ease:'linear' }}
                  style={{ position:'absolute', inset:-3, borderRadius:'50%',
                    background:`conic-gradient(${avatarGradient.from}, ${avatarGradient.to}, transparent, ${avatarGradient.from})`,
                    opacity:0.6,
                  }}
                />
                <div style={{ position:'absolute', inset:-3, borderRadius:'50%', background:'#060608' }}/>
                <div style={{ position:'absolute', inset:-2, borderRadius:'50%',
                  background:`linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`,
                  padding:2,
                }}>
                  <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#060608' }}/>
                </div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <Avatar photo={profile.avatarPhoto} initial={initial} from={avatarGradient.from} to={avatarGradient.to} size={isMobile ? 64 : 88}/>
                </div>
                <motion.button whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                  onClick={()=>setActiveTab('appearance')}
                  style={{ position:'absolute', bottom:2, right:2, zIndex:2, width:22, height:22, borderRadius:'50%', background:`linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`, border:'2px solid #060608', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                >
                  <FiCamera size={9} color="white"/>
                </motion.button>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ margin:'0 0 2px', fontSize: isMobile ? '0.95rem' : '1.02rem', fontWeight:900, letterSpacing:'-0.02em', lineHeight:1.2 }}>{profile.displayName}</h2>
                <p style={{ margin:'0 0 8px', fontSize:'0.67rem', color:'rgba(255,255,255,0.32)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth: isMobile ? '100%' : 200 }}>{email||'Guest'}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.58rem', fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', padding:'3px 10px', borderRadius:20, background:rm.bg, color:rm.color, border:`1px solid ${rm.border}`, boxShadow:`0 0 12px ${rm.glow}22` }}>
                  {rm.symbol}&nbsp;{rm.label}
                </span>
              </div>
            </div>

            {/* stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop: isMobile ? 12 : 18 }}>
              {[
                { val:watchlist.length, label:'Watchlist', color:avatarGradient.from },
                { val:watched.length,   label:'Watched',   color:avatarGradient.to   },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
                  <p style={{ margin:'0 0 3px', fontSize:'1.2rem', fontWeight:900, color:'white', lineHeight:1 }}>
                    <Counter to={val}/>
                  </p>
                  <p style={{ margin:0, fontSize:'0.57rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color }}>{label}</p>
                </div>
              ))}
            </div>

            {/* joined */}
            <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:5, color:'rgba(255,255,255,0.25)' }}>
              <FiCalendar size={11}/>
              <span style={{ fontSize:'0.67rem' }}>Since {joinedDate}</span>
            </div>
          </GlassCard>

          {/* ── nav ── */}
          <GlassCard style={{ padding:'6px', overflowX: isMobile ? 'auto' : 'visible' }}>
            <div style={{ display:'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? 4 : 0, minWidth: isMobile ? 'max-content' : 'auto' }}>
            {tabs.map((tab, i) => {
              const active = activeTab === tab.id
              return (
                <motion.button key={tab.id} onClick={()=>setActiveTab(tab.id)} whileTap={{ scale:0.97 }}
                  style={{ width: isMobile ? 'auto' : '100%', display:'flex', alignItems:'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 4 : 11, background: active ? `linear-gradient(90deg,${avatarGradient.from}22,${avatarGradient.to}10,transparent)` : 'none', border:`1px solid ${ active ? avatarGradient.from+'22' : 'transparent'}`, borderRadius:12, padding: isMobile ? '8px 14px' : '10px 12px', cursor:'pointer', textAlign: isMobile ? 'center' : 'left', marginBottom: isMobile ? 0 : (i<tabs.length-1?3:0), transition:'all 0.18s', flexShrink:0 }}
                  onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.04)' }}
                  onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLButtonElement).style.background='none' }}
                >
                  <div style={{ width:26, height:26, borderRadius:8, flexShrink:0, background: active ? `${avatarGradient.from}22` : 'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color: active ? avatarGradient.from : 'rgba(255,255,255,0.3)', transition:'all 0.18s' }}>
                    {tab.icon}
                  </div>
                  {!isMobile && (
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0, fontSize:'0.8rem', fontWeight: active ? 700 : 500, color: active ? 'white' : 'rgba(255,255,255,0.45)', transition:'color 0.18s' }}>{tab.label}</p>
                      <p style={{ margin:0, fontSize:'0.61rem', color:'rgba(255,255,255,0.22)', lineHeight:1.3 }}>{tab.desc}</p>
                    </div>
                  )}
                  {isMobile && <span style={{ fontSize:'0.6rem', fontWeight: active ? 700 : 500, color: active ? 'white' : 'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{tab.label}</span>}
                  {active && !isMobile && <motion.div layoutId="sidebar-dot" style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:`linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`, flexShrink:0 }} transition={{ type:'spring', stiffness:500, damping:35 }}/>}
                </motion.button>
              )
            })}
            </div>
          </GlassCard>

          {/* ── sign out ── */}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            onClick={()=>setShowSignOut(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:11, background:'rgba(229,9,20,0.06)', border:'1px solid rgba(229,9,20,0.14)', borderRadius:14, padding:'11px 14px', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.12)'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.06)'}
          >
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(229,9,20,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <FiLogOut size={13} color="#f87171"/>
            </div>
            <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#f87171' }}>Sign Out</span>
          </motion.button>
        </motion.div>

        {/* ══════════════════════════
            MAIN CONTENT
        ══════════════════════════ */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1], delay:0.08 }}
          style={{ flex:1, minWidth:0 }}
        >
          <div style={{ position:'relative' }}>

            {/* ════════ OVERVIEW ════════ */}
            <div
              style={{ display: activeTab==='overview' ? 'flex' : 'none', flexDirection:'column', gap:16 }}
            >
                {/* page heading */}
                <div style={{ marginBottom:4 }}>
                  <h1 style={{ margin:'0 0 3px', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em', background:`linear-gradient(90deg, white 30%, ${avatarGradient.from})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    My Profile
                  </h1>
                  <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(255,255,255,0.32)' }}>Manage your personal information and account preferences.</p>
                </div>

                {/* 2-col */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14 }}>

                  {/* personal info */}
                  <GlassCard style={{ padding:22 }}>
                    <SectionHead icon={<FiUser size={13}/>} title="Personal Info" accent={avatarGradient.from}/>
                    <EditField label="Display Name" value={profile.displayName} onSave={v=>update({displayName:v})} disabled={role==='guest'}/>
                    <EditField label="Bio" value={profile.bio||'Tell the world about yourself…'} onSave={v=>update({bio:v})} disabled={role==='guest'}/>
                    <div style={{ marginBottom:0 }}>
                      <FL>Email</FL>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 13px' }}>
                        <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, marginRight:8 }}>{email||'Guest'}</span>
                        {role!=='guest' && <span style={{ fontSize:'0.58rem', color:'#34d399', fontWeight:800, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', padding:'2px 7px', borderRadius:5, flexShrink:0 }}>✓ Verified</span>}
                      </div>
                    </div>
                  </GlassCard>

                  {/* account */}
                  <GlassCard style={{ padding:22 }}>
                    <SectionHead icon={<FiShield size={13}/>} title="Account" accent="#34d399"/>
                    {[
                      { l:'Member Since',   v:joinedDate },
                      { l:'Role',           v:rm.label   },
                      { l:'Plan',           v:role==='admin'?'Premium':role==='brother'?'Standard':'Free' },
                      { l:'Stream Quality', v:role==='admin'?'4K Ultra HD':role==='brother'?'Full HD 1080p':'HD 720p' },
                      { l:'Screens',        v:role==='admin'?'4 simultaneous':role==='brother'?'2 simultaneous':'1 screen' },
                    ].map(({ l, v }, i, arr) => (
                      <div key={l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom: i<arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <span style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.35)' }}>{l}</span>
                        <span style={{ fontSize:'0.78rem', fontWeight:700, color:'white' }}>{v}</span>
                      </div>
                    ))}
                  </GlassCard>
                </div>

                {/* activity strip */}
                <GlassCard style={{ padding:20 }}>
                  <SectionHead icon={<FiZap size={13}/>} title="Activity" accent="#fbbf24"/>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap:12 }}>
                    {[
                      { icon:<FiBookmark size={20}/>, label:'In Watchlist',   val:watchlist.length, color:avatarGradient.from, bg:`${avatarGradient.from}12` },
                      { icon:<FiEye size={20}/>,      label:'Titles Watched', val:watched.length,   color:avatarGradient.to,   bg:`${avatarGradient.to}12`   },
                      { icon:<FiTv size={20}/>,       label:'Plan',           val:role==='admin'?'Premium':role==='brother'?'Standard':'Free', color:'#fbbf24', bg:'rgba(251,191,36,0.08)' },
                    ].map(({ icon, label, val, color, bg }) => (
                      <div key={label} style={{ background:bg, border:`1px solid ${color}18`, borderRadius:14, padding:'16px 16px 14px', display:'flex', gap:14, alignItems:'center' }}>
                        <div style={{ color, flexShrink:0 }}>{icon}</div>
                        <div>
                          <p style={{ margin:'0 0 2px', fontSize:'1.3rem', fontWeight:900, color:'white', lineHeight:1 }}>{typeof val==='number'?<Counter to={val}/>:val}</p>
                          <p style={{ margin:0, fontSize:'0.62rem', fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
            </div>

            {/* ════════ APPEARANCE ════════ */}
            <div
              style={{ display: activeTab==='appearance' ? 'flex' : 'none', flexDirection:'column', gap:16 }}
            >
                <div style={{ marginBottom:4 }}>
                  <h1 style={{ margin:'0 0 3px', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em', background:`linear-gradient(90deg, white 30%, ${avatarGradient.from})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Appearance</h1>
                  <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(255,255,255,0.32)' }}>Upload a custom photo or pick a colour theme for your avatar.</p>
                </div>

                {/* photo */}
                <GlassCard style={{ padding:22 }}>
                  <SectionHead icon={<FiCamera size={13}/>} title="Profile Photo" accent={avatarGradient.from}/>
                  <PhotoUploader current={profile.avatarPhoto} onUpload={setAvatarPhoto} onRemove={()=>setAvatarPhoto(null)}/>
                </GlassCard>

                {/* colour */}
                <GlassCard style={{ padding:22 }}>
                  <SectionHead icon={<FiSettings size={13}/>} title="Avatar Colour" accent={avatarGradient.to}/>

                  {/* preview */}
                  <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:13, marginBottom:18 }}>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute', inset:-2, borderRadius:'50%', background:`linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`, opacity:0.5, filter:'blur(5px)' }}/>
                      <div style={{ position:'relative', zIndex:1 }}>
                        <Avatar photo={profile.avatarPhoto} initial={initial} from={avatarGradient.from} to={avatarGradient.to} size={52}/>
                      </div>
                    </div>
                    <div>
                      <p style={{ margin:'0 0 4px', fontWeight:800, fontSize:'0.95rem' }}>{profile.displayName}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:`linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`, boxShadow:`0 0 8px ${avatarGradient.from}66` }}/>
                        <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{avatarGradient.label}</span>
                        <span style={{ width:3, height:3, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'inline-block' }}/>
                        <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.25)' }}>{avatarGradient.from} → {avatarGradient.to}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                    {AVATAR_COLORS.map(c => {
                      const active = profile.avatarColor===c.id
                      return (
                        <motion.button key={c.id} onClick={()=>update({avatarColor:c.id})} whileHover={{ scale:1.06, y:-2 }} whileTap={{ scale:0.94 }}
                          style={{ position:'relative', border:'none', cursor:'pointer', borderRadius:14, padding:'14px 8px 12px', textAlign:'center', background: active ? `linear-gradient(135deg,${c.from}25,${c.to}15)` : 'rgba(255,255,255,0.03)', outline: active ? `2px solid ${c.from}90` : '2px solid transparent', boxShadow: active ? `0 0 20px ${c.from}25` : 'none', transition:'background 0.2s, box-shadow 0.2s, outline 0.2s' }}
                        >
                          <div style={{ width:38, height:38, borderRadius:'50%', margin:'0 auto 9px', background:`linear-gradient(135deg,${c.from},${c.to})`, boxShadow: active ? `0 0 16px ${c.from}70` : `0 2px 8px ${c.from}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.88rem', fontWeight:900, color:'white', transition:'box-shadow 0.2s' }}>
                            {initial}
                          </div>
                          <span style={{ fontSize:'0.63rem', fontWeight: active ? 800 : 500, color: active ? 'white' : 'rgba(255,255,255,0.35)' }}>{c.label}</span>
                          {active && (
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:`linear-gradient(135deg,${c.from},${c.to})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 8px ${c.from}66` }}>
                              <FiCheck size={9} color="white"/>
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </GlassCard>
            </div>

            {/* ════════ SECURITY ════════ */}
            <div
              style={{ display: activeTab==='security' ? 'flex' : 'none', flexDirection:'column', gap:16 }}
            >
                <div style={{ marginBottom:4 }}>
                  <h1 style={{ margin:'0 0 3px', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em', background:`linear-gradient(90deg, white 30%, #34d399)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Security</h1>
                  <p style={{ margin:0, fontSize:'0.78rem', color:'rgba(255,255,255,0.32)' }}>Review your account security and session settings.</p>
                </div>

                <GlassCard style={{ padding:22 }}>
                  <SectionHead icon={<FiLock size={13}/>} title="Access Details" accent="#34d399"/>
                  {[
                    { l:'Password',     v:'••••••••',  note:'Encrypted & secure'         },
                    { l:'Login Email',  v:email||'—', note:'Primary sign-in identifier'  },
                    { l:'Account Role', v:rm.label,   note:`${rm.label} access level`    },
                    { l:'Session',      v:'Active',   note:'Current browser session'     },
                  ].map(({ l, v, note }, i, arr) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom: i<arr.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div>
                        <p style={{ margin:0, fontSize:'0.82rem', fontWeight:700, color:'white' }}>{l}</p>
                        <p style={{ margin:'2px 0 0', fontSize:'0.67rem', color:'rgba(255,255,255,0.28)' }}>{note}</p>
                      </div>
                      <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', fontFamily: l==='Password'?'monospace':'inherit' }}>{v}</span>
                    </div>
                  ))}
                </GlassCard>

                <GlassCard style={{ padding:22, background:'rgba(229,9,20,0.04)', borderColor:'rgba(229,9,20,0.12)' }}>
                  <SectionHead icon={<FiShield size={13}/>} title="Danger Zone" accent="#e50914"/>
                  <p style={{ margin:'0 0 16px', fontSize:'0.78rem', color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>
                    Signing out will end your current session on this device.
                  </p>
                  <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                    onClick={()=>setShowSignOut(true)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(229,9,20,0.08)', border:'1px solid rgba(229,9,20,0.22)', borderRadius:12, padding:'13px 16px', cursor:'pointer', transition:'background 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.16)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(229,9,20,0.08)'}
                  >
                    <span style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.84rem', fontWeight:700, color:'#fca5a5' }}><FiLogOut size={15}/>Sign out of all devices</span>
                    <FiChevronRight size={14} color="#fca5a5"/>
                  </motion.button>
                </GlassCard>
            </div>

            {/* ════════ ADMIN ════════ */}
            <div style={{ display: activeTab==='admin' && role==='admin' ? 'block' : 'none' }}>
              <AdminPanel allUsers={allUsers} currentUid={user?.uid??''} />
            </div>

          </div>
        </motion.div>
      </div>

      {/* ── sign-out modal ── */}
      <AnimatePresence>
        {showSignOut && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={()=>setShowSignOut(false)}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          >
            <motion.div initial={{ scale:0.88, y:20, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.88, y:20, opacity:0 }} transition={{ duration:0.28, ease:[0.22,1,0.36,1] }} onClick={e=>e.stopPropagation()}
              style={{ background:'rgba(12,12,12,0.98)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, padding:36, maxWidth:360, width:'100%', textAlign:'center', backdropFilter:'blur(20px)', boxShadow:'0 40px 80px rgba(0,0,0,0.9)' }}
            >
              <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(229,9,20,0.12)', border:'1px solid rgba(229,9,20,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 20px rgba(229,9,20,0.15)' }}>
                <FiLogOut size={22} color="#e50914"/>
              </div>
              <h2 style={{ margin:'0 0 8px', fontSize:'1.1rem', fontWeight:900, letterSpacing:'-0.02em' }}>Sign Out?</h2>
              <p style={{ margin:'0 0 26px', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>Your session will end and you'll need to sign in again to continue watching.</p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={()=>setShowSignOut(false)} style={{ flex:1, padding:'11px', borderRadius:11, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontWeight:700, cursor:'pointer', fontSize:'0.83rem', fontFamily:'inherit', transition:'background 0.2s' }} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.08)'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.04)'}>Cancel</button>
                <button onClick={async()=>{ await logout(); navigate('/welcome') }} style={{ flex:1, padding:'11px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#e50914,#c8000f)', color:'white', fontWeight:800, cursor:'pointer', fontSize:'0.83rem', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(229,9,20,0.3)', transition:'opacity 0.2s' }} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.opacity='0.85'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.opacity='1'}>Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
