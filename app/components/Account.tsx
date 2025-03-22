import { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Alert, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Text,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native'
import { Input, Button } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'
import { useSessionContext } from '../contexts/SessionContext'
import { useRouter } from 'expo-router'
import { SessionProvider } from '../contexts/SessionContext'
import Auth from './Auth'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  first_name: string | null
  last_name: string | null
  bio: string | null
  gender: string | null
  handicap: number | null
  birth_year: number | null
  zip_code: string | null
  country: string | null
  phone: string | null
  instagram: string | null
  linkedin: string | null
  cashapp: string | null
  venmo: string | null
  facebook: string | null
  tiktok: string | null
  twitter: string | null
  updated_at: string | null
}

export default function Account() {
  const [session] = useSessionContext()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>({
    id: '',
    username: null,
    full_name: null,
    avatar_url: null,
    website: null,
    first_name: null,
    last_name: null,
    bio: null,
    gender: null,
    handicap: null,
    birth_year: null,
    zip_code: null,
    country: null,
    phone: null,
    instagram: null,
    linkedin: null,
    cashapp: null,
    venmo: null,
    facebook: null,
    tiktok: null,
    twitter: null,
    updated_at: null
  })
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      getProfile()
      router.push('/(tabs)')
    }
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`
          username,
          full_name,
          avatar_url,
          website,
          first_name,
          last_name,
          bio,
          gender,
          handicap,
          birth_year,
          zip_code,
          country,
          phone,
          instagram,
          linkedin,
          cashapp,
          venmo,
          facebook,
          tiktok,
          twitter
        `)
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile({
          id: session.user.id,
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          website: data.website,
          first_name: data.first_name,
          last_name: data.last_name,
          bio: data.bio,
          gender: data.gender,
          handicap: data.handicap,
          birth_year: data.birth_year,
          zip_code: data.zip_code,
          country: data.country,
          phone: data.phone,
          instagram: data.instagram,
          linkedin: data.linkedin,
          cashapp: data.cashapp,
          venmo: data.venmo,
          facebook: data.facebook,
          tiktok: data.tiktok,
          twitter: data.twitter,
          updated_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error in getProfile:', error)
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session.user.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        gender: profile.gender,
        handicap: profile.handicap,
        birth_year: profile.birth_year,
        zip_code: profile.zip_code,
        country: profile.country,
        phone: profile.phone,
        instagram: profile.instagram,
        linkedin: profile.linkedin,
        cashapp: profile.cashapp,
        venmo: profile.venmo,
        facebook: profile.facebook,
        tiktok: profile.tiktok,
        twitter: profile.twitter,
        updated_at: new Date().toISOString()
      }

      console.log('Attempting to update profile with:', updates)

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Failed to update profile: ${error.message}${error.details ? '\nDetails: ' + error.details : ''}${error.hint ? '\nHint: ' + error.hint : ''}`)
      }

      console.log('Profile updated successfully:', data)
      Alert.alert('Success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert(
        'Error Updating Profile',
        error instanceof Error 
          ? `${error.message}\n\nPlease check the console for more details.`
          : 'An unexpected error occurred while updating your profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      console.log('Image picker result:', result)

      if (!result.canceled) {
        setLoading(true)
        
        if (!result.assets?.[0]?.uri) {
          throw new Error('No image URI received from picker')
        }

        const uri = result.assets[0].uri
        console.log('Selected image URI:', uri)
        
        const ext = uri.substring(uri.lastIndexOf('.') + 1)
        console.log('File extension:', ext)

        try {
          const response = await fetch(uri)
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
          }
          const blob = await response.blob()
          console.log('Image blob size:', blob.size)

          const fileName = `${session?.user.id}/avatar.${ext}`
          console.log('Uploading to storage as:', fileName)

          const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              upsert: true,
              contentType: `image/${ext}`
            })

          if (uploadError) {
            console.error('Storage upload error:', uploadError)
            throw uploadError
          }

          console.log('Upload successful:', data)

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

          console.log('Public URL:', publicUrl)

          setProfile({ ...profile, avatar_url: publicUrl })
          await updateProfile()
        } catch (fetchError) {
          console.error('Error processing image:', fetchError)
          //throw new Error(`Failed to process image: ${fetchError.message}`)
        }
      }
    } catch (error) {
      console.error('Error in pickImage:', error)
      Alert.alert(
        'Error Uploading Image',
        error instanceof Error 
          ? `Failed to upload image: ${error.message}\n\nPlease try again or choose a different image.`
          : 'An unexpected error occurred while uploading the image.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    }
  }

  const updateField = (field: keyof Profile, value: string) => {
    if (value.trim() === '') {
      setProfile({ ...profile, [field]: null })
      return
    }
    setProfile({ ...profile, [field]: value })
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.email}>{session?.user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Input
              placeholder="Username"
              value={profile.username || ''}
              onChangeText={(value) => updateField('username', value)}
              leftIcon={{ type: 'font-awesome', name: 'user', color: '#8E8E93' }}
              containerStyle={styles.inputContainer}
              autoCapitalize="none"
            />
            <Input
              placeholder="First Name"
              value={profile.first_name || ''}
              onChangeText={(value) => updateField('first_name', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Last Name"
              value={profile.last_name || ''}
              onChangeText={(value) => updateField('last_name', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Bio"
              value={profile.bio || ''}
              onChangeText={(value) => updateField('bio', value)}
              multiline
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Golf Details</Text>
            <Input
              placeholder="Handicap"
              value={profile.handicap?.toString() || ''}
              onChangeText={(value) => updateField('handicap', value)}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <Input
              placeholder="Gender"
              value={profile.gender || ''}
              onChangeText={(value) => updateField('gender', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Birth Year"
              value={profile.birth_year?.toString() || ''}
              onChangeText={(value) => updateField('birth_year', value)}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Phone"
              value={profile.phone || ''}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Input
              placeholder="Country"
              value={profile.country || ''}
              onChangeText={(value) => updateField('country', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Zip Code"
              value={profile.zip_code || ''}
              onChangeText={(value) => updateField('zip_code', value)}
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Website"
              value={profile.website || ''}
              onChangeText={(value) => updateField('website', value)}
              keyboardType="url"
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <Input
              placeholder="Instagram"
              value={profile.instagram || ''}
              onChangeText={(value) => updateField('instagram', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="LinkedIn"
              value={profile.linkedin || ''}
              onChangeText={(value) => updateField('linkedin', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Facebook"
              value={profile.facebook || ''}
              onChangeText={(value) => updateField('facebook', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="TikTok"
              value={profile.tiktok || ''}
              onChangeText={(value) => updateField('tiktok', value)}
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Input
              placeholder="Venmo"
              value={profile.venmo || ''}
              onChangeText={(value) => updateField('venmo', value)}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Cash App"
              value={profile.cashapp || ''}
              onChangeText={(value) => updateField('cashapp', value)}
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              onPress={updateProfile}
              disabled={loading}
              loading={loading}
              buttonStyle={styles.saveButton}
            />
            <Button
              title="Sign Out"
              onPress={signOut}
              type="outline"
              buttonStyle={styles.signOutButton}
              titleStyle={styles.signOutButtonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
  },
  signOutButton: {
    borderColor: '#FF3B30',
    borderRadius: 12,
    height: 50,
  },
  signOutButtonText: {
    color: '#FF3B30',
  },
}) 