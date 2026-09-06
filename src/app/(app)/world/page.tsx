import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** The old world map is now the Atlas: time and place together. */
export default function WorldRedirect() {
  redirect(routes.atlas);
}
