// Test-only host: real Core transport, controlled resourceId, no Entry events.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CircuitLab } from "../src/CircuitLab";
import type { Resource, Transport } from "../src/model";
const request: Transport = async <T,>(
  path: string,
  body?: unknown,
  key?: string,
): Promise<T> => {
  const response = await fetch("/study" + path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(data.error), { status: response.status });
  return data;
};
function Host() {
  const [resource, setResource] = useState<Resource | null>(null);
  return (
    <CircuitLab
      editionId="s19-dc"
      request={request}
      resourceId={resource?.id}
      revisionId={resource?.revisionId}
      onResource={setResource}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Host />);
