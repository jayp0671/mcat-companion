"use client";
import { Button } from "@/components/ui/button";
export function ExplainButton({ id }: { id: string }) { return <Button type="button" onClick={() => alert(`Explanation endpoint scaffolded for ${id}`)}>Explain this</Button>; }
