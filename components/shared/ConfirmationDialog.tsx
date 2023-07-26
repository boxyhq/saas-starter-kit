import { useTranslation } from 'next-i18next';
import { Button, Modal } from 'react-daisyui';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
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

  const handleConfirm = async () => {
    await onConfirm();
    onCancel();
  };

  return (
    <Modal open={visible}>
      <Modal.Header className="font-semibold">{title}</Modal.Header>
      <Modal.Body>
        <div className="mt-2 flex flex-col space-y-2 text-sm text-gray-600 leading-6">
          {children}
        </div>
      </Modal.Body>
      <Modal.Actions>
        <Button type="button" color="error" onClick={handleConfirm} size="md">
          {confirmText || t('delete')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} size="md">
          {cancelText || t('cancel')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ConfirmationDialog;
