// components/specific/EmailModal.tsx
"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Button } from "@/components/prebuilt/Button"; // Fixed import path
import { useMobile } from "@/hooks/useMobileHook";
import { ClipboardCopyIcon, CheckIcon } from "@radix-ui/react-icons";

const EmailModalButton = () => {
  const [copied, setCopied] = useState(false);
  const isMobile = useMobile();
  const email = "pathfinder.cse115a@gmail.com";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (isMobile) {
    return (
      <Button  size="lg" asChild>
        <Link href={`mailto:${email}`} target="_blank">
          📧 Register your organization
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      onClick={copyToClipboard}
      className="transition-all duration-200"
    >
      {copied ? (
        <Fragment>
          <CheckIcon className="animate-in fade-in zoom-in" />
          Copied to clipboard!
        </Fragment>
      ) : (
        <Fragment>
          <ClipboardCopyIcon />
          Register your organization
        </Fragment>
      )}
    </Button>
  );
};

export default EmailModalButton;
