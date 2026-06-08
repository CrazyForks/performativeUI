export interface PropSpec {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  desc: string;
}

export function PropsTable({ props }: { props: PropSpec[] }) {
  if (!props.length) return null;
  return (
    <table className="props">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            <td>
              {p.name}
              {p.required && <span className="req">*</span>}
            </td>
            <td>{p.type}</td>
            <td>{p.default ?? "-"}</td>
            <td>{p.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
