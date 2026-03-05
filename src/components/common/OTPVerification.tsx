import React, { useState, useRef } from 'react'

interface OTPVerificationProps {
  onVerify: (otp: string) => void
  onResend?: () => void
  length?: number
}

export default function OTPVerification({ onVerify, onResend, length = 6 }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
    if (newOtp.every(v => v !== '')) {
      onVerify(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="h-12 w-12 rounded-lg text-center text-xl font-bold text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        ))}
      </div>
      {onResend && (
        <button onClick={onResend} className="text-sm text-gray-400 hover:text-white">
          Resend code
        </button>
      )}
    </div>
  )
}
