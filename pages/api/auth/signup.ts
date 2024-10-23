import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'

// This is a placeholder. In a real app, you'd use a database.
let users: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  // Check if user already exists
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' })
  }

  // Hash password
  const hashedPassword = await hash(password, 12)

  // Create user
  const user = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword
  }

  users.push(user)

  console.log('New user created:', { id: user.id, username: user.username, email: user.email })
  console.log('Current users:', users.map(u => ({ id: u.id, username: u.username, email: u.email })))

  res.status(201).json({ message: 'User created successfully' })
}

// Export the users array so it can be used in [...nextauth].ts
export { users }