import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const poemLines = [
  "words would never truly be enough,",
  "to describe what you are to me",
  "you are the world itself.",
  "like seasons, ever changing",
  "your smile, the bluest clear skies",
  "your melancholy, the deepest autumn",
  "your zest like the first spring blossoms",
  "I could keep trying and never finish",
  "so instead all I'll say is this",
  "thank you for being my world"
]

// Confetti particle
interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  velocityX: number
  velocityY: number
}

// Floating heart
interface FloatingHeart {
  id: number
  x: number
  delay: number
  duration: number
  size: number
}

function App() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const [isTurningPage, setIsTurningPage] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [titleClicks, setTitleClicks] = useState(0)
  const [isWiggling, setIsWiggling] = useState(false)
  const [photoTransition, setPhotoTransition] = useState('')
  const [letterRevealed, setLetterRevealed] = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const confettiColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43']
  const photoTransitions = ['zoom-rotate', 'flip', 'slide-up', 'bounce', 'swing']

  // Get all image files from the Album pics folder
  const imageFiles = [
    '1b9842aa-db94-45c7-b4d6-5b83b2df8ebb.jpg',
    '1e85f03c-02fe-49f3-8c81-547d6b8ece72.jpg',
    '593b62a8-0661-4cb9-91d6-72e89d9ad1c0.jpg',
    '739eae09-9574-4ab1-b96d-fd5a43bf3f8c.jpg',
    'a61006ca-4bd3-48c2-80cd-0f8fbda8980e.jpg',
    'acb7093a-8231-4fce-965a-1969cef76da0.jpg',
    'acb97c1a-b3cc-4f47-b77c-8a774e87cfcd.jpg',
    'b28d54d7-27f3-4c87-ac6c-91eea15778a1.jpg',
    'IMG_3922.PNG',
    'IMG_6864.JPG',
    'IMG_6875.JPG',
    'IMG_6880.JPG',
    'IMG_6965.JPG',
    'IMG_7903.JPG'
  ]

  // Generate floating hearts
  useEffect(() => {
    const hearts: FloatingHeart[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 7,
      size: 15 + Math.random() * 25
    }))
    setFloatingHearts(hearts)
  }, [])

  // Filter images that can be loaded
  useEffect(() => {
    const checkImages = async () => {
      const validImages: string[] = []
      for (const img of imageFiles) {
        const imgPath = `/Album pics/${img}`
        try {
          const imgElement = new Image()
          await new Promise((resolve, reject) => {
            imgElement.onload = resolve
            imgElement.onerror = reject
            imgElement.src = imgPath
            setTimeout(() => reject(new Error('Timeout')), 2000)
          })
          validImages.push(img)
        } catch {
          console.log(`Skipping ${img}`)
        }
      }
      setLoadedImages(validImages.length > 0 ? validImages : imageFiles.filter(f => !f.endsWith('.HEIC')))
    }
    checkImages()
  }, [])

  // Auto-rotate photos with random transitions
  useEffect(() => {
    if (loadedImages.length === 0) return
    const interval = setInterval(() => {
      setPhotoTransition(photoTransitions[Math.floor(Math.random() * photoTransitions.length)])
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % loadedImages.length)
        setTimeout(() => setPhotoTransition(''), 600)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [loadedImages.length])

  // Confetti explosion
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true)
    const newParticles: Particle[] = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      velocityX: (Math.random() - 0.5) * 30,
      velocityY: (Math.random() - 0.5) * 30 - 10
    }))
    setParticles(newParticles)
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  // Handle music toggle (only via the button)
  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering handleMagicClick
    if (!audioRef.current) return

    if (isMusicPlaying) {
      audioRef.current.pause()
      setIsMusicPlaying(false)
    } else {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true)
            setMusicStarted(true)
          })
          .catch(() => {
            // Play blocked
          })
      }
    }
  }

  // Try to autoplay music on load (may be blocked by browser policies)
  useEffect(() => {
    if (!audioRef.current) return
    const audioEl = audioRef.current
    const playPromise = audioEl.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true)
          setMusicStarted(true)
        })
        .catch(() => {
          // Autoplay blocked; will try on first user interaction
        })
    }
  }, [])

  // Easter egg - click title multiple times
  const handleTitleClick = () => {
    setTitleClicks(prev => prev + 1)
    setIsWiggling(true)
    setTimeout(() => setIsWiggling(false), 500)
    
    if (titleClicks >= 4) {
      setShowEasterEgg(true)
      triggerConfetti()
      setTitleClicks(0)
      setTimeout(() => setShowEasterEgg(false), 3000)
    }
  }

  // Handle page turn with animation
  const nextPage = () => {
    if (currentPage < poemLines.length && !isTurningPage) {
      setIsTurningPage(true)
      // Change the text halfway through the flip,
      // but keep the flip animation running to the end
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1)
      }, 250)
      setTimeout(() => {
        setIsTurningPage(false)
      }, 500)
    }
  }

  const prevPage = () => {
    if (currentPage > 0 && !isTurningPage) {
      setIsTurningPage(true)
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1)
      }, 250)
      setTimeout(() => {
        setIsTurningPage(false)
      }, 500)
    }
  }

  const openBook = () => {
    setIsBookOpen(true)
    setCurrentPage(0)
    triggerConfetti()
  }

  const closeBook = () => {
    setIsBookOpen(false)
    setCurrentPage(0)
  }

  // Magic click counter and one-time fallback music start on first tap
  const handleMagicClick = () => {
    // Only try to start music ONCE on first interaction (if autoplay was blocked)
    if (!musicStarted && audioRef.current) {
      setMusicStarted(true) // Mark as attempted so we don't keep trying
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true)
          })
          .catch(() => {
            // Still blocked, user can use the button
          })
      }
    }

    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount % 10 === 0) {
        triggerConfetti()
      }
      return newCount
    })
  }

  // Reveal letter with scratch effect
  const revealLetter = () => {
    setLetterRevealed(true)
    triggerConfetti()
  }

  return (
    <div className="birthday-card" onClick={handleMagicClick}>
      {/* Floating Hearts Background */}
      <div className="floating-hearts">
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.x}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}px`
            }}
          >
            💕
          </div>
        ))}
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="confetti-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
                '--vx': particle.velocityX,
                '--vy': particle.velocityY
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Easter Egg Message */}
      {showEasterEgg && (
        <div className="easter-egg">
          🎉 You found a secret! Shamita is AMAZING! 🎉
        </div>
      )}

      {/* Floating Music Button */}
      <button className={`music-button ${isMusicPlaying ? 'playing' : ''}`} onClick={toggleMusic}>
        <span className="music-icon">{isMusicPlaying ? '🎵' : '🔇'}</span>
        {isMusicPlaying && <span className="music-waves"></span>}
      </button>
      <audio
        ref={audioRef}
        src="/Pal Pal(KoshalWorld.Com).mp3"
        loop
        preload="auto"
        autoPlay
      />

      {/* Sparkle cursor trail would go here */}

      {/* Title Section */}
      <section className="title-section">
        <div className="sparkle-container">
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
          <span className="sparkle">✨</span>
        </div>
        <h1 
          className={`main-title ${isWiggling ? 'wiggle' : ''}`} 
          onClick={handleTitleClick}
        >
          <span className="letter-bounce" style={{ animationDelay: '0s' }}>S</span>
          <span className="letter-bounce" style={{ animationDelay: '0.1s' }}>h</span>
          <span className="letter-bounce" style={{ animationDelay: '0.2s' }}>a</span>
          <span className="letter-bounce" style={{ animationDelay: '0.3s' }}>m</span>
          <span className="letter-bounce" style={{ animationDelay: '0.4s' }}>i</span>
          <span className="letter-bounce" style={{ animationDelay: '0.5s' }}>&nbsp;</span>
          <span className="letter-bounce" style={{ animationDelay: '0.6s' }}>D</span>
          <span className="letter-bounce" style={{ animationDelay: '0.7s' }}>a</span>
          <span className="letter-bounce" style={{ animationDelay: '0.8s' }}>y</span>
        </h1>
        <p className="birthday-date">🎂 February 11, 2001 🎂</p>
        <div className="happy-banner">
          <span className="happy-text">✨ HAPPY SHAMI DAY ✨</span>
        </div>
        <div className="hearts-row">
          <span className="heart-pop">💖</span>
          <span className="heart-pop" style={{ animationDelay: '0.2s' }}>💝</span>
          <span className="heart-pop" style={{ animationDelay: '0.4s' }}>💗</span>
          <span className="heart-pop" style={{ animationDelay: '0.6s' }}>💖</span>
          <span className="heart-pop" style={{ animationDelay: '0.8s' }}>💝</span>
        </div>
        
        <button className="confetti-button" onClick={triggerConfetti}>
          🎊 Party Time! 🎊
        </button>
      </section>

      {/* Photo Gallery Section */}
      <section className="photo-section">
        <h2 className="section-title">
          <span className="title-emoji">📸</span> Our Beautiful Memories <span className="title-emoji">📸</span>
        </h2>
        {loadedImages.length > 0 ? (
          <>
            <div className="polaroid-stack">
              <div className={`polaroid ${photoTransition}`}>
                <img
                  src={`/Album pics/${loadedImages[currentPhotoIndex]}`}
                  alt={`Memory ${currentPhotoIndex + 1}`}
                  className="photo"
                />
                <div className="polaroid-caption">
                  Memory #{currentPhotoIndex + 1} 💕
                </div>
              </div>
            </div>
            <div className="photo-indicator-dots">
              {loadedImages.slice(0, 10).map((_, idx) => (
                <span 
                  key={idx} 
                  className={`dot ${idx === currentPhotoIndex % 10 ? 'active' : ''}`}
                  onClick={() => setCurrentPhotoIndex(idx)}
                />
              ))}
            </div>
            <div className="photo-controls">
              <button 
                className="nav-button"
                onClick={() => {
                  setPhotoTransition('slide-left')
                  setTimeout(() => {
                    setCurrentPhotoIndex((prev) => (prev - 1 + loadedImages.length) % loadedImages.length)
                    setPhotoTransition('')
                  }, 300)
                }}
              >
                ⬅️ Prev
              </button>
              <span className="photo-counter">{currentPhotoIndex + 1} / {loadedImages.length}</span>
              <button 
                className="nav-button"
                onClick={() => {
                  setPhotoTransition('slide-right')
                  setTimeout(() => {
                    setCurrentPhotoIndex((prev) => (prev + 1) % loadedImages.length)
                    setPhotoTransition('')
                  }, 300)
                }}
              >
                Next ➡️
              </button>
            </div>
          </>
        ) : (
          <div className="loading-photos">
            <div className="loader"></div>
            <p>Loading magical memories...</p>
          </div>
        )}
      </section>

      {/* Poem Book Section */}
      <section className="poem-section">
        <h2 className="section-title">
          <span className="title-emoji">📖</span> A Poem for You <span className="title-emoji">📖</span>
        </h2>
        {!isBookOpen ? (
          <div className="book-cover" onClick={openBook}>
            <div className="book-glow"></div>
            <div className="book-spine"></div>
            <div className="book-front">
              <div className="book-decoration">✨</div>
              <h3>For Shamita</h3>
              <p className="book-subtitle">A Collection of Words</p>
              <div className="book-decoration bottom">💕</div>
              <p className="tap-hint">~ Tap to Open ~</p>
            </div>
          </div>
        ) : (
          <div className="book-open">
            <div className={`book-page-container ${isTurningPage ? 'turning' : ''}`}>
              {currentPage === 0 ? (
                <div className="book-page title-page">
                  <div className="page-decoration">🌸</div>
                  <h3>For Shamita</h3>
                  <p className="book-subtitle">A Collection of Words</p>
                  <div className="page-decoration">🌸</div>
                </div>
              ) : (
                <div className="book-page">
                  <div className="quote-mark">"</div>
                  <p className="poem-line">{poemLines[currentPage - 1]}</p>
                  <div className="quote-mark end">"</div>
                </div>
              )}
              <div className="page-curl"></div>
            </div>
            <div className="book-controls">
              <button className="book-nav-btn" onClick={prevPage} disabled={currentPage === 0}>
                ◀ Previous
              </button>
              <span className="page-number">📄 {currentPage} / {poemLines.length}</span>
              {currentPage < poemLines.length ? (
                <button className="book-nav-btn" onClick={nextPage}>Next ▶</button>
              ) : (
                <button className="book-nav-btn close-btn" onClick={closeBook}>✓ Close</button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Love Letter Section */}
      <section className="love-letter-section">
        <h2 className="section-title">
          <span className="title-emoji">💌</span> A Letter from the Heart <span className="title-emoji">💌</span>
        </h2>
        <div className="letter-container">
          {!letterRevealed ? (
            <div className="sealed-letter" onClick={revealLetter}>
              <div className="envelope">
                <div className="envelope-flap"></div>
                <div className="envelope-body">
                  <span className="seal">💋</span>
                </div>
              </div>
              <p className="tap-to-reveal">💝 Tap to open 💝</p>
            </div>
          ) : (
            <div className="letter revealed">
              <div className="letter-header">
                <span>Dear Shamita,</span>
                <span className="letter-heart">💕</span>
              </div>
              <p className="letter-content">
                It's here, whether we like it or not. 25th birthday. I know you're not a fan of growing older, but hey at least your prefrontal cortex is almost fully developed now. The most important thing is that we're growing older together and I wouldn't have it any other way. You have been a changing constant in my life for years now and what a journey it has been, through ups and downs, through trips and cafes, through sickness and health. You have matured, changed and become more of who you are and it has been my pleasure to be witness to this journey. So here's to another small checkpoint. Happy Birthday my dearest cheesecake 🍰
              </p>
              <div className="letter-footer">
                <span>Forever yours,</span>
                <span className="letter-signature">Yeti 🐻</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Fun Facts / Quirky Section */}
      <section className="quirky-section">
        <h2 className="section-title">
          <span className="title-emoji">🌟</span> Why You're Amazing <span className="title-emoji">🌟</span>
        </h2>
        <div className="quirky-cards">
          <div className="quirky-card" style={{ animationDelay: '0s' }}>
            <span className="quirky-emoji">😊</span>
            <p>Your smile lights up every room</p>
          </div>
          <div className="quirky-card" style={{ animationDelay: '0.2s' }}>
            <span className="quirky-emoji">💪</span>
            <p>You're stronger than you know</p>
          </div>
          <div className="quirky-card" style={{ animationDelay: '0.4s' }}>
            <span className="quirky-emoji">🦋</span>
            <p>You make ordinary moments magical</p>
          </div>
          <div className="quirky-card" style={{ animationDelay: '0.6s' }}>
            <span className="quirky-emoji">🌈</span>
            <p>You bring color to my world</p>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="signature-section">
        <div className="signature-card">
          <p className="with-love">With all my love,</p>
          <p className="signature-name">
            <span className="name-letter">Y</span>
            <span className="name-letter">a</span>
            <span className="name-letter">t</span>
            <span className="name-letter">i</span>
            <span className="name-letter">s</span>
            <span className="name-letter">h</span>
            <span className="name-letter">&nbsp;</span>
            <span className="name-letter">A</span>
            <span className="name-letter">g</span>
            <span className="name-letter">r</span>
            <span className="name-letter">a</span>
            <span className="name-letter">w</span>
            <span className="name-letter">a</span>
            <span className="name-letter">l</span>
          </p>
          <p className="nickname">( Yeti 🐻‍❄️ )</p>
          <div className="signature-hearts">
            💖💖💖
          </div>
        </div>
      </section>

      {/* Click counter Easter egg */}
      <div className="click-counter">
        {clickCount > 0 && <span>💫 {clickCount}</span>}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Made with 💖 for the most special person</p>
        <p className="footer-year">Happy Birthday 2026! 🎂</p>
      </footer>
    </div>
  )
}

export default App
