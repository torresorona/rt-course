import { readFileSync } from "fs";
import { join } from "path";

interface DataTableProps {
  file: string;
}

export default function DataTable({ file }: DataTableProps) {
  const csvPath = join(process.cwd(), "content", file);
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => line.split(","));

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-sand-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-sand-100">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-sand-600"
              >
                {h.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {rows.map((row, i) => (
            <tr key={i} className="bg-white transition-colors hover:bg-sand-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sand-800">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
