import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, ImagePlus, PencilLine } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, IconTile, NavBar, PressScale, Screen, Text } from '@/components';
import { useAddTrialDraft } from '@/store/addTrialDraft';
import { color, radius, space } from '@/theme';

/**
 * S08 — choosing or taking the confirmation image.
 *
 * design.md asks for a large soft upload area and, once something is chosen, a
 * preview "inside a premium floating card". The preview matters beyond looks:
 * the user should see what the model is about to read, so a blurry or
 * half-cropped screenshot is caught before it produces a wrong renewal date.
 */
export default function Capture() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; fixture?: string }>();
  const mode = params.mode === 'camera' ? 'camera' : 'library';
  const { start, payload } = useAddTrialDraft();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    start(mode === 'camera' ? 'camera' : 'screenshot');
  }, [mode, start]);

  const pick = async () => {
    setError(null);
    try {
      const permission =
        mode === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          mode === 'camera'
            ? 'TrialGuard needs camera access to capture a confirmation.'
            : 'TrialGuard needs photo access to read a confirmation screenshot.',
        );
        return;
      }

      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

      if (result.canceled) return;
      useAddTrialDraft.getState().start(mode === 'camera' ? 'camera' : 'screenshot', result.assets[0].uri);
    } catch {
      setError('Something went wrong opening your photos.');
    }
  };

  const analyse = () => {
    router.push({
      pathname: '/add/processing',
      params: params.fixture ? { fixture: params.fixture } : {},
    });
  };

  return (
    <Screen
      scroll
      header={<NavBar title="Protect a Trial" />}
      footer={
        payload ? (
          <Button title="Analyze trial" onPress={analyse} />
        ) : (
          <Button title="Enter manually instead" variant="ghost" onPress={() => router.push('/add/manual')} />
        )
      }
    >
      <View style={styles.intro}>
        <Text variant="display">Add your trial</Text>
        <Text variant="secondary" style={styles.introBody}>
          Upload the confirmation and we will find the important details.
        </Text>
      </View>

      {payload ? (
        <Card style={styles.previewCard}>
          <Image source={{ uri: payload }} style={styles.preview} contentFit="cover" transition={150} />
          <Button title="Choose a different one" variant="ghost" onPress={pick} />
        </Card>
      ) : (
        <PressScale onPress={pick} accessibilityRole="button" accessibilityLabel="Choose an image">
          <View style={styles.dropzone}>
            <IconTile icon={mode === 'camera' ? Camera : ImagePlus} tone="accent" size="lg" />
            <Text variant="cardTitle">
              {mode === 'camera' ? 'Take a photo' : 'Choose a screenshot'}
            </Text>
            <Text variant="secondary" align="center">
              A confirmation email or the checkout screen works best.
            </Text>
          </View>
        </PressScale>
      )}

      {error ? (
        <Card tone="cool" style={styles.error}>
          <Text variant="body">{error}</Text>
          <PressScale onPress={() => router.push('/add/manual')} haptic={null}>
            <Text variant="body" weight="600" color={color.blue}>
              Enter it manually
            </Text>
          </PressScale>
        </Card>
      ) : null}

      <PressScale
        onPress={() => router.push('/add/manual')}
        haptic={null}
        style={styles.manual}
        accessibilityRole="button"
      >
        <PencilLine size={16} color={color.textSecondary} strokeWidth={1.8} />
        <Text variant="secondary">Rather type it in?</Text>
      </PressScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.xl },
  introBody: { marginTop: space.xs },
  dropzone: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxxl,
    paddingHorizontal: space.lg,
    borderRadius: radius.cardLg,
    backgroundColor: color.blueFaint,
    borderWidth: StyleSheet.hairlineWidth * 3,
    borderColor: color.blueLight,
    borderStyle: 'dashed',
  },
  previewCard: { gap: space.sm },
  preview: { width: '100%', height: 320, borderRadius: radius.card },
  error: { gap: space.xs, marginTop: space.md },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingTop: space.xl,
  },
});
