import { useState } from 'react'
import { useGameStore } from './app/gameStore'
import { useSettingsStore } from './app/settingsStore'
import type { LevelId } from './levels/schema'
import { Home } from './ui/screens/Home'
import { LessonList } from './ui/screens/LessonList'
import { LessonRunner } from './ui/screens/LessonRunner'
import { LessonsSelect } from './ui/screens/LessonsSelect'
import { PracticeGame } from './ui/screens/PracticeGame'
import { VsAiSelect } from './ui/screens/VsAiSelect'
import './App.css'

type Screen =
  | { name: 'home' }
  | { name: 'vsAiSelect' }
  | { name: 'practice' }
  | { name: 'lessonsSelect' }
  | { name: 'lessonList'; level: LevelId }
  | { name: 'lesson'; level: LevelId; lessonId: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [lessonListKey, setLessonListKey] = useState(0)
  const setLevel = useSettingsStore((s) => s.setLevel)
  const newGame = useGameStore((s) => s.newGame)

  const startPractice = (level: LevelId) => {
    setLevel(level)
    newGame()
    setScreen({ name: 'practice' })
  }

  return (
    <div className="app-shell">
      <div className="felt-table" aria-hidden="true" />
      {screen.name === 'home' && (
        <Home
          onPlayVsAi={() => setScreen({ name: 'vsAiSelect' })}
          onLessons={() => setScreen({ name: 'lessonsSelect' })}
        />
      )}
      {screen.name === 'vsAiSelect' && (
        <VsAiSelect
          onBack={() => setScreen({ name: 'home' })}
          onSelect={startPractice}
        />
      )}
      {screen.name === 'practice' && (
        <PracticeGame onBack={() => setScreen({ name: 'vsAiSelect' })} />
      )}
      {screen.name === 'lessonsSelect' && (
        <LessonsSelect
          onBack={() => setScreen({ name: 'home' })}
          onSelect={(level) => setScreen({ name: 'lessonList', level })}
        />
      )}
      {screen.name === 'lessonList' && (
        <LessonList
          key={`${screen.level}-${lessonListKey}`}
          level={screen.level}
          onBack={() => setScreen({ name: 'lessonsSelect' })}
          onOpenLesson={(lessonId) =>
            setScreen({ name: 'lesson', level: screen.level, lessonId })
          }
        />
      )}
      {screen.name === 'lesson' && (
        <LessonRunner
          level={screen.level}
          lessonId={screen.lessonId}
          onBack={() => {
            setLessonListKey((n) => n + 1)
            setScreen({ name: 'lessonList', level: screen.level })
          }}
        />
      )}
    </div>
  )
}
