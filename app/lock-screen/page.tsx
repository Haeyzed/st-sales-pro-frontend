import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LockScreenForm } from '@/components/auth/lock-screen-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function LockScreenPage() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-base tracking-tight'>
            Screen Locked
          </CardTitle>
          <CardDescription>
            Your screen has been locked. <br /> Please enter your password to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LockScreenForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-16 text-center text-sm'>
            Not you?{' '}
            <Link
              href="/sign-in"
              className='hover:text-primary underline underline-offset-4'
            >
              Sign in as a different user.
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}