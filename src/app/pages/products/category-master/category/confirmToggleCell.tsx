import { ComponentProps, ReactNode, useState } from "react";

import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { Button } from "@/components/ui";

type ButtonProps = ComponentProps<typeof Button>;

interface ConfirmToggleCellProps {
  description: string;
  successTitle: string;
  /** return true on success, false on failure (error toast is shown by the handler) */
  onConfirm: () => Promise<boolean> | boolean;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  children: ReactNode;
}

export function ConfirmToggleCell({
  description,
  successTitle,
  onConfirm,
  variant,
  color,
  children,
}: ConfirmToggleCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const messages: ConfirmMessages = {
    pending: { description },
    success: { title: successTitle },
  };

  const handleClose = () => {
    setOpen(false);
    setSuccess(false);
  };

  const handleOk = async () => {
    setLoading(true);
    const ok = await onConfirm();
    setLoading(false);
    if (ok) setSuccess(true);
    else handleClose();
  };

  return (
    <>
      <Button
        variant={variant}
        color={color}
        className="h-8 rounded-full px-3 text-xs"
        onClick={() => {
          setSuccess(false);
          setOpen(true);
        }}
      >
        {children}
      </Button>

      <ConfirmModal
        show={open}
        onClose={handleClose}
        messages={messages}
        onOk={handleOk}
        confirmLoading={loading}
        state={success ? "success" : "pending"}
      />
    </>
  );
}