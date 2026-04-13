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
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold"
              >
                {h.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-gray-200 px-4 py-2">
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
