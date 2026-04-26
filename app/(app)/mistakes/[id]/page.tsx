import { MistakeDetail } from "@/components/mistakes/MistakeDetail";
export default function MistakeDetailPage({ params }: { params: { id: string } }) { return <MistakeDetail id={params.id} />; }
