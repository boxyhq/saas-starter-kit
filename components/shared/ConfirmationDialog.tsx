import { Button, Modal } from 'react-daisyui';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

const ConfirmationDialog = ({
  title,
  children,
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConfirmationDialogProps) => {
  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">{title}</Modal.Header>
      <Modal.Body>
        <div className="mt-2 flex flex-col space-y-2">{children}</div>
      </Modal.Body>
      <Modal.Actions>
        <Button type="button" color="error" onClick={onConfirm}>
          {confirmText || 'Delete'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelText || 'Cancel'}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ConfirmationDialog;
