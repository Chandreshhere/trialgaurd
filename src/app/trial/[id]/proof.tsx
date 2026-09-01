import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImagePlus, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Field, IconTile, NavBar, PressScale, Screen, Text } from '@/components';
import { useAddProof, useTrial } from '@/hooks/useTrials';
import { color, radius, space } from '@/theme';

/**
 * S18 — keeping the confirmation.
 *
 * Optional, and deliberately so: FR-019 offers proof, it does not require it,
 * and a mandatory upload here would punish the user for cancelling on a laptop.
 * The value is later — a reference number and a screenshot are what settle a
 * dispute if the provider charges anyway.
 *
 * The reference field is typed by the user rather than extracted. Reading it off
 * an image is FR-020's optional extraction, which arrives with the real model in
 * Phase 14; until then, asking is honest and guessing would not be.
 */
export default function AddProof() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: trial } = useTrial(id);
  const addProof = useAddProof();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reference, setReference] = useState('');

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const done = async (withProof: boolean) => {
    if (withProof && trial) {
      await addProof.mutateAsync({
        trialId: trial.id,
        imageUri,
        referenceNumber: reference.trim() || null,
        accessEndDate: null,
      });
    }
    router.replace(`/trial/${id}/saved`);
  };

  const hasSomething = imageUri != null || reference.trim() !== '';

  return (
    <Screen
      scroll
      header={<NavBar title="Proof" />}
      footer={
        <View style={styles.footer}>
          <Button
            title={hasSomething ? 'Save proof' : 'Save without proof'}
            onPress={() => done(hasSomething)}
          />
          {hasSomething ? (
            <Button title="Skip for now" variant="ghost" onPress={() => done(false)} />
          ) : null}
        </View>
      }
    >
      <View style={styles.intro}>
        <Text variant="display">Save proof of cancellation?</Text>
        <Text variant="secondary" style={styles.introBody}>
          Keep the confirmation with this trial in case you need it later. Entirely optional.
        </Text>
      </View>

      {imageUri ? (
        <Card style={styles.previewCard}>
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" transition={150} />
          <Button title="Choose a different one" variant="ghost" onPress={pick} />
        </Card>
      ) : (
        <PressScale onPress={pick} accessibilityRole="button" accessibilityLabel="Add a screenshot">
          <View style={styles.dropzone}>
            <IconTile icon={ImagePlus} tone="accent" size="lg" />
            <Text variant="cardTitle">Add the confirmation</Text>
            <Text variant="secondary" align="center">
              A screenshot of the cancellation screen or email.
            </Text>
          </View>
        </PressScale>
      )}

      <View style={styles.form}>
        <Field
          label="Reference number (optional)"
          placeholder="e.g. CNL-4821993"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.assurance}>
        <ShieldCheck size={16} color={color.success} strokeWidth={1.8} />
        <Text variant="caption" style={styles.assuranceCopy}>
          Stored on this device only. You can delete it at any time from the trial&apos;s details.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingTop: space.md, paddingBottom: space.lg },
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
  preview: { width: '100%', height: 280, borderRadius: radius.card },
  form: { paddingTop: space.xl },
  assurance: { flexDirection: 'row', gap: space.xs, paddingTop: space.lg },
  assuranceCopy: { flex: 1, lineHeight: 16 },
  footer: { gap: space.xxs },
});
