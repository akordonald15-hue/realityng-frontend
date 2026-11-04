import Link from "next/link";
import type { KnowledgeAnswer } from "@/lib/api/assistant";

export function KnowledgeSources({ answer }: { answer?: KnowledgeAnswer }) {
  if (!answer) return null;
  return (
    <div className="mt-2 space-y-1 text-xs">
      {answer.sources.map((source) => (
        <p key={source.id}>
          Source: {source.title} · {source.version}
        </p>
      ))}
      {answer.links
        .filter(
          (link) =>
            link.path.startsWith("/") && !link.path.startsWith("//") && !/[\\\s]/.test(link.path),
        )
        .map((link) => (
          <Link key={link.path} href={link.path} className="block underline">
            {link.label}
          </Link>
        ))}
    </div>
  );
}
