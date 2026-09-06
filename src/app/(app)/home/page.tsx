import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** The first meaningful experience is the timeline. */
export default function HomeRedirect() {
  redirect(routes.timeline);
}
