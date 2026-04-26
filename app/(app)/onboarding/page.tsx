import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
export default function OnboardingPage() { return <Card className="max-w-2xl"><CardTitle>Set up profile</CardTitle><CardContent className="mt-4"><form className="grid gap-4"><Input name="display_name" placeholder="Name" /><Input name="target_test_date" type="date" /><Input name="target_score" type="number" placeholder="Target score" /><Input name="hours_per_week" type="number" placeholder="Study hours per week" /><Button>Save profile</Button></form></CardContent></Card>; }
