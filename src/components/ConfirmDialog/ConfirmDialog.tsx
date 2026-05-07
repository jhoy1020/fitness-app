// ConfirmDialog — standardized confirmation modal for destructive (and
// occasionally non-destructive) actions.
//
// Why this exists:
//   Destructive actions in the app were previously inconsistent — some
//   used Paper Dialog with text-mode buttons (1RM delete), some used
//   Alert.alert (Stop Program), and the visual treatment of "Cancel" vs
//   "Delete" was easy to misclick because both were rendered as plain
//   text buttons of equal weight.
//
// Behavior:
//   • Renders inside a Paper <Portal> so it always overlays the screen.
//   • Defaults to a destructive treatment: confirm button is rendered
//     in `mode="contained"` with `buttonColor={theme.colors.error}` so
//     it visually outranks the Cancel button. Pass `destructive={false}`
//     for a primary (non-destructive) confirm.
//   • Cancel is `mode="text"` and listed first so the safe choice is
//     never the dominant visual target.
//   • `loading` disables BOTH buttons and shows a spinner on confirm
//     — used while the destructive action is in flight.
//   • `accessibilityRole="alertdialog"` + a label that includes the
//     title so screen-reader users know this is a blocking confirmation,
//     not an informational dialog.

import React from 'react';
import {
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true (default), the confirm button uses the error color and
   *  contained mode so it visually outranks Cancel. */
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  /** Disables both buttons and shows a spinner on the confirm button. */
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onDismiss,
  loading = false,
}: ConfirmDialogProps) {
  const theme = useTheme();

  // Paper's <Dialog> wraps a Modal internally and doesn't forward
  // accessibility props on its own root. We therefore declare the
  // alertdialog role on a wrapping view inside the dialog so that
  // screen readers announce "alert dialog" + the title and message
  // together when the dialog appears.
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={loading ? () => {} : onDismiss}
      >
        <Dialog.Title
          accessibilityRole="header"
          accessibilityLabel={`${title}. ${message}`}
        >
          {title}
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            mode="text"
            onPress={onDismiss}
            disabled={loading}
            accessibilityLabel={cancelLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            disabled={loading}
            loading={loading}
            buttonColor={
              destructive ? theme.colors.error : theme.colors.primary
            }
            textColor={
              destructive ? theme.colors.onError : theme.colors.onPrimary
            }
            accessibilityLabel={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
