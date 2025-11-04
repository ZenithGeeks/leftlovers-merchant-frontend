import React from 'react'
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native'

type FileAsset = {
  name: string
  uri: string
  mimeType?: string | null
  size?: number | null
}

type UploadFileProps = {
  label: React.ReactNode
  file?: FileAsset
  onPick: () => void
  onClear?: () => void
  emptyText?: string
}

export default function UploadFile({
  label,
  file,
  onPick,
  onClear,
  emptyText = 'Upload',
}: UploadFileProps) {
  const isImage = !!file && (
    (file.mimeType?.startsWith('image/') ?? false) ||
    /\.(png|jpe?g|gif|webp|heic)$/i.test(file.name)
  )
  const isPdf = !!file && (
    file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.name)
  )

  const openFile = async () => {
    if (!file) return
    try {
      const can = await Linking.canOpenURL(file.uri)
      if (can) await Linking.openURL(file.uri)
    } catch {
      // noop
    }
  }

  return (
    <View style={{ marginBottom: 15 }}>
      {/* Updated label style */}
      <Text className="font-poppins text-[15px] mb-[6px]">{label}</Text>

      {/* PREVIEW */}
      {file && (
        <View style={{ marginBottom: 8 }}>
          {isImage ? (
            <Image
              source={{ uri: file.uri }}
              resizeMode="cover"
              style={{
                width: '100%',
                height: 160,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
              }}
            />
          ) : isPdf ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                backgroundColor: '#F9FAFB',
                padding: 12,
              }}
            >
              <Text numberOfLines={2} style={{ marginBottom: 8 }}>{file.name}</Text>
              <TouchableOpacity
                onPress={openFile}
                style={{
                  alignSelf: 'flex-start',
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: '#EEF2FF',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                }}
              >
                <Text style={{ color: '#1F2937', fontWeight: '600' }}>Open PDF</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                backgroundColor: '#F9FAFB',
                padding: 12,
              }}
            >
              <Text numberOfLines={2}>📎 {file.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* FILE CARD (name + actions) */}
      {file ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              justifyContent: 'space-between',
            }}
          >
            <Text numberOfLines={1} style={{ flex: 1, marginRight: 12 }}>
              {file.name}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {onClear && (
                <TouchableOpacity
                  onPress={onClear}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    backgroundColor: '#FEE2E2',
                  }}
                >
                  <Text style={{ color: '#B91C1C', fontWeight: '700' }}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onPick}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  backgroundColor: '#ECFDF5',
                  borderWidth: 1,
                  borderColor: 'rgba(38,189,104,0.25)',
                }}
              >
                <Text style={{ color: '#16A34A', fontWeight: '700' }}>Replace</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPick}
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#9CA3AF',
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text style={{ color: '#9CA3AF' }}>{emptyText}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}