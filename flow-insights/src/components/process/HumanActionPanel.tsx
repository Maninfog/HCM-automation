import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDecisionMutation } from "@/lib/api";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PathBadge } from "@/components/common/PathBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function HumanActionPanel({ candidateId, disabled }: { candidateId: string; disabled?: boolean }) {
  const [note, setNote] = useState("");
  const m = useDecisionMutation(candidateId);

  async function run(decision: "interview" | "hire" | "reject") {
    try {
      await m.mutateAsync({ decision, note: note.trim() || undefined });
      toast.success(`Decision: ${decision}`, { description: "Robot follow-up wurde getriggert." });
      setNote("");
    } catch {
      /* error toast handled in mutation */
    }
  }

  const busy = m.isPending;

  return (
    <section
      aria-label="Human action panel"
      className="rounded-md border-2 border-path-human/30 bg-card p-4 shadow-elevated"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PathBadge path="human" size="md" />
          <h3 className="text-sm font-semibold">Human Decision Required</h3>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Deine Entscheidung wird via Webhook an n8n geschickt und löst den nächsten Robot-Schritt aus.
      </p>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional: Notiz (wird im Event-Payload mitgeschickt)"
        rows={2}
        className="mt-3 text-sm"
        disabled={disabled || busy}
      />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          disabled={disabled || busy}
          onClick={() => run("interview")}
          className="border-status-info/40 text-status-info hover:bg-status-info-soft hover:text-status-info"
        >
          <Calendar className="h-4 w-4" />
          Interview
        </Button>

        <Button
          disabled={disabled || busy}
          onClick={() => run("hire")}
          className="bg-status-success text-white hover:bg-status-success/90"
        >
          <CheckCircle2 className="h-4 w-4" />
          Hire
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={disabled || busy}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bewerber ablehnen?</AlertDialogTitle>
              <AlertDialogDescription>
                Es wird automatisch eine Absage-Mail über n8n gesendet. Diese Aktion kann nicht zurückgenommen werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => run("reject")}>Ablehnen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
