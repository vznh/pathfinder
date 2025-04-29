// components/specific/EmailModal.tsx
import Link from "next/link";
import { Button } from "../prebuilt/Button";

const EmailModalButton = () => {
  return (
    <Button variant={"destructive"}>
      <Link href="mailto:pathfinder.cse115a@gmail.com" target="_blank">
        📧 Register your organization
      </Link>
    </Button>
  );
};

export default EmailModalButton;
