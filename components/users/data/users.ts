// Mock users data - in production, this would come from an API
export const users = Array.from({ length: 50 }, (_, i) => {
  const firstNames = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana"]
  const lastNames = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Davis"]
  const statuses = ["active", "inactive", "invited", "suspended"] as const
  const roles = ["superadmin", "admin", "cashier", "manager"] as const

  const firstName = firstNames[i % firstNames.length]
  const lastName = lastNames[i % lastNames.length]

  return {
    id: `user-${i + 1}`,
    firstName,
    lastName,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phoneNumber: `+1-555-${String(i + 1000).padStart(4, "0")}`,
    status: statuses[i % statuses.length],
    role: roles[i % roles.length],
    createdAt: new Date(2024, 0, i + 1),
    updatedAt: new Date(2024, 0, i + 1),
  }
})

