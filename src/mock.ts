// Mock "backend": message data and a fake streaming reply.

export type Author = 'user' | 'assistant'

export type Message = {
  id: string
  author: Author
  text: string
  createdAt: number
}

let lastId = 0
export const createId = () => `m${++lastId}`

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))

export function randomText(minWords = 3, maxWords = 60): string {
  const count = randomInt(minWords, maxWords)
  const words = Array.from(
    { length: count },
    () => WORDS[randomInt(0, WORDS.length - 1)],
  )
  const text = words.join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1) + '.'
}

export function createMessage(author: Author, text = randomText()): Message {
  return { id: createId(), author, text, createdAt: Date.now() }
}

export function seedMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) =>
    createMessage(i % 2 === 0 ? 'user' : 'assistant'),
  )
}

// Calls onToken with one word at a time, then onDone. Returns a cancel function.
export function streamReply(
  onToken: (token: string) => void,
  {
    text = randomText(20, 120),
    intervalMs = 50,
    onDone,
  }: { text?: string; intervalMs?: number; onDone?: () => void } = {},
): () => void {
  const tokens = text.split(/(?<= )/)
  let i = 0
  const timer = setInterval(() => {
    onToken(tokens[i++])
    if (i >= tokens.length) {
      clearInterval(timer)
      onDone?.()
    }
  }, intervalMs)
  return () => clearInterval(timer)
}
