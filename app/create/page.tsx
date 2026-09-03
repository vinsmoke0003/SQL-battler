"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords } from "lucide-react";
import type { RoomSettings } from "@/lib/rooms/types";
import { request } from "@/lib/client/socket";
import { NicknameGate } from "@/components/nickname/NicknameGate";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { OptionGroup } from "@/components/ui/OptionGroup";
import { difficultyColor } from "@/components/difficulty-badge/DifficultyBadge";
import { toast } from "@/components/toast/Toaster";

export default function CreateRoomPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<RoomSettings>({
    name: "",
    difficulty: "easy",
    questionCount: 5,
    durationMinutes: 15,
    questionOrder: "same",
    penalty: false,
  });
  const [customDuration, setCustomDuration] = useState(false);
  const [creating, setCreating] = useState(false);

  const update = <K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <NicknameGate title="Before you create a room">
      {(identity, changeName) => {
        const create = async () => {
          setCreating(true);
          try {
            const { code } = await request("room:create", { player: identity, settings });
            router.push(`/room/${code}`);
          } catch (err) {
            toast((err as Error).message, "error");
            setCreating(false);
          }
        };

        return (
          <div className="mx-auto w-full max-w-2xl px-4 py-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create a battle</h1>
                <p className="mt-1 text-sm text-muted">
                  Hosting as <span className="text-text">{identity.nickname}</span>{" "}
                  <button type="button" onClick={changeName} className="text-accent hover:underline">
                    change
                  </button>
                </p>
              </div>
            </div>

            <Card className="animate-rise">
              <CardBody className="space-y-6 p-6">
                <div>
                  <Label htmlFor="room-name">Room name</Label>
                  <Input
                    id="room-name"
                    placeholder="Friday SQL Battle"
                    maxLength={40}
                    value={settings.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <OptionGroup
                    value={settings.difficulty}
                    onChange={(v) => update("difficulty", v)}
                    options={[
                      { value: "easy", label: "Easy", hint: "SELECT, WHERE, ORDER BY", accent: difficultyColor.easy },
                      { value: "medium", label: "Medium", hint: "JOIN, GROUP BY, subqueries", accent: difficultyColor.medium },
                      { value: "hard", label: "Hard", hint: "Window functions, CTEs", accent: difficultyColor.hard },
                      { value: "mixed", label: "Mixed", hint: "Ramps up 40/40/20", accent: difficultyColor.mixed },
                    ]}
                  />
                </div>

                <div>
                  <Label>Number of questions</Label>
                  <OptionGroup
                    value={settings.questionCount}
                    onChange={(v) => update("questionCount", v)}
                    options={[
                      { value: 5, label: "5" },
                      { value: 10, label: "10" },
                      { value: 15, label: "15" },
                      { value: 20, label: "20" },
                    ]}
                  />
                </div>

                <div>
                  <Label>Contest duration</Label>
                  <OptionGroup
                    value={customDuration ? "custom" : settings.durationMinutes}
                    onChange={(v) => {
                      if (v === "custom") setCustomDuration(true);
                      else {
                        setCustomDuration(false);
                        update("durationMinutes", v as number);
                      }
                    }}
                    options={[
                      { value: 15, label: "15 min" },
                      { value: 30, label: "30 min" },
                      { value: 45, label: "45 min" },
                      { value: "custom", label: "Custom" },
                    ]}
                  />
                  {customDuration ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={180}
                        value={settings.durationMinutes}
                        onChange={(e) => update("durationMinutes", Number(e.target.value) || 1)}
                        className="w-28"
                      />
                      <span className="text-sm text-muted">minutes</span>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Question order</Label>
                    <OptionGroup
                      columns={2}
                      value={settings.questionOrder}
                      onChange={(v) => update("questionOrder", v)}
                      options={[
                        { value: "same", label: "Same for everyone", hint: "Race on identical questions" },
                        { value: "random", label: "Shuffled per player", hint: "Same set, different order" },
                      ]}
                    />
                  </div>
                  <div>
                    <Label>Scoring</Label>
                    <OptionGroup
                      columns={2}
                      value={settings.penalty ? "penalty" : "normal"}
                      onChange={(v) => update("penalty", v === "penalty")}
                      options={[
                        { value: "normal", label: "Normal", hint: "No penalty for mistakes" },
                        { value: "penalty", label: "Competitive", hint: "−2 per wrong submit" },
                      ]}
                    />
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={create} loading={creating}>
                  <Swords className="size-4" /> Create room
                </Button>
              </CardBody>
            </Card>
          </div>
        );
      }}
    </NicknameGate>
  );
}
