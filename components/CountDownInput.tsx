import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

export default function CountDownInput({
                                         onSave,
  questionText = "",
                                         buttonLabel = "Uložit",
                                         countdownSeconds = 15,
                                       }) {
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const timeLeftText = "Zustáva: ";
  const textAreaPlaceholder = "Napíš odpověď...";

  useEffect(() => {
    if (!countdownSeconds || countdownSeconds <= 0) return;

    setTimeLeft(countdownSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownSeconds]);

  useEffect(() => {
    if (timeLeft === 0) {
      onSave(inputValue);
      setTimeLeft(null); // stop countdown
    }
  }, [timeLeft, inputValue, onSave]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSave = () => {
    onSave(inputValue);
    setTimeLeft(null);
  };

  return (
    <div className="space-y-4">
      {questionText && (
        <div className="text-white/90 text-lg font-medium text-center">
          {questionText}
        </div>
      )}
      <Textarea
        value={inputValue}
        onChange={handleInputChange}
        placeholder={textAreaPlaceholder}
        className="bg-white/30 border-white/40 text-white placeholder:text-white/70 resize-none rounded-xl"
        rows={3}
      />

      {timeLeft !== null && (
        <div className="text-center">
          <div className="text-white/90 text-sm font-medium">
            {timeLeftText}{Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>
      )}

      <Button
        onClick={handleInputSave}
        className="w-full bg-white/30 hover:bg-white/40 text-white border-white/40 rounded-xl font-medium"
        disabled={!inputValue.trim()}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
