import { View, StyleSheet } from 'react-native'
import Auth from './components/Auth'
import Account from './components/Account'
import { useSessionContext } from './contexts/SessionContext'

export default function App() {
  const [session] = useSessionContext()

  return (
    <View style={styles.container}>
      {session && session.user ? (
        <Account key={session.user.id} />
      ) : (
        <Auth />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}) 