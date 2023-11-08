import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import Modal from './Modal';

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
    <Modal open={visible} close={onCancel}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body className="text-sm leading-6">{children}</Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={onCancel} size="md">
          {cancelText || t('cancel')}
        </Button>
        <Button type="button" color="error" onClick={handleConfirm} size="md">
          {confirmText || t('delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
