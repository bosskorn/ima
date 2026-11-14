import { Capacitor } from '@capacitor/core'

// Camera scan via ML Kit when running inside the Android app. In a normal browser it returns null —
// hardware barcode guns (keyboard-wedge mode) already work because they just type into the focused input.
export async function scanBarcode() {
  if (!Capacitor.isNativePlatform()) return null
  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')
  const { camera } = await BarcodeScanner.requestPermissions()
  if (camera !== 'granted' && camera !== 'limited') throw new Error('ไม่ได้รับสิทธิ์ใช้กล้อง')
  const { barcodes } = await BarcodeScanner.scan()
  return barcodes?.[0]?.rawValue ?? null
}
export const canCameraScan = () => Capacitor.isNativePlatform()
