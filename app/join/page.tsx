"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { request } from "@/lib/client/socket";
import { NicknameGate } from "@/components/nickname/NicknameGate";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { toast } from "@/components/toast/Toaster";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fromUrl = params.get("code");
    if (fromUrl) setCode(fromUrl.toUpperCase());
  }, [params]);

  return (
    <NicknameGate title="Before you join">
      {(identity, changeName) => {
        const join = async (e: FormEvent) => {
          e.preventDefault();
          const clean = code.trim().toUpperCase();
          if (clean.length < 4) return;
          setJoining(true);
          try {
            await request("room:join", { code: clean, player: identity });
            router.push(`/room/${clean}`);
          } catch (err) {
            toast((err as Error).message, "error");
            setJoining(false);
          }
        };

        return (
          <div className="mx-auto w-full max-w-md px-4 py-16">
            <h1 className="text-2xl font-bold tracking-tight">Join a battle</h1>
            <p className="mb-6 mt-1 text-sm text-muted">
              Joining as <span className="text-text">{identity.nickname}</span>{" "}
              <button type="button" onClick={changeName} className="text-accent hover:underline">
                change
              </button>
            </p>
            <Card className="animate-rise">
              <CardBody className="p-6">
                <form onSubmit={join} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Room code</Label>
                    <Input
                      id="code"
                      autoFocus
                      maxLength={6}
                      placeholder="7K92F"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="h-14 text-center font-mono text-2xl uppercase tracking-[0.4em]"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" loading={joining} disabled={code.trim().length < 4}>
                    Join room <ArrowRight className="size-4" />
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        );
      }}
    </NicknameGate>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
