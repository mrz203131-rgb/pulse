import type { ReactNode } from "react";

type ProtectedActionFormProps = {
  action: string;
  hiddenFields?: Record<string, string>;
  children: ReactNode;
};

export function ProtectedActionForm({
  action,
  hiddenFields,
  children,
}: ProtectedActionFormProps) {
  return (
    <form action={action} method="post">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      {children}
    </form>
  );
}
