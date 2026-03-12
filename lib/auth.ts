import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './mongodb'
import { Admin } from './models'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()
        const admin = await Admin.findOne({ email: credentials.email })

        if (!admin) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          admin.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/th/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
})
