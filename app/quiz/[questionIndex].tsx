import { View, Text, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { quizSession } from "@/lib/quizSession";
import type { QuizQuestion } from "@/lib/types";

const TOTAL = 10;
const TIMER_SECONDS = 15;

export default function QuizQuestionScreen() {
  const { questionIndex: rawIndex } = useLocalSearchParams<{ questionIndex: string }>();
  const questionIndex = parseInt(rawIndex ?? "0", 10);
  const question: QuizQuestion | undefined = quizSession.getQuestion(questionIndex);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      handleAnswer(null); // timeout → faux
      return;
    }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered]);

  // Auto-advance après réponse
  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => {
      if (questionIndex < TOTAL - 1) {
        router.replace(`/quiz/${questionIndex + 1}` as any);
      } else {
        router.replace("/quiz/resultats");
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [answered]);

  const handleAnswer = (idx: number | null) => {
    if (answered) return;
    setAnswered(true);
    setSelectedIndex(idx);
    if (!question) return;
    quizSession.recordResult({
      question,
      selectedIndex: idx,
      correct: idx === question.correctIndex,
    });
  };

  if (!question) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900">
        <Text className="text-stone-400">Question introuvable</Text>
      </View>
    );
  }

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <View className="flex-1 bg-stone-900">
      {/* Barre de progression + timer */}
      <View className="pt-14 px-4 pb-3 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-stone-400 text-sm">
            Question{" "}
            <Text className="text-white font-bold">{questionIndex + 1}</Text>
            <Text className="text-stone-500">/{TOTAL}</Text>
          </Text>
          <Text className={`text-sm font-bold ${timeLeft <= 5 ? "text-red-400" : "text-amber-400"}`}>
            ⏱ {timeLeft}s
          </Text>
        </View>
        {/* Barre de progression questions */}
        <View className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-amber-500 rounded-full"
            style={{ width: `${((questionIndex + 1) / TOTAL) * 100}%` }}
          />
        </View>
        {/* Barre timer */}
        <View className="h-1 bg-stone-800 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${timeLeft <= 5 ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${timerPercent}%` }}
          />
        </View>
      </View>

      {/* Grande photo */}
      <Image
        source={{ uri: question.bird.imageUrl }}
        className="w-full"
        style={{ height: 240 }}
        resizeMode="cover"
      />

      {/* Question */}
      <View className="px-4 py-3">
        <Text className="text-white text-lg font-semibold text-center">
          Quel est cet oiseau ?
        </Text>
      </View>

      {/* 4 choix en grille 2×2 */}
      <View className="px-4 flex-1 gap-3">
        <View className="flex-row gap-3">
          <ChoiceButton
            bird={question.choices[0]}
            index={0}
            correctIndex={question.correctIndex}
            selectedIndex={selectedIndex}
            answered={answered}
            onPress={() => handleAnswer(0)}
          />
          <ChoiceButton
            bird={question.choices[1]}
            index={1}
            correctIndex={question.correctIndex}
            selectedIndex={selectedIndex}
            answered={answered}
            onPress={() => handleAnswer(1)}
          />
        </View>
        <View className="flex-row gap-3">
          <ChoiceButton
            bird={question.choices[2]}
            index={2}
            correctIndex={question.correctIndex}
            selectedIndex={selectedIndex}
            answered={answered}
            onPress={() => handleAnswer(2)}
          />
          <ChoiceButton
            bird={question.choices[3]}
            index={3}
            correctIndex={question.correctIndex}
            selectedIndex={selectedIndex}
            answered={answered}
            onPress={() => handleAnswer(3)}
          />
        </View>
      </View>

      <View className="h-8" />
    </View>
  );
}

interface ChoiceButtonProps {
  bird: { nomFr: string };
  index: number;
  correctIndex: number;
  selectedIndex: number | null;
  answered: boolean;
  onPress: () => void;
}

function ChoiceButton({ bird, index, correctIndex, selectedIndex, answered, onPress }: ChoiceButtonProps) {
  let bgColor = "bg-stone-800";
  let borderColor = "border-stone-700";
  let textColor = "text-white";
  let prefix = "";

  if (answered) {
    if (index === correctIndex) {
      bgColor = "bg-emerald-900";
      borderColor = "border-emerald-500";
      textColor = "text-emerald-300";
      prefix = "✓ ";
    } else if (index === selectedIndex) {
      bgColor = "bg-red-900";
      borderColor = "border-red-500";
      textColor = "text-red-300";
      prefix = "✗ ";
    }
  }

  return (
    <TouchableOpacity
      className={`flex-1 ${bgColor} border ${borderColor} rounded-xl p-3 items-center justify-center min-h-[60px]`}
      onPress={onPress}
      disabled={answered}
      activeOpacity={0.75}
    >
      <Text className={`${textColor} text-sm font-semibold text-center`}>
        {prefix}{bird.nomFr}
      </Text>
    </TouchableOpacity>
  );
}
