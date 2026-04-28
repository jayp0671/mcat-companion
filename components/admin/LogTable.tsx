type AiGenerationLog = {
  id: string;
  created_at: string;
  kind: string;
  status: string | null;
  provider?: string | null;
  model?: string | null;
};

export function LogTable({ logs }: { logs: AiGenerationLog[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-3">Time</th>
            <th className="p-3">Kind</th>
            <th className="p-3">Status</th>
            <th className="p-3">Provider</th>
            <th className="p-3">Model</th>
          </tr>
        </thead>
        <tbody>
          {(logs ?? []).map((log) => (
            <tr key={log.id} className="border-t">
              <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
              <td className="p-3">{log.kind}</td>
              <td className="p-3">{log.status ?? "unknown"}</td>
              <td className="p-3">{log.provider ?? "unknown"}</td>
              <td className="p-3">{log.model ?? "unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
