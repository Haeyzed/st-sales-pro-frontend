export type ChatUser = {
  id: string
  fullName: string
  username: string
  profile: string
  title: string
  messages: Convo[]
}

export type Convo = {
  sender: string
  message: string
  timestamp: Date | string
}

