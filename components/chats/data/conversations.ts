import { type ChatUser } from "./chat-types"

// Mock conversation data
export const conversations: ChatUser[] = [
  {
    id: "1",
    fullName: "John Doe",
    username: "johndoe",
    profile: "/avatars/01.png",
    title: "Software Engineer",
    messages: [
      {
        sender: "You",
        message: "Hey, how are you?",
        timestamp: new Date(2024, 0, 15, 10, 30),
      },
      {
        sender: "John Doe",
        message: "I'm doing great, thanks! How about you?",
        timestamp: new Date(2024, 0, 15, 10, 32),
      },
      {
        sender: "You",
        message: "All good here! Working on the new project.",
        timestamp: new Date(2024, 0, 15, 10, 35),
      },
    ],
  },
  {
    id: "2",
    fullName: "Jane Smith",
    username: "janesmith",
    profile: "/avatars/02.png",
    title: "Product Manager",
    messages: [
      {
        sender: "Jane Smith",
        message: "Can we schedule a meeting?",
        timestamp: new Date(2024, 0, 16, 9, 15),
      },
      {
        sender: "You",
        message: "Sure! When works for you?",
        timestamp: new Date(2024, 0, 16, 9, 20),
      },
    ],
  },
  {
    id: "3",
    fullName: "Bob Johnson",
    username: "bobjohnson",
    profile: "/avatars/03.png",
    title: "Designer",
    messages: [
      {
        sender: "You",
        message: "The designs look amazing!",
        timestamp: new Date(2024, 0, 17, 14, 0),
      },
      {
        sender: "Bob Johnson",
        message: "Thank you! Glad you like them.",
        timestamp: new Date(2024, 0, 17, 14, 5),
      },
    ],
  },
]

