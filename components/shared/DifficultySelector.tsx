import { Select } from "@/components/ui/select";
export function DifficultySelector(props: { name?: string; defaultValue?: string }) {
  return (
    <Select name={props.name ?? "difficulty"} defaultValue={props.defaultValue ?? "3"}>
      {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} - {n === 1 ? "Easy" : n === 5 ? "Hard" : "Medium"}</option>)}
    </Select>
  );
}
