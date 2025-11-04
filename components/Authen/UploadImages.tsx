// components/Authen/UploadImagesGrid.tsx
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type SimpleAsset = { name: string; uri: string }

type UploadImagesGridProps = {
  title?: React.ReactNode
  required?: boolean
  files: SimpleAsset[]
  max?: number
  onAdd: () => void
  onRemove: (index: number) => void
}

export default function UploadImagesGrid({
  title = 'Store Images',
  required = true,
  files,
  max = 5,
  onAdd,
  onRemove,
}: UploadImagesGridProps) {
  const count = files.length
  const canAddMore = count < max

  return (
    <View style={{ marginBottom: 15 }}>
      {/* Header */}
      <Text className="font-poppins text-[15px] mb-[6px]">
        {title}{' '}
        {required && <Text style={{ color: 'black' }}>*</Text>}{' '}
        <Text style={{ color: '#6B7280' }}>({count}/{max})</Text>
      </Text>

      {/* Grid */}
      {count > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 8,
          }}
        >
          {files.map((f, idx) => (
            <View
              key={`${f.uri}-${idx}`}
              style={{
                width: '31.5%',             // roughly 3 columns with gaps
                aspectRatio: 1,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: f.uri }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />

              {/* Index badge */}
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 999,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                  {idx + 1}
                </Text>
              </View>

              {/* Remove button */}
              <TouchableOpacity
                onPress={() => onRemove(idx)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: '#FEE2E2',
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                }}
              >
                <Text style={{ color: '#B91C1C', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add button */}
      <TouchableOpacity
        onPress={onAdd}
        disabled={!canAddMore}
        style={{
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: '#9CA3AF',
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          opacity: canAddMore ? 1 : 0.5,
        }}
      >
        <Text style={{ color: count ? '#111827' : '#9CA3AF' }}>
          {count ? (canAddMore ? 'Add more images' : 'Maximum reached') : 'Upload Images'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}