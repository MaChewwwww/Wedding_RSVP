"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  searchInvitationsAction,
  selectInvitationAction,
  getPartyAction,
  loadPassesAction,
  type SearchActionState,
  type SelectInvitationState,
  type SearchCandidateView,
} from "@/app/(guest)/actions";
import {
  submitRsvpAction,
  type RsvpActionState,
} from "@/app/(guest)/rsvp-actions";
import type { PartyView } from "@/server/rsvp/loader";
import type { PassView } from "@/server/qr/pass-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";
import { useEnvelope } from "@/components/envelope/envelope-gate";

const initialSearch: SearchActionState = { status: "idle" };
const initialSelect: SelectInvitationState = { status: "idle" };
const initialRsvp: RsvpActionState = { status: "idle" };

const CHOICES = [
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Not attending" },
  { value: "undecided", label: "Undecided" },
] as const;

export function LookupForm({ rsvpOpen }: { rsvpOpen: boolean }) {
  const router = useRouter();
  const env = useEnvelope();

  const [stage, setStage] = React.useState<"lookup" | "select" | "rsvp" | "success">("lookup");
  const [searchAgain, setSearchAgain] = React.useState(false);
  const [selectedPartyId, setSelectedPartyId] = React.useState<string | null>(null);
  const [searchedName, setSearchedName] = React.useState("");
  const [party, setParty] = React.useState<PartyView | null>(null);
  const [passes, setPasses] = React.useState<PassView[]>([]);
  const [attendanceState, setAttendanceState] = React.useState<string>("undecided");

  React.useEffect(() => {
    if (env && !env.opened) {
      setStage("lookup");
      setSearchAgain(true);
      setSelectedPartyId(null);
      setParty(null);
    }
  }, [env?.opened]);
  const [search, searchFormAction, searchPending] = useActionState(
    searchInvitationsAction,
    initialSearch,
  );
  const [selection, selectFormAction, selectPending] = useActionState(
    selectInvitationAction,
    initialSelect,
  );
  const [rsvpState, rsvpFormAction, rsvpPending] = useActionState(
    submitRsvpAction,
    initialRsvp,
  );


  // Stage 1 -> Stage 2 (results list)
  React.useEffect(() => {
    if (search.status === "results" && !searchAgain) {
      setStage("select");
      setSelectedPartyId((prev) =>
        prev && search.candidates.some((c) => c.partyId === prev)
          ? prev
          : (search.candidates[0]?.partyId ?? null),
      );
    } else {
      setStage("lookup");
    }
  }, [search, searchAgain]);

  // Stage 2 -> Stage 3
  React.useEffect(() => {
    if (selection.status === "success") {
      getPartyAction().then((p) => {
        if (p) {
          setParty(p);
          setAttendanceState(p.guest.rsvpStatus === "pending" ? "undecided" : p.guest.rsvpStatus);
          setStage("rsvp");
        } else {
          setStage("lookup");
        }
      });
    }
  }, [selection]);

  // Stage 3 -> Stage 4
  React.useEffect(() => {
    if (rsvpState.status === "success") {
      loadPassesAction().then((res) => {
        if (res) {
          setPasses(res.passes);
        }
        setStage("success");
      });
    }
  }, [rsvpState]);

  // Screen 4: Success / Pass Panel
  if (stage === "success") {
    const isAttending = attendanceState === "attending" || passes.length > 0;

    const handleDownloadQR = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!passes[0]?.qrDataUrl || !party) return;

      const fileName = `wedding-pass-${party.guest.fullName.replace(/\\s+/g, "-").toLowerCase()}.png`;

      try {
        // Try Native Share API first (bypasses Messenger/Instagram download blocks)
        const res = await fetch(passes[0].qrDataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Wedding Pass",
          });
          return;
        }
      } catch (err) {
        console.warn("Share API failed, falling back to standard download", err);
      }

      // Fallback: Programmatic download
      const link = document.createElement("a");
      link.href = passes[0].qrDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="w-full space-y-2 text-center">
        <motion.div
          className="flex items-center justify-center gap-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10, delay: 0.1 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600/90 pt-0.5">
            RSVP Confirmed
          </p>
        </motion.div>

        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <h3 className="font-display text-xl font-bold text-ink leading-tight">
            Thank you, {party?.guest.fullName}!
          </h3>
          <p className="text-xs text-muted-ink/80">
            {isAttending
              ? "We can't wait to celebrate with you! Here is your wedding pass:"
              : "We've saved your response. We will miss you!"}
          </p>
          <p className="text-[10px] text-rose-600/90 font-semibold pt-1">
            A confirmation email will arrive in a few minutes.
          </p>
          <p className="text-[10px] text-muted-ink/70">
            You can update your RSVP until {site.event.rsvpDeadlineDisplay}.
          </p>
        </motion.div>

        {isAttending && passes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center rounded-2xl border-2 border-dashed border-rose-300/40 bg-white/60 p-3 shadow-sm">
              <p className="font-cursive text-xl text-rose font-bold">{party?.guest.fullName}</p>
              <div className="mt-2 rounded-xl bg-white p-2 border-4 border-rose-100">
                {passes[0]?.qrDataUrl ? (
                  <img
                    src={passes[0].qrDataUrl}
                    alt={`QR wedding pass for ${party?.guest.fullName}`}
                    width={160}
                    height={160}
                    className="h-36 w-36 object-contain"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center text-center text-xs text-muted-ink">
                    QR pass loading...
                  </div>
                )}
              </div>
              <p className="mt-2 text-center text-[10px] font-medium text-muted-ink">
                Present this QR code at check-in.
              </p>
              {passes[0]?.qrDataUrl && (
                <button
                  onClick={handleDownloadQR}
                  type="button"
                  className="mt-2 w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-sm transition-all duration-200 flex items-center justify-center mx-auto cursor-pointer"
                  title="Save QR Pass"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/celebration")}
              className="w-full h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-950/30 font-semibold tracking-[0.1em] text-xs uppercase transition-all duration-200"
            >
              Continue to Wedding Details
            </Button>

            {(() => {
              const formatIcsDate = (isoString: string) => {
                return new Date(isoString).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
              };
              const icsStart = formatIcsDate(site.event.startTime);
              const icsEnd = formatIcsDate(site.event.endTime);
              const eventTitle = `Wedding of ${site.couple.displayName}`;
              const eventDetails = `We can't wait to celebrate with you!\n\nVenue Map: https://maps.app.goo.gl/nYcm1Bf5Ntk8dqP37`;
              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${icsStart}/${icsEnd}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(site.event.location)}`;

              return (
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-full border-2 border-rose-400 text-rose-500 hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 shadow-sm font-semibold tracking-[0.1em] text-xs uppercase transition-all duration-200 flex items-center justify-center"
                >
                  Add to Google Calendar
                </a>
              );
            })()}
          </div>
        </motion.div>
      </div>
    );
  }

  if (stage === "rsvp" && party) {
    return (
      <form action={rsvpFormAction} className="w-full space-y-4">
        <motion.div
          className="text-center select-none space-y-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600/90">
            Attendance Confirmation
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-wide">
            RSVP details for {party.guest.fullName}
          </h3>
        </motion.div>

        {/* Radio choices for attendance */}
        <motion.fieldset
          className="space-y-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-ink/80 block text-center">
            Will you attend?
          </Label>
          <div
            role="radiogroup"
            aria-label={`Attendance for ${party.guest.fullName}`}
            className="flex gap-2"
          >
            {CHOICES.map((choice) => {
              let colorClasses = "";
              if (choice.value === "attending") {
                colorClasses = "border-emerald-200 text-emerald-800 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-100/70 focus-within:ring-emerald-300";
              } else if (choice.value === "declined") {
                colorClasses = "border-rose-200 text-rose-800 has-[:checked]:border-rose-400 has-[:checked]:bg-rose-100/70 focus-within:ring-rose-300";
              } else {
                colorClasses = "border-amber-200 text-amber-800 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-100/70 focus-within:ring-amber-300";
              }

              return (
                <label
                  key={choice.value}
                  className={`flex-1 flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full border-4 bg-white/80 px-2 py-1 text-xs font-semibold transition-all duration-200 focus-within:ring-2 ${colorClasses}`}
                >
                  <input
                    type="radio"
                    name={`attendance:${party.guest.id}`}
                    value={choice.value}
                    checked={attendanceState === choice.value}
                    onChange={(e) => setAttendanceState(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-center">{choice.label}</span>
                </label>
              );
            })}
          </div>
        </motion.fieldset>

        {/* Email Input */}
        <motion.div
          className="space-y-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-ink/80 block text-center">
            Email (optional)
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue=""
            placeholder="you@example.com"
            disabled={rsvpPending}
            className="h-12 text-center text-base px-4 bg-gradient-to-b from-white to-rose-50/40 border-4 border-rose-300 rounded-full focus:bg-rose-50/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/50 transition-all duration-200 text-ink placeholder:text-muted-ink/65"
          />
          <p className="text-[10px] text-center text-emerald-600 font-semibold leading-normal">
            The QR code invitation will be sent here.
          </p>
        </motion.div>

        {rsvpState.status === "error" && (
          <p role="alert" className="text-xs text-rose/95 text-center font-semibold">
            {rsvpState.message}
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="pt-1"
        >
          <Button
            type="submit"
            size="default"
            className="w-full h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-950/30 font-semibold tracking-[0.1em] text-xs uppercase transition-all duration-200"
            disabled={rsvpPending}
          >
            {rsvpPending ? "Saving RSVP..." : "Submit RSVP"}
          </Button>
        </motion.div>
      </form>
    );
  }

  if (stage === "select" && search.status === "results") {
    const candidates: SearchCandidateView[] = search.candidates;
    return (
      <form action={selectFormAction} className="w-full space-y-5">
        <input type="hidden" name="fullName" value={searchedName} />
        <input type="hidden" name="partyId" value={selectedPartyId ?? ""} />

        <motion.div
          className="text-center select-none space-y-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600/90">
            Select Your Name
          </p>
          <h3 className="font-display text-xl font-bold text-ink leading-tight">
            Which one is you?
          </h3>
        </motion.div>

        <div
          role="radiogroup"
          aria-label="Matching invitations"
          className="max-h-[40dvh] space-y-2 overflow-y-auto pr-1"
        >
          {candidates.map((c) => {
            const isSel = selectedPartyId === c.partyId;
            return (
              <label
                key={c.partyId}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white/80 px-4 py-3 text-sm font-semibold text-rose-900 transition-all has-[:checked]:border-rose-400 has-[:checked]:bg-rose-100/70 focus-within:ring-2 focus-within:ring-rose-300"
                style={{ borderColor: isSel ? "#fb7185" : "rgba(251,113,133,0.25)" }}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={c.partyId}
                  checked={isSel}
                  onChange={() => setSelectedPartyId(c.partyId)}
                  className="accent-rose-500"
                />
                <span className="min-w-0 break-words">{c.guestName}</span>
              </label>
            );
          })}
        </div>

        {(selection.status === "invalid" ||
          selection.status === "unconfigured" ||
          selection.status === "error") && (
            <p role="alert" className="rounded-xl bg-rose/5 border border-rose/15 px-3.5 py-2 text-xs text-rose/90 leading-normal text-center">
              {selection.status === "invalid"
                ? "Please pick your name from the list, or search again."
                : selection.status === "unconfigured"
                  ? "The invitation service isn't available yet."
                  : selection.message}
            </p>
          )}

        <div className="space-y-2 pt-1">
          <Button
            type="submit"
            size="default"
            className="w-full h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-950/30 font-semibold tracking-[0.1em] text-xs uppercase transition-all duration-200"
            disabled={selectPending || !selectedPartyId}
          >
            {selectPending ? "Confirming…" : "This is me — continue"}
          </Button>

          <button
            type="button"
            className="min-h-9 w-full text-xs text-muted-ink hover:text-rose-600 transition-colors font-medium flex items-center justify-center gap-1 select-none underline underline-offset-4"
            onClick={() => setSearchAgain(true)}
          >
            Search again
          </button>
        </div>
      </form>
    );
  }

  // Screen 1: Lookup / Search Form
  const message = messageFor(search);

  return (
    <form
      action={searchFormAction}
      onSubmit={(e) => {
        setSearchAgain(false);
        const value = new FormData(e.currentTarget).get("fullName");
        setSearchedName(typeof value === "string" ? value : "");
      }}
      className="w-full space-y-6"
    >
      <motion.div
        className="text-center select-none space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.40 }}
      >
        <h3 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-wide">
          Find Your Invitation
        </h3>
        <p className="text-xs text-muted-ink/80">
          Please enter the full name used on your invitation.
        </p>
        {rsvpOpen && (
          <p className="text-[11px] font-semibold text-rose-600/90 pt-0.5">
            Kindly RSVP by {site.event.rsvpDeadlineDisplay}.
          </p>
        )}
      </motion.div>

      <motion.div
        className="space-y-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.55 }}
      >
        <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-wider text-muted-ink/80 block text-center">
          Full Name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          placeholder="e.g. Maria Santos"
          aria-describedby={message ? "lookup-message" : undefined}
          disabled={searchPending}
          className="h-12 text-center text-base px-4 bg-gradient-to-b from-white to-rose-50/40 border-4 border-rose-300 rounded-full focus:bg-rose-50/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/50 transition-all duration-200 text-ink placeholder:text-muted-ink/65"
        />
      </motion.div>

      {message && (
        <p
          id="lookup-message"
          role="status"
          aria-live="polite"
          className="rounded-xl bg-rose/5 border border-rose/15 px-3.5 py-2 text-xs text-rose/90 leading-normal text-center"
        >
          {message}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.70 }}
      >
        <Button
          type="submit"
          size="default"
          className="w-full h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-950/20 hover:shadow-lg hover:shadow-rose-950/30 font-semibold tracking-[0.1em] text-xs uppercase transition-all duration-200"
          disabled={searchPending}
        >
          {searchPending ? "Searching…" : "Search My Invitation"}
        </Button>
      </motion.div>

      <div className="flex flex-col gap-1 text-[10px] text-muted-ink/80 select-none">
        {!rsvpOpen && (
          <p className="rounded-lg bg-butter-light/50 border border-butter/10 px-2.5 py-1.5 text-[10px] text-center leading-normal">
            RSVPs closed on {site.event.rsvpDeadlineDisplay}. You can still view your pass.
            For help, contact {site.event.supportContact.email}.
          </p>
        )}
      </div>
    </form>
  );
}

function messageFor(state: SearchActionState): string | null {
  switch (state.status) {
    case "empty":
      return "We couldn't find a match. Check the spelling or try the exact name on your invitation.";
    case "rate_limited":
      return "Too many attempts. Please wait a moment and try again.";
    case "closed":
      return "RSVPs are now closed. Please contact us for assistance.";
    case "unconfigured":
      return "The invitation service isn't available yet. Please check back soon.";
    case "error":
      return state.message;
    default:
      return null;
  }
}
