import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <Modal.Header className="font-bold">{title}</Modal.Header>
      <Modal.Body>
        <div className="mt-2 flex flex-col space-y-2">{children}</div>
      </Modal.Body>
      <Modal.Actions>
        <Button type="button" color="error" onClick={onConfirm}>
          {confirmText || t('delete')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelText || t('cancel')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ConfirmationDialog;
