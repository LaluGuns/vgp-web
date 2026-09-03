import type { Metadata } from "next";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";

export const metadata: Metadata = {
  title: "Delete your Flow account",
  description: "Delete your Flow account and account-linked data from the web or the Flow app.",
  robots: { index: true, follow: true },
};

export default function DeleteAccountPage() {
  return <DeleteAccountPanel />;
}
