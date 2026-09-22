import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ImageIcon, LayoutTemplate, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useInvitationTemplates } from "@/queries/useInvitationQueries";
import { resolveMediaUrl } from "@/lib/media";

export default function InvitationTemplates() {
  const { data: templates, isLoading, isError } = useInvitationTemplates();

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-pink)]">
            Invitations
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">
            Templates
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Designs included with your current plan.
          </p>
        </div>

        {isError && (
          <p className="mt-10 text-center text-sm text-rose-600">
            Couldn't load templates right now. Please refresh the page.
          </p>
        )}

        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="p-5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && templates && templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 flex flex-col items-center px-6 py-16 text-center"
          >
            <Card className="w-full max-w-md p-10">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
                <LayoutTemplate className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-[var(--brand-navy)]">
                Your current plan doesn't include any invitation templates yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Upgrade to a plan with invitation templates to start designing beautiful
                invites for your guests.
              </p>
              <Link
                to="/pricing"
                className={buttonVariants({ variant: "primary", className: "mt-6" })}
              >
                <Sparkles className="h-4 w-4" />
                View plans
              </Link>
            </Card>
          </motion.div>
        )}

        {!isLoading && !isError && templates && templates.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const previewUrl = resolveMediaUrl(template.preview_image);

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35 }}
                >
                  <Card className="card-hover-lift overflow-hidden">
                    <div className="flex aspect-[3/4] w-full items-center justify-center bg-slate-100">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={template.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-semibold text-[var(--brand-navy)]">{template.name}</p>
                      {template.description && (
                        <p className="mt-1.5 text-sm text-slate-500">{template.description}</p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
