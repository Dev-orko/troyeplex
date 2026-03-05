import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth'

const provider = new GoogleAuthProvider()
provider.addScope('email')
provider.addScope('profile')

export async function signInWithGoogle() {
  const auth = getAuth()
  const result = await signInWithPopup(auth, provider)
  return result.user
}
