import React from 'react';
import { useTranslation } from 'next-i18next';

import Modal from '../shared/Modal';
import type { Team } from '@prisma/client';
import InviteViaEmail from './InviteViaEmail';
import InviteViaLink from './InviteViaLink';

interface InviteMemberProps {
  team: Team;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const InviteMember = ({ visible, setVisible, team }: InviteMemberProps) => {
  const { t } = useTranslation('common');

  const closeModal = () => {
    setVisible(!visible);
  };

  return (
    <Modal open={visible} close={closeModal}>
      <Modal.Header>{t('invite-new-member')}</Modal.Header>
      <Modal.Description>{t('invite-member-message')}</Modal.Description>
      <Modal.Body>
        <div className="grid grid-cols-1 divide-y py-2">
          <InviteViaEmail
            visible={visible}
            setVisible={setVisible}
            team={team}
          />
          <InviteViaLink
            visible={visible}
            setVisible={setVisible}
            team={team}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InviteMember;
