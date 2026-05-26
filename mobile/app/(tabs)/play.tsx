/**
 * Play screen — mobile clue list with Reanimated unlock animation.
 *
 * Flow:
 *   1. Clues are shown as a vertical list.
 *   2. Only the current clue (current_clue_index) is active; solved ones are
 *      unlocked; future ones are locked.
 *   3. When the player submits a correct answer the tx is confirmed, then
 *      `unlockedUpTo` advances by 1 — triggering the ClueListItem animation
 *      on the newly revealed card.
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClueListItem } from '@components/ClueListItem';
import { usePlayerStore } from '@store/useStore';
import type { ClueInfo } from '@lib/types';

// ─── Demo clues (replace with real contract fetch) ───────────────────────────

const DEMO_CLUES: ClueInfo[] = [
  { id: 0, question: 'I have cities, but no houses live there. I have mountains, but no trees grow there. What am I?', points: 10 },
  { id: 1, question: 'The more you take, the more you leave behind. What am I?', points: 15 },
  { id: 2, question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', points: 20 },
  { id: 3, question: 'I have hands but cannot clap. What am I?', points: 10 },
  { id: 4, question: 'What has keys but no locks, space but no room, and you can enter but can\'t go inside?', points: 25 },
];

const DEMO_ANSWERS = ['map', 'footsteps', 'echo', 'clock', 'keyboard'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlayScreen() {
  const { currentProgress, updateClueIndex } = usePlayerStore();

  // unlockedUpTo: index of the highest clue that has been solved.
  // Starts at current_clue_index - 1 (all previously solved clues are already unlocked).
  const initialUnlocked = (currentProgress?.current_clue_index ?? 0) - 1;
  const [unlockedUpTo, setUnlockedUpTo] = useState(initialUnlocked);
  const activeIndex = unlockedUpTo + 1;

  const [answer, setAnswer] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async () => {
    if (isPending || !answer.trim()) return;
    const clue = DEMO_CLUES[activeIndex];
    if (!clue) return;

    setIsPending(true);
    setError('');

    try {
      // ── Simulate tx confirmation (replace with real submitAnswer call) ──
      await new Promise<void>((resolve, reject) =>
        setTimeout(() => {
          const correct =
            answer.trim().toLowerCase() === DEMO_ANSWERS[activeIndex];
          correct ? resolve() : reject(new Error('incorrect'));
        }, 900),
      );

      // Tx confirmed — unlock the next clue with animation
      setUnlockedUpTo(activeIndex);
      updateClueIndex(activeIndex + 1);
      setAnswer('');
    } catch {
      setError('Incorrect answer — try again!');
    } finally {
      setIsPending(false);
    }
  }, [activeIndex, answer, isPending, updateClueIndex]);

  const allSolved = activeIndex >= DEMO_CLUES.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺 Active Hunt</Text>
          <Text style={styles.subtitle}>
            {allSolved
              ? '🎉 All clues solved!'
              : `Clue ${activeIndex + 1} of ${DEMO_CLUES.length}`}
          </Text>
        </View>

        {/* Clue list */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {DEMO_CLUES.map((clue, i) => (
            <ClueListItem
              key={clue.id}
              clue={clue}
              index={i}
              isActive={i === activeIndex && !allSolved}
              isUnlocked={i <= unlockedUpTo}
            />
          ))}
        </ScrollView>

        {/* Answer input — only shown while there are unsolved clues */}
        {!allSolved && (
          <View style={styles.inputArea}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type your answer…"
                placeholderTextColor="#9999BB"
                value={answer}
                onChangeText={(t) => { setAnswer(t); setError(''); }}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                editable={!isPending}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel="Submit answer"
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>→</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4FF' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F5',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0C0C4F',
  },
  subtitle: {
    fontSize: 13,
    color: '#6666AA',
    marginTop: 2,
  },
  list: { flex: 1 },
  listContent: { paddingVertical: 12, paddingBottom: 24 },
  inputArea: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8F5',
  },
  errorText: {
    color: '#E3225C',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#3737A4',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A3E',
    backgroundColor: '#F8F8FF',
  },
  submitBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3737A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
