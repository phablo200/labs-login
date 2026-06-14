import { useEffect, useRef, useState } from 'react'
import ClipboardCheckIcon from '../Icons/ClipboardCheckIcon'
import ClipboardIcon from '../Icons/ClipboardIcon'
import './ClipboardButton.css'
import type { ClipboardButtonProps } from './ClipboardButton.types'

const copiedResetDelay = 1800

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function ClipboardButton({ className, text }: ClipboardButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const tooltip = isCopied ? 'Done' : 'Copy Result'

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  async function handleCopy() {
    if (!text) {
      return
    }

    await copyText(text)
    setIsCopied(true)

    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current)
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setIsCopied(false)
    }, copiedResetDelay)
  }

  return (
    <button
      aria-label={tooltip}
      className={[
        'clipboard-button',
        isCopied ? 'clipboard-button--done' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-tooltip={tooltip}
      disabled={!text}
      onClick={handleCopy}
      title={tooltip}
      type="button"
    >
      {isCopied ? (
        <ClipboardCheckIcon className="clipboard-button__icon" />
      ) : (
        <ClipboardIcon className="clipboard-button__icon" />
      )}
    </button>
  )
}

export default ClipboardButton
